import Layout from "@/components/Layout"
import { Heading, Text } from "@chakra-ui/react"
import { useAccount } from "wagmi"

const TestPage = () => {
  const { address, isConnected } = useAccount()
  //   const { connect } = useConnect({
  //     connector: new InjectedConnector(),
  //   })
  //   const { disconnect } = useDisconnect()

  return (
    <Layout>
      <Heading as="h1" mb="8">
        Dans test
      </Heading>
      <Text fontWeight="bold">Adresse</Text>
      <p>{address}</p>
      <Text fontWeight="bold">Est connecté</Text>
      <p>{String(isConnected)}</p>
    </Layout>
  )

  //   return (
  //     <>
  //       {isConnected ? (
  //         <>
  //           Connected to {address}
  //           <Button onClick={() => disconnect()}>Disconnect</Button>
  //         </>
  //       ) : (
  //         <Button onClick={() => connect()}>Connect Wallet</Button>
  //       )}
  //     </>
  //   )
}

export default TestPage
