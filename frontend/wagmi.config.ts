import { ArkaERC20Abi, ArkaERC20Address } from "@/contracts/ArkaERC20"
import { ArkaMasterContractAbi, ArkaMasterContractAddress } from "@/contracts/ArkaMaster"
import { ArkaStakingAbi } from "@/contracts/ArkaStaking"
import { ChainlinkEthUsdAbi, ChainlinkEthUsdAddress } from "@/contracts/ChainlinkEthUsd"
import { defineConfig } from "@wagmi/cli"
import { react } from "@wagmi/cli/plugins"

export default defineConfig({
  out: "src/generated.ts",
  contracts: [
    {
      name: "ArkaMaster",
      abi: ArkaMasterContractAbi,
      address: ArkaMasterContractAddress,
    },
    {
      name: "ArkaStaking",
      abi: ArkaStakingAbi,
    },
    {
      name: "ArkaERC20",
      abi: ArkaERC20Abi,
      address: ArkaERC20Address,
    },
    {
      name: "ChainlinkEthUsd",
      abi: ChainlinkEthUsdAbi,
      address: ChainlinkEthUsdAddress,
    },
  ],
  plugins: [react()],
})
