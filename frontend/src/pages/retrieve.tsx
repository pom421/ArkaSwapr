import Layout from "@/components/Layout"
import { StoreContractAbi, StoreContractAddress } from "@/contracts/Storage"
import { useStorage, useStorageRetrieve, useStorageValueStoredEvent } from "@/generated"
import { Button, Heading, Text } from "@chakra-ui/react"
import { ethers } from "ethers"
import { useEffect, useState } from "react"
import { useContractRead, useProvider } from "wagmi"

const RetrievePage = () => {
  const [retrieve, setRetrieve] = useState("")

  // const [lastValueFromEvent, setLastValueFromEvent] = useState("")
  const [allValuesFromEvent, setAllValuesFromEvent] = useState<string[]>([])

  // avant
  const { data, isError, isLoading } = useContractRead({
    address: StoreContractAddress,
    abi: StoreContractAbi,
    functionName: "retrieve",
    watch: true,
  })

  // après
  const { data: dataFromCustomHook } = useStorageRetrieve({
    watch: true,
  })

  const provider = useProvider()
  const storageContract = useStorage({ signerOrProvider: provider })

  // Récupération des events passés de manière statique.
  useEffect(() => {
    const run = async () => {
      // @ts-ignore
      const filters = storageContract.filters.ValueStored()

      if (filters && storageContract) {
        const allEvents = await storageContract.queryFilter(filters, 0, "latest")

        setAllValuesFromEvent(allEvents.map((event) => BigInt(event.args?.[0]).toString()))
      }
    }

    if (storageContract) run()
  }, [storageContract])

  useStorageValueStoredEvent({
    // @ts-ignore
    listener(node, label, owner) {
      // setLastValueFromEvent(BigInt(node).toString())
      setAllValuesFromEvent((events) => [...events, BigInt(node).toString()])
    },
  })

  // Récupération des events passés sans passer par des hooks (Wagmi core).
  // const unwatch = watchContractEvent(
  //   {
  //     address: StoreContractAddress,
  //     abi: StoreContractAbi,
  //     eventName: "ValueStored",
  //   },

  //   // @ts-ignore
  //   (node: any, label: any, owner: any) => {
  //     console.log("watchEvent", node, label, owner)
  //   },
  // )

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
        {/* <>Value from event: {lastValueFromEvent}</> */}
        Value from event: {allValuesFromEvent[allValuesFromEvent.length - 1]}
      </p>
      <p>
        <Text as="span" mr="4">
          Récupérer la valeur décimale
        </Text>
        {dataFromCustomHook?._hex ? BigInt(dataFromCustomHook?._hex).toString() : "Null"}
      </p>

      <Button onClick={getTheNumber}>Récupération</Button>

      <pre>Via ethers raw: {retrieve}</pre>

      <Heading as="h2" my="8">
        Historique des valeurs
      </Heading>
      <ul>
        {allValuesFromEvent.map((value, index) => (
          <li key={index}>{value}</li>
        ))}
      </ul>
    </Layout>
  )
}

export default RetrievePage
