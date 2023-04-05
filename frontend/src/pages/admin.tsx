import { Admin } from "@/components/Admin/Admin"
import Layout from "@/components/Layout"
import { OwnerOnly } from "@/components/OwnerOnly"
import { useConnectedUser } from "@/hooks/useConnectedUser"
import { ReactElement } from "react"

export default function AdminPage() {
  const userAddress = useConnectedUser()

  return (
    <main>
      <OwnerOnly userAddress={userAddress}>
        {/* In ConnectedUserOnly, userAddress can't be null so ! is allowed here. */}
        <Admin />
      </OwnerOnly>
    </main>
  )
}

AdminPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>
}
