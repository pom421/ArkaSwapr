import Layout from "@/components/Layout"
import { usePrepareStorageStore, useStorageStore } from "@/generated"
import { Button, Heading, Input } from "@chakra-ui/react"
import { BigNumber } from "ethers"
import { useState } from "react"

const StorePage = () => {
  const [number, setNumber] = useState("")

  const { config } = usePrepareStorageStore({
    args: [number ? BigNumber.from(number) : BigNumber.from(0)],
  })

  const { write } = useStorageStore(config)

  return (
    <Layout>
      <Heading as="h1" mb="8">
        Dans store
      </Heading>

      <p>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quas itaque harum, temporibus incidunt quibusdam esse!
        Cum pariatur, excepturi exercitationem fugit veritatis, harum quod asperiores temporibus, nostrum nulla aperiam
        ratione dicta.
      </p>

      <Input name="number" onChange={(e) => setNumber(e.target.value)} value={number} />
      <Button type="submit" onClick={() => write?.()}>
        Stocker
      </Button>
    </Layout>
  )
}

export default StorePage
