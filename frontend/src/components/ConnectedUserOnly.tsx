import { Alert, AlertIcon } from "@chakra-ui/react"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { PropsWithChildren } from "react"

type Props = PropsWithChildren & {
  userAddress: string | null
}

export const ConnectedUserOnly = ({ userAddress, children }: Props) => {
  const [parent] = useAutoAnimate()

  return (
    <div ref={parent}>
      {!userAddress ? (
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
