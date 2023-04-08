import { ConnectedUserOnly } from "@/components/ConnectedUserOnly"
import Layout from "@/components/Layout"
import Propose from "@/components/Propose/Propose"
import { ReactElement } from "react"

export default function ExplorePage() {
  return (
    <main>
      <ConnectedUserOnly>
        <Propose />
      </ConnectedUserOnly>
    </main>
  )
}

ExplorePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>
}
