import { Alert, AlertIcon } from "@chakra-ui/react"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { PropsWithChildren } from "react"
import { useAccount } from "wagmi"

export const ConnectedUserOnly = ({ children }: PropsWithChildren) => {
  const { address } = useAccount()
  const [parent] = useAutoAnimate()

  return (
    <div ref={parent}>
      {!address ? (
        <Alert status="warning">
          <AlertIcon />
          Veuillez vous connecter pour pouvoir interagir avec les ressources.
        </Alert>
      ) : (
        children
      )}
    </div>
  )
}
