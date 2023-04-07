import { useArkaMasterProposeResource, usePrepareArkaMasterProposeResource } from "@/generated"
import { BigNumber } from "ethers"
import { useWaitForTransaction } from "wagmi"

type Props = {
  description: string
  url: string
  priceInWei?: BigNumber
}

export const useCustomPropose = ({ description, url, priceInWei }: Props) => {
  const {
    config,
    isError: isErrorPrepare,
    error: errorPrepare,
  } = usePrepareArkaMasterProposeResource({
    args: [description, url],
    overrides: {
      value: priceInWei,
    },
  })

  // Propose resource.
  const { data, write, isError, error } = useArkaMasterProposeResource(config)

  // Wait for transaction of proposed resource.
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  return {
    // isError: isErrorPrepare || isError,
    isError,
    // error: errorPrepare || error,
    error,
    write,
    isLoading,
    isSuccess,
  }
}
