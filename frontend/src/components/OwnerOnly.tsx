import { useArkaMasterOwner } from "@/generated"
import { Alert, AlertDescription, AlertIcon, AlertTitle, Container } from "@chakra-ui/react"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { PropsWithChildren } from "react"

type Props = PropsWithChildren & {
  userAddress: string | null
}

export const OwnerOnly = ({ userAddress, children }: Props) => {
  const [parent] = useAutoAnimate()
  const owner = useArkaMasterOwner()

  return (
    <div ref={parent}>
      {userAddress !== owner.data ? (
        <main>
          <Container maxW={"4xl"} mt="16">
            <Alert
              status="error"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              height="200px"
            >
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="lg">
                Erreur
              </AlertTitle>
              <AlertDescription maxWidth="sm">{"Seul l'administateur peut accéder à cette page."}</AlertDescription>
            </Alert>
          </Container>
        </main>
      ) : (
        children
      )}
    </div>
  )
}
