import { useArkaMasterEndCurrentStake, usePrepareArkaMasterEndCurrentStake } from "@/generated"
import { useWaitForTransaction } from "wagmi"

type Props = {
  enabled?: boolean
  onSuccess?: () => void
  onError?: () => void
}

/**
 * Encapsulates the logic for ending a stake
 *
 * @param enabled Whether the hook is enabled or not
 */
export const useCustomEndStake = ({ enabled, onSuccess, onError }: Props = {}) => {
  const {
    config,
    isError: isErrorPrepare,
    error: errorPrepare,
  } = usePrepareArkaMasterEndCurrentStake({
    enabled, // Bug in Wagmi. Even with enabled set to false, a call to blockchain is made.
  })

  const { data, isError, error, write } = useArkaMasterEndCurrentStake({ ...config, onSuccess, onError })

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  return {
    // isError: isErrorPrepare || isError, // We can't use isErrorPrepare since there is a bug. See above.
    isError,
    // error: errorPrepare || error,
    error,
    isLoading,
    isSuccess,
    write,
  }
}
