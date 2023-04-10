import { useArkaMasterStartNewStake, usePrepareArkaMasterStartNewStake } from "@/generated"
import { BigNumber } from "ethers"
import { useWaitForTransaction } from "wagmi"

type Props = {
  rewardAmount?: BigNumber
  enabled?: boolean
  onSuccess?: () => void
  onError?: () => void
}

/**
 * Encapsulates the logic for starting a new stake
 *
 * @param rewardAmount The amount of reward to stake
 * @param enabled Whether the hook is enabled or not
 */
export const useCustomNewStake = ({ rewardAmount, enabled = true, onSuccess, onError }: Props) => {
  const {
    config,
    isError: isErrorPrepare,
    error: errorPrepare,
  } = usePrepareArkaMasterStartNewStake({
    args: [rewardAmount || BigNumber.from(0)],
    enabled, // Bug in Wagmi. Even with enabled set to false, a call to blockchain is made.
  })
  const { data, isError, error, write } = useArkaMasterStartNewStake({
    ...config,
    onSuccess,
    onError,
  })

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  return {
    // isError: isErrorPrepare || isError,
    isError,
    // error: errorPrepare || error,
    error,
    isLoading,
    isSuccess,
    write,
  }
}
