import { ethers } from "hardhat";

async function signerInfo() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const weiAmount = (await deployer.getBalance()).toString();

  console.log("Account balance:", await ethers.utils.formatEther(weiAmount));
}

async function deployOracle() {
  const Oracle = await ethers.getContractFactory("ChainlinkEthUsd");
  const oracle = await Oracle.deploy();
  await oracle.deployed();

  console.log(`Oracle deployed to ${oracle.address}`);
}

async function main() {
  await signerInfo();

  const ArkaERC20 = await ethers.getContractFactory("ArkaERC20");
  const ArkaMaster = await ethers.getContractFactory("ArkaMaster");
  const arkaERC20 = await ArkaERC20.deploy();
  await arkaERC20.deployed();

  const arkaMaster = await ArkaMaster.deploy(arkaERC20.address);
  await arkaMaster.deployed();

  await arkaERC20.setArkaMaster(arkaMaster.address);

  // (${ethers.utils.getAddress(arkaERC20.address)})
  console.log(`ArkaERC20 deployed to ${arkaERC20.address}`);
  console.log(`ArkaMaster deployed to ${arkaMaster.address}`);

  await deployOracle();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
