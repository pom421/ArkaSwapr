import { Admin } from "@/components/Admin/Admin"
import Layout from "@/components/Layout"
import { OwnerOnly } from "@/components/OwnerOnly"
import { ReactElement } from "react"

export default function AdminPage() {
  return (
    <main>
      <OwnerOnly>
        <Admin />
      </OwnerOnly>
    </main>
  )
}

AdminPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>
}
