import { useEffect, useState } from "react"
import { useSigner } from "wagmi"

export const useConnectedUser = () => {
  const [connectedUser, setConnectedUser] = useState<string | null>(null)

  const { data: signer } = useSigner()

  useEffect(() => {
    if (signer) {
      signer.getAddress().then(setConnectedUser)
    }
  }, [signer])

  return connectedUser
}
