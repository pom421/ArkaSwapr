import { ConnectedUserOnly } from "@/components/ConnectedUserOnly"
import { Explore } from "@/components/Explore"
import Layout from "@/components/Layout"
import { useConnectedUser } from "@/hooks/useConnectedUser"
import { ReactElement } from "react"

export default function ExplorePage() {
  const userAddress = useConnectedUser()

  return (
    <main>
      <ConnectedUserOnly userAddress={userAddress}>
        {/* In ConnectedUserOnly, userAddress can't be null so ! is allowed here. */}
        <Explore userAddress={userAddress!} />
      </ConnectedUserOnly>
    </main>
  )
}

ExplorePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>
}
