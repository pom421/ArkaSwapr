import { ArkaMasterContractAbi, ArkaMasterContractAddress } from "@/contracts/ArkaMaster"
import { ChainlinkEthUsdAbi, ChainlinkEthUsdAddress } from "@/contracts/ChainlinkEthUsd"
import { StoreContractAbi, StoreContractAddress } from "@/contracts/Storage"
import { defineConfig } from "@wagmi/cli"
import { react } from "@wagmi/cli/plugins"

export default defineConfig({
  out: "src/generated.ts",
  contracts: [
    {
      name: "Storage",
      abi: StoreContractAbi,
      address: StoreContractAddress,
    },
    {
      name: "ArkaMaster",
      abi: ArkaMasterContractAbi,
      address: ArkaMasterContractAddress,
    },
    {
      name: "ChainlinkEthUsd",
      abi: ChainlinkEthUsdAbi,
      address: ChainlinkEthUsdAddress,
    },
  ],
  plugins: [react()],
})
