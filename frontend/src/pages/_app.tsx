// import "@/styles/globals.css"
import "@rainbow-me/rainbowkit/styles.css"

import { title } from "@/utils/constants"
import { ChakraProvider } from "@chakra-ui/react"
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { alchemyProvider } from "@wagmi/core/providers/alchemy"
import { NextPage } from "next"
import type { AppProps } from "next/app"
import { ReactElement, ReactNode } from "react"
import { configureChains, createClient, goerli, WagmiConfig } from "wagmi"
import { hardhat, mainnet, sepolia } from "wagmi/chains"
import { publicProvider } from "wagmi/providers/public"

const { chains, provider } = configureChains(
  [hardhat, mainnet, goerli, sepolia],
  [alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID || "" }), publicProvider()],
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

export type NextPageWithLayout<P = Record<string, never>, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout || ((page) => page)

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <ChakraProvider>{getLayout(<Component {...pageProps} />)}</ChakraProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
