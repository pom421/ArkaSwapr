import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";

const CHAIN_LINK_ADDRESS = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"; // Mainnet

export enum InteractionType {
  unset = 0,
  love,
  like,
  unlike,
  toxic,
}

const ONE_HOUR = 3600;

describe("ArkaStaking", function () {
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

  async function deployArkaContractsWithNewStake() {
    const {
      owner,
      account1,
      oracle,
      arkaERC20,
      arkaMaster,
      priceForProposalInWei,
    } = await loadFixture(deployArkaContracts);

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

    // Account 1 has 2 interactions so its balance is 4 ARKA.
    await arkaMaster.connect(account1).interact(0, 1);

    await arkaMaster.connect(account1).interact(1, 1);

    // Here, we have fund the contract with the value of 2 proposals price

    await arkaMaster.startNewStake(priceForProposalInWei);

    const ArkaStaking = await ethers.getContractFactory("ArkaStaking");

    const arkaStaking = ArkaStaking.attach(await arkaMaster.currentStake());

    return {
      owner,
      account1,
      oracle,
      arkaERC20,
      arkaMaster,
      arkaStaking,
      priceForProposalInWei,
    };
  }

  describe("ArkaStaking.deposit", function () {
    it("deposits incorrectly with zero ARKA, test storage", async function () {
      const { arkaERC20, arkaMaster, account1 } = await loadFixture(
        deployArkaContractsWithNewStake
      );

      const ArkaStaking = await ethers.getContractFactory("ArkaStaking");

      const arkaStaking = ArkaStaking.attach(await arkaMaster.currentStake());

      await expect(arkaStaking.connect(account1).deposit(0)).to.be.revertedWith(
        "amount = 0"
      );
    });
    it("deposits correctly, test storage", async function () {
      const { arkaStaking, arkaERC20, account1 } = await loadFixture(
        deployArkaContractsWithNewStake
      );

      expect(await arkaERC20.balanceOf(account1.address)).to.be.equal(
        ethers.utils.parseEther("4")
      );

      const initialAllowance = await arkaERC20.allowance(
        account1.address,
        arkaStaking.address
      );

      expect(initialAllowance).to.be.eq(0);

      // Account1 approves next to arkaERC20 contract to spend 2 ARKA.
      await arkaERC20
        .connect(account1)
        .approve(arkaStaking.address, ethers.utils.parseEther("2.5"));

      const newAllowance = await arkaERC20.allowance(
        account1.address,
        arkaStaking.address
      );

      expect(newAllowance).to.be.eq(ethers.utils.parseEther("2.5"));

      await arkaStaking.connect(account1).deposit(parseEther("2.5"));

      expect(await arkaERC20.balanceOf(account1.address)).to.be.equal(
        parseEther("1.5")
      );

      expect(await arkaStaking.stakeBalanceOf(account1.address)).to.be.eq(
        parseEther("2.5")
      );

      expect(await arkaStaking.totalSupply()).to.be.eq(parseEther("2.5"));
    });

    it("deposits correctly, test event", async function () {
      const { arkaStaking, arkaERC20, account1 } = await loadFixture(
        deployArkaContractsWithNewStake
      );

      expect(await arkaERC20.balanceOf(account1.address)).to.be.equal(
        ethers.utils.parseEther("4")
      );

      // Account1 approves next to arkaERC20 contract to spend 2 ARKA.
      await arkaERC20
        .connect(account1)
        .approve(arkaStaking.address, ethers.utils.parseEther("2.5"));

      await expect(arkaStaking.connect(account1).deposit(parseEther("2.5")))
        .to.emit(arkaStaking, "Deposit")
        .withArgs(account1.address, parseEther("2.5"));
    });
  });

  describe("ArkaStaking.withdraw", function () {
    it("withdraw correctly, test storage", async function () {
      const { arkaStaking, arkaERC20, account1 } = await loadFixture(
        deployArkaContractsWithNewStake
      );

      // Account1 approves next to arkaERC20 contract to spend 2 ARKA.
      await arkaERC20
        .connect(account1)
        .approve(arkaStaking.address, ethers.utils.parseEther("2.5"));

      await arkaStaking.connect(account1).deposit(parseEther("2.5"));

      await time.increase(ONE_HOUR);

      await arkaStaking.connect(account1).withdraw();

      expect(await arkaERC20.balanceOf(account1.address)).to.be.equal(
        parseEther("4")
      );

      expect(await arkaStaking.totalSupply()).to.be.eq(0);

      expect(await arkaStaking.stakeBalanceOf(account1.address)).to.be.eq(0);
    });
    it("withdraw correctly, test event", async function () {
      const { arkaStaking, arkaERC20, account1 } = await loadFixture(
        deployArkaContractsWithNewStake
      );

      // Account1 approves next to arkaERC20 contract to spend 2 ARKA.
      await arkaERC20
        .connect(account1)
        .approve(arkaStaking.address, ethers.utils.parseEther("2.5"));

      await arkaStaking.connect(account1).deposit(parseEther("2.5"));

      await time.increase(ONE_HOUR);

      await expect(arkaStaking.connect(account1).withdraw())
        .to.emit(arkaStaking, "Withdraw")
        .withArgs(account1.address);
    });
  });
});
