import Layout from "@/components/Layout"
import { StoreContractAbi } from "@/utils/contracts"
import { Button, Heading } from "@chakra-ui/react"
import { ethers } from "ethers"
import { useState } from "react"
import { useContractRead, useProvider } from "wagmi"

const RetrievePage = () => {
  const [retrieve, setRetrieve] = useState("")

  const { data, isError, isLoading } = useContractRead({
    address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    abi: StoreContractAbi,
    functionName: "retrieve",
  })

  const provider = useProvider()

  const getTheNumber = async () => {
    const contract = new ethers.Contract("0x5FbDB2315678afecb367f032d93F642f64180aa3", StoreContractAbi, provider)
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
          <>Résultat: {JSON.stringify(data, null, 2)}</>
        </p>
      )}

      <Button onClick={getTheNumber}>Récupération</Button>

      <pre>Via ethers raw: {retrieve}</pre>
    </Layout>
  )
}

export default RetrievePage
