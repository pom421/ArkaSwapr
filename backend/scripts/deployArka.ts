import { ethers } from "hardhat";

// Addresses ETH / USD for Chainlink.
const CHAIN_LINK_ADDRESS = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419" // Mainnet
// const CHAIN_LINK_ADDRESS = "0x694AA1769357215DE4FAC081bf1f309aDC325306"; // Sepolia

async function signerInfo() {
  const [owner] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", owner.address);

  const weiAmount = (await owner.getBalance()).toString();

  console.log("Account balance:", await ethers.utils.formatEther(weiAmount));
}

async function deployOracle() {
  const Oracle = await ethers.getContractFactory("ChainlinkEthUsd");
  const oracle = await Oracle.deploy(CHAIN_LINK_ADDRESS);
  await oracle.deployed();

  console.log(`Oracle deployed to ${oracle.address}`);

  return oracle
}

async function deployArkaERC20() {
  const ArkaERC20 = await ethers.getContractFactory("ArkaERC20");
  const arkaERC20 = await ArkaERC20.deploy();
  await arkaERC20.deployed();

  console.log(`ArkaERC20 deployed to ${arkaERC20.address}`);

  return arkaERC20
}

async function deployArkaMaster(arkaERC20Address: string, oracleAddress: string) {
  const ArkaMaster = await ethers.getContractFactory("ArkaMaster");
  const arkaMaster = await ArkaMaster.deploy(arkaERC20Address, oracleAddress);
  await arkaMaster.deployed();
  console.log(`ArkaMaster deployed to ${arkaMaster.address}`);

  return arkaMaster
}

async function main() {
  await signerInfo();

  const oracle = await deployOracle();

  const arkaERC20 = await deployArkaERC20()

  const arkaMaster = await deployArkaMaster(arkaERC20.address, oracle.address)

  await arkaERC20.setArkaMaster(arkaMaster.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
