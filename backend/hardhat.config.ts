import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";


const config: HardhatUserConfig = {
  solidity: "0.8.18",
  paths: {
    artifacts: "../frontend/artifacts",
  },
};

export default config;
