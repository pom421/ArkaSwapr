import { ethers } from "hardhat";

async function signerInfo() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const weiAmount = (await deployer.getBalance()).toString();
  
  console.log("Account balance:", (await ethers.utils.formatEther(weiAmount)));

}

async function main() {
  await signerInfo();

  const ArkaERC20 = await ethers.getContractFactory("ArkaERC20");
  const arkaERC20 = await ArkaERC20.deploy();

  await arkaERC20.deployed();

  console.log(
    `ArkaERC20 deployed to ${arkaERC20.address} (${ethers.utils.getAddress(arkaERC20.address)})`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
