import { Resource } from "@/arkaTypes"
import { useArkaMaster } from "@/generated"
import {
  Alert,
  AlertIcon,
  Container,
  Flex,
  Heading,
  Table,
  TableContainer,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { useEffect, useState } from "react"
import { useProvider } from "wagmi"
import { RowResource } from "./RowResource"

/**
 * Show only resources that are not finished yet.
 *
 * @param resources List of resources from the contract
 * @returns valid resources
 */
const filterResources = (resources: Resource[]) => {
  return resources.filter((resource) => resource.endDate.toNumber() * 1000 > Date.now())
}

type Props = {
  userAddress: string
}

export const Explore = ({ userAddress }: Props) => {
  const [parent] = useAutoAnimate()
  const [resources, setResources] = useState<Resource[]>()
  const provider = useProvider()
  const arkaMasterContract = useArkaMaster({ signerOrProvider: provider })

  const validResources = filterResources(resources || [])

  // Récupération des events passés de manière statique.
  useEffect(() => {
    const run = async () => {
      if (arkaMasterContract) {
        // @ts-ignore
        const filters = arkaMasterContract.filters.ResourceProposed()

        if (filters && arkaMasterContract) {
          const allEvents = await arkaMasterContract.queryFilter(filters, 0, "latest")

          setResources(
            allEvents.map((event) => ({
              description: event.args?.[0],
              url: event.args?.[1],
              endDate: event.args?.[2],
            })),
          )
        }
      }
    }

    run()
  }, [arkaMasterContract])

  const handleClick = async ({ idResource, idInteract }: { idResource: number; idInteract: number }) => {
    // const config = await prepareWriteContract({
    //   address: ArkaMasterContractAddress,
    //   abi: ArkaMasterContractAbi,
    //   functionName: "interact",
    //   args: [BigNumber(idResource), idInteract],
    // })
    // const data = await writeContract(config)
  }

  return (
    <main>
      <Container maxW={"6xl"}>
        <Flex direction="column" gap="8">
          <Heading as="h1" mt="8">
            Explorer
          </Heading>

          <Text fontSize="lg">Regarde un site et donne ton avis. 2 ARKA de récompenses à chaque interaction.</Text>

          <div ref={parent}>
            {!userAddress ? (
              <Alert status="warning">
                <AlertIcon />
                Veuillez vous connecter pour pouvoir interagir avec les ressources.
              </Alert>
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>#id</Th>
                      <Th>Description</Th>
                      <Th>Interactions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {validResources?.map((resource, index) => (
                      <RowResource key={index} resource={resource} index={index} userAddress={userAddress} />
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </div>
        </Flex>
      </Container>
    </main>
  )
}
