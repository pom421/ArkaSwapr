import Layout from "@/components/Layout"
import { StoreContractAbi, StoreContractAddress } from "@/contracts/Storage"
import { useStorageRetrieve } from "@/generated"
import { Button, Heading, Text } from "@chakra-ui/react"
import { ethers } from "ethers"
import { useState } from "react"
import { useContractRead, useProvider } from "wagmi"

const RetrievePage = () => {
  const [retrieve, setRetrieve] = useState("")

  const { data: dataFromCustomHook } = useStorageRetrieve()

  const { data, isError, isLoading } = useContractRead({
    address: StoreContractAddress,
    abi: StoreContractAbi,
    functionName: "retrieve",
  })

  const provider = useProvider()

  const getTheNumber = async () => {
    const contract = new ethers.Contract(StoreContractAddress, StoreContractAbi, provider)
    const smartContractValue = await contract.retrieve()
    setRetrieve(smartContractValue.toString())
  }

  return (
    <Layout>
      <Heading as="h1" mb="8">
        Dans retrieve
      </Heading>

      <p>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quas itaque harum, temporibus incidunt quibusdam esse!
        Cum pariatur, excepturi exercitationem fugit veritatis, harum quod asperiores temporibus, nostrum nulla aperiam
        ratione dicta.
      </p>

      {isError && <p>Erreur: {isError}</p>}

      {!isLoading && (
        <p>
          <>Objet data via le hook standard : {JSON.stringify(data, null, 2)}</>
        </p>
      )}

      <p>
        <>Objet data via le hook généré: {JSON.stringify(dataFromCustomHook, null, 2)}</>
      </p>
      <p>
        <>
          <Text as="span" mr="4">
            Récupérer la valeur décimale
          </Text>
          {dataFromCustomHook?._hex ? BigInt(dataFromCustomHook?._hex).toString() : "Null"}
        </>
      </p>

      <Button onClick={getTheNumber}>Récupération</Button>

      <pre>Via ethers raw: {retrieve}</pre>
    </Layout>
  )
}

export default RetrievePage
