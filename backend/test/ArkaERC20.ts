import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

const CHAIN_LINK_ADDRESS = "0x694AA1769357215DE4FAC081bf1f309aDC325306"; // Sepolia

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

    return { owner, account1, oracle, arkaERC20, arkaMaster };
  }

  describe("ArkaERC20 tests", function () {
    it("sets correctly the address of ArkaMaster, test storage", async function () {
      const { arkaERC20, arkaMaster } = await loadFixture(deployArkaContracts);
      await arkaERC20.setArkaMaster(arkaMaster.address);

      expect(await arkaERC20.arkaMaster()).to.equal(arkaMaster.address);
    });
    it("sets incorrectly the arkaMaster's address but he is not owner, test revert", async function () {
      const { account1, arkaERC20, arkaMaster } = await loadFixture(
        deployArkaContracts
      );

      await expect(
        arkaERC20.connect(account1).setArkaMaster(arkaMaster.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("has the right initial supply, test storage", async function () {
      const { arkaERC20 } = await loadFixture(deployArkaContracts);

      expect(await arkaERC20.totalSupply()).to.equal(
        BigNumber.from("1000000000000000000")
      );
    });
    // Problem because arkaMaster contract has no eth balance to mint. Need to test it in ArkaMaster.interact.
    // it("Should mint ArkaERC20 only for ArkaMaster address", async function () {
    //   const { account1, arkaERC20, arkaMaster } = await loadFixture(
    //     deployArkaContracts
    //   );
    //   await arkaERC20.setArkaMaster(arkaMaster.address);

    //    expect(await arkaERC20.balanceOf(account1.address)).to.equal(0);

    //   const arkaMasterSigner = await ethers.getImpersonatedSigner(arkaMaster.address);

    //   await arkaERC20.connect(arkaMasterSigner).mintArka(account1.address, 5);

    //    expect(await arkaERC20.balanceOf(account1.address)).to.equal(0);
    // });
  });
});
