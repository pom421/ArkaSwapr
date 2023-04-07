import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
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
        const { arkaERC20, arkaMaster, oracle, account1, owner } =
          await loadFixture(deployArkaContracts);

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
    });
  });
});
