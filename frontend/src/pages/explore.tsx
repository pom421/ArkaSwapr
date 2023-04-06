import { ConnectedUserOnly } from "@/components/ConnectedUserOnly"
import { Explore } from "@/components/Explore"
import Layout from "@/components/Layout"
import { ReactElement } from "react"

export default function ExplorePage() {
  return (
    <main>
      <ConnectedUserOnly>
        <Explore />
      </ConnectedUserOnly>
    </main>
  )
}

ExplorePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>
}
