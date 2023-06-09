import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-etherscan";

import { HardhatUserConfig } from "hardhat/config";

import { config as dotenvConfig } from "dotenv";

dotenvConfig();

// Load Infura project ID and account from .env file.
const { INFURA_ID, ACCOUNT0_PRIVATE_KEY } = process.env;

console.log("INFURA_ID", INFURA_ID);

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  paths: {
    artifacts: "../frontend/artifacts",
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://mainnet.infura.io/v3/${INFURA_ID}`,
      },
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_ID}`,
      accounts: [ACCOUNT0_PRIVATE_KEY || ""],
    },
  },
  etherscan: {
    // Your API key for Etherscan
    apiKey: "52YBA6C963BBRCNTC1CQ6DS7NMY5HRN6VK",
  },
};

export default config;
