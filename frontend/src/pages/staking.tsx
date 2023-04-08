import { ClientOnly } from "@/components/ClientOnly"
import Layout from "@/components/Layout"
import { Staking } from "@/components/Staking"
import { ReactElement } from "react"

export default function StakingPage() {
  return (
    <main>
      <ClientOnly>
        <Staking />
      </ClientOnly>
    </main>
  )
}

StakingPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>
}
