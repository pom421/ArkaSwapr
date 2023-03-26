// import "@/styles/globals.css"
import "@rainbow-me/rainbowkit/styles.css"

import { title } from "@/utils/constants"
import { ChakraProvider } from "@chakra-ui/react"
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import type { AppProps } from "next/app"
import { configureChains, createClient, goerli, WagmiConfig } from "wagmi"
import { arbitrum, hardhat, mainnet, optimism, polygon, sepolia } from "wagmi/chains"
import { alchemyProvider } from "wagmi/providers/alchemy"
import { publicProvider } from "wagmi/providers/public"

const { chains, provider } = configureChains(
  [hardhat, mainnet, polygon, optimism, arbitrum, goerli, sepolia],
  [alchemyProvider({ apiKey: process.env.ALCHEMY_ID || "" }), publicProvider()],
)

const { connectors } = getDefaultWallets({
  appName: title,
  chains,
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <ChakraProvider>
          <Component {...pageProps} />
        </ChakraProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
