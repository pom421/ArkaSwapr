import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

const CHAIN_LINK_ADDRESS = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"; // Mainnet

export enum InteractionType {
  unset = 0,
  love,
  like,
  unlike,
  toxic,
}

const ONE_HOUR = 3600

describe("ArkaMaster", function () {
  async function deployArkaContracts() {
    // Contracts are deployed using the first signer/account by default
    const [owner, account1] = await ethers.getSigners();

    // Oracle
    const Oracle = await ethers.getContractFactory("ChainlinkEthUsd");
    const oracle = await Oracle.deploy(CHAIN_LINK_ADDRESS);
    await oracle.deployed();

    // ArkaERC20
    const ArkaERC20 = await ethers.getContractFactory("ArkaERC20");
    const arkaERC20 = await ArkaERC20.deploy();
    await arkaERC20.deployed();

    // ArkaMaster
    const ArkaMaster = await ethers.getContractFactory("ArkaMaster");
    const arkaMaster = await ArkaMaster.deploy(
      arkaERC20.address,
      oracle.address
    );
    await arkaMaster.deployed();

    await arkaERC20.setArkaMaster(arkaMaster.address);

    const priceForProposalInWei = await arkaMaster.getPriceForProposalInWei();

    return {
      owner,
      account1,
      oracle,
      arkaERC20,
      arkaMaster,
      priceForProposalInWei,
    };
  }
  async function deployArkaContractsWithProposals() {
    const {
      owner,
      account1,
      oracle,
      arkaERC20,
      arkaMaster,
      priceForProposalInWei,
    } = await loadFixture(deployArkaContracts);

    const lastId = await arkaMaster.getResourceLength();

    const price = await arkaMaster.getPriceForProposalInWei();

    const description1 = "FooBar site";
    const description2 = "AbraCadabra site";
    const url1 = "https://foobar.com";
    const url2 = "https://abracada.bra";

    await arkaMaster.connect(account1).proposeResource(description1, url1, {
      value: price,
    });

    await arkaMaster.connect(account1).proposeResource(description2, url2, {
      value: price,
    });

    // Here, we have fund the contract with the value of 2 proposals price

    return {
      owner,
      account1,
      oracle,
      arkaERC20,
      arkaMaster,
      priceForProposalInWei,
    };
  }

  describe("Oracle tests", function () {
    it("gets a non 0 result for EHT USD price, test integration chain link", async function () {
      const { arkaERC20, arkaMaster, oracle } = await loadFixture(
        deployArkaContracts
      );

      expect(await arkaMaster.getPriceForProposalInWei()).to.not.equal(0);
    });
  });
  describe("ArkaMaster tests", function () {
    const description = "FooBar site";
    const url = "https://foobar.com";

    describe("ArkaMaster.proposeResource", function () {
      it("proposes correctly a resource, test storage", async function () {
        const { arkaERC20, arkaMaster, oracle, owner, priceForProposalInWei } =
          await loadFixture(deployArkaContracts);

        const lastId = await arkaMaster.getResourceLength();

        await arkaMaster.proposeResource(description, url, {
          value: priceForProposalInWei,
        });
        const resource = await arkaMaster.resources(lastId);

        expect(resource.description).to.equal(description);
        expect(resource.url).to.equal(url);
      });

      it("proposes correctly a resource, test event", async function () {
        const { arkaERC20, arkaMaster, oracle, owner, priceForProposalInWei } =
          await loadFixture(deployArkaContracts);

        const lastId = await arkaMaster.getResourceLength();

        await expect(
          arkaMaster.proposeResource(description, url, {
            value: priceForProposalInWei,
          })
        )
          .to.emit(arkaMaster, "ResourceProposed")
          .withArgs(description, url, anyValue);
      });

      it("proposes incorrectly a resource with a lower price than asked, test revert", async function () {
        const { arkaERC20, arkaMaster, oracle, owner, priceForProposalInWei } =
          await loadFixture(deployArkaContracts);

        const lastId = await arkaMaster.getResourceLength();

        await expect(
          arkaMaster.proposeResource(description, url, {
            value: priceForProposalInWei.sub(1),
          })
        ).to.be.revertedWith("You need to pay the price of 7 days of hosting");
      });
    });

    describe("ArkaMaster.interact", function () {
      it("interacts correctly with a resource, test storage", async function () {
        const { arkaMaster, account1 } = await loadFixture(deployArkaContracts);

        const lastId = await arkaMaster.getResourceLength();

        const price = await arkaMaster.getPriceForProposalInWei();

        await arkaMaster.proposeResource(description, url, {
          value: price,
        });

        await arkaMaster
          .connect(account1)
          .interact(lastId, InteractionType.like);

        expect(
          await arkaMaster.getInteraction(lastId, account1.address)
        ).to.equal(InteractionType.like);
      });
      it("interacts correctly with a resource, test event", async function () {
        const { arkaMaster, account1 } = await loadFixture(deployArkaContracts);

        const lastId = await arkaMaster.getResourceLength();

        const price = await arkaMaster.getPriceForProposalInWei();

        await arkaMaster.proposeResource(description, url, {
          value: price,
        });

        await arkaMaster
          .connect(account1)
          .interact(lastId, InteractionType.like);

        expect(await arkaMaster.getInteraction(lastId, account1.address))
          .to.emit(arkaMaster, "Interaction")
          .withArgs(lastId, account1.address, InteractionType.like);
      });
      it("interacts correctly with a resource, test mint", async function () {
        const { arkaERC20, arkaMaster, account1 } = await loadFixture(
          deployArkaContracts
        );

        const lastId = await arkaMaster.getResourceLength();

        const price = await arkaMaster.getPriceForProposalInWei();

        await arkaMaster.proposeResource(description, url, {
          value: price,
        });

        await arkaMaster
          .connect(account1)
          .interact(lastId, InteractionType.like);

        expect(await arkaERC20.balanceOf(account1.address)).to.be.equal(
          ethers.utils.parseEther("2")
        );
      });
      it("interacts incorrectly with a resource because already have interaction, test require", async function () {
        const { arkaMaster, account1 } = await loadFixture(deployArkaContracts);

        const lastId = await arkaMaster.getResourceLength();

        const price = await arkaMaster.getPriceForProposalInWei();

        await arkaMaster.proposeResource(description, url, {
          value: price,
        });

        await arkaMaster
          .connect(account1)
          .interact(lastId, InteractionType.like);

        await expect(
          arkaMaster.connect(account1).interact(lastId, InteractionType.like)
        ).to.be.revertedWith("You already add interaction on this resource");
      });
    });
  });

  describe("ArkaMaster.startNewContract", function () {
    it("starts correctly a contract, test storage", async function () {
      const { arkaMaster, account1, priceForProposalInWei } = await loadFixture(
        deployArkaContractsWithProposals
      );
      expect(await arkaMaster.currentStake()).to.be.equal(
        ethers.constants.AddressZero
      );

      await arkaMaster.startNewStake(priceForProposalInWei);

      expect(await arkaMaster.currentStake()).to.not.be.equal(
        ethers.constants.AddressZero
      );
    });
    it("starts correctly a contract, test event", async function () {
      const { arkaMaster, account1, priceForProposalInWei } = await loadFixture(
        deployArkaContractsWithProposals
      );

      await expect(arkaMaster.startNewStake(priceForProposalInWei))
        .to.emit(arkaMaster, "NewStake")
        .withArgs(priceForProposalInWei);
    });
    it("starts incorrectly a contract bc previous stake exists, test require", async function () {
      const { arkaMaster, priceForProposalInWei } = await loadFixture(
        deployArkaContractsWithProposals
      );

      await arkaMaster.startNewStake(priceForProposalInWei);
      await expect(
        arkaMaster.startNewStake(priceForProposalInWei)
      ).to.be.revertedWith("A stake is already running");
    });
    it("starts incorrectly a contract bc amount is 0, test require", async function () {
      const { arkaMaster } = await loadFixture(
        deployArkaContractsWithProposals
      );

      await expect(arkaMaster.startNewStake(0)).to.be.revertedWith(
        "Amount must be > 0"
      );
    });
    it("starts incorrectly a contract bc amount is 0, test require", async function () {
      const { arkaMaster, priceForProposalInWei } = await loadFixture(
        deployArkaContracts // there is no proposal so no funds in contract to start a stake
      );

      await expect(
        arkaMaster.startNewStake(priceForProposalInWei)
      ).to.be.revertedWith("Not enough funds");
    });
  });

  describe("ArkaMaster.endNewContract", function () {
    it("ends correctly a contract, test storage", async function () {
      const { arkaMaster, priceForProposalInWei } = await loadFixture(
        deployArkaContractsWithProposals
      );

      expect(await ethers.provider.getBalance(arkaMaster.address)).to.be.equal(
        priceForProposalInWei.mul(2)
      );

      await arkaMaster.startNewStake(priceForProposalInWei);

      expect(await ethers.provider.getBalance(arkaMaster.address)).to.be.equal(
        priceForProposalInWei
      );

      // Increase time to 1 hour to be after the duration of the stake.
      await time.increase(ONE_HOUR);

      await arkaMaster.endCurrentStake();

      expect(await ethers.provider.getBalance(arkaMaster.address)).to.be.equal(
        priceForProposalInWei.mul(2)
      );
    });
    it("ends correctly a contract, test storage on currentStake reference", async function () {
      const { arkaMaster, priceForProposalInWei } = await loadFixture(
        deployArkaContractsWithProposals
      );

      await arkaMaster.startNewStake(priceForProposalInWei);

      // Increase time to 1 hour to be after the duration of the stake.
      await time.increase(ONE_HOUR);

      await arkaMaster.endCurrentStake();

      expect(await arkaMaster.currentStake()).to.be.equal(
        ethers.constants.AddressZero
      );
    });
    it("ends correctly a contract, test event", async function () {
      const { arkaMaster, priceForProposalInWei } = await loadFixture(
        deployArkaContractsWithProposals
      );

      await arkaMaster.startNewStake(priceForProposalInWei);

      // Increase time to 1 hour to be after the duration of the stake.
      await time.increase(ONE_HOUR);

      await expect(arkaMaster.endCurrentStake()).to.emit(
        arkaMaster,
        "EndStake"
      );
    });
    it("ends incorrectly a contract bc a current is already here, test require", async function () {
      const { arkaMaster } = await loadFixture(
        deployArkaContractsWithProposals
      );

      await expect(arkaMaster.endCurrentStake()).to.be.revertedWith(
        "No stake is running"
      );
    });
    it("ends incorrectly a contract bc the current stake is not finished, test require", async function () {
      const { arkaMaster, priceForProposalInWei } = await loadFixture(
        deployArkaContractsWithProposals
      );

      await arkaMaster.startNewStake(priceForProposalInWei);

      await expect(arkaMaster.endCurrentStake()).to.be.revertedWith(
        "Stake is not finished"
      );
    });
  });
});
