import Layout from "@/components/Layout"
import { OwnerOnly } from "@/components/OwnerOnly"
import { Staking } from "@/components/Staking"
import { ReactElement } from "react"

export default function StakingPage() {
  return (
    <main>
      <OwnerOnly>
        <Staking />
      </OwnerOnly>
    </main>
  )
}

StakingPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>
}
