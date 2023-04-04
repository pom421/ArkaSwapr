import { Explore } from "@/components/Explore"
import Layout from "@/components/Layout"
import { useConnectedUser } from "@/hooks/useConnectedUser"
import { ReactElement } from "react"

export default function ExplorePage() {
  const userAddress = useConnectedUser()

  return (
    <main>
      <Explore userAddress={userAddress} />
    </main>
  )
}

ExplorePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>
}
