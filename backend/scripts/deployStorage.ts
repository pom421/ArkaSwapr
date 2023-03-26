import { ethers } from "hardhat";

async function main() {
  const Storage = await ethers.getContractFactory("Storage");
  const storage = await Storage.deploy();

  await storage.deployed();

  console.log(
    `Storage deployed to ${storage.address} (${ethers.utils.getAddress(storage.address)})`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
