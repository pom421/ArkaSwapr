import { Admin } from "@/components/Admin/Admin"
import Layout from "@/components/Layout"
import { OwnerOnly } from "@/components/OwnerOnly"
import { ReactElement } from "react"
import { useAccount } from "wagmi"

export default function AdminPage() {
  const { address } = useAccount()

  return (
    <main>
      <OwnerOnly userAddress={address}>
        {/* In ConnectedUserOnly, userAddress can't be null so ! is allowed here. */}
        <Admin />
      </OwnerOnly>
    </main>
  )
}

AdminPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>
}
