import { useResourcesFromEvent } from "@/hooks/useResourcesFromEvent"
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
import { RowResource } from "./RowResource"

type Props = {
  userAddress: string
}

export const Explore = ({ userAddress }: Props) => {
  const [parent] = useAutoAnimate()
  const resources = useResourcesFromEvent()

  return (
    <main>
      <Container maxW={"6xl"}>
        <Flex direction="column" gap="8">
          <Heading as="h1" mt="8">
            Explore
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
                    {resources?.map((resource, index) => (
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
