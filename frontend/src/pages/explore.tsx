import { ConnectedUserOnly } from "@/components/ConnectedUserOnly"
import { Explore } from "@/components/Explore"
import Layout from "@/components/Layout"
import { ReactElement } from "react"
import { useAccount } from "wagmi"

export default function ExplorePage() {
  const { address } = useAccount()

  return (
    <main>
      <ConnectedUserOnly userAddress={address}>
        {/* In ConnectedUserOnly, userAddress can't be null so ! is allowed here. */}
        <Explore userAddress={address!} />
      </ConnectedUserOnly>
    </main>
  )
}

ExplorePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>
}
