import { useArkaStakingDeposit, usePrepareArkaStakingDeposit } from "@/generated"
import { BigNumber } from "ethers"
import { Address, useWaitForTransaction } from "wagmi"

type Props = {
  stakeAmount: BigNumber
  addressCurrentStake?: Address
  enabled: boolean
}
export const useCustomStakingDeposit = ({ stakeAmount, addressCurrentStake, enabled }: Props) => {
  console.log("stakeAmount", stakeAmount)

  const {
    config,
    isError: isErrorPrepare,
    error: errorPrepare,
  } = usePrepareArkaStakingDeposit({
    address: addressCurrentStake,
    args: [stakeAmount],
    enabled,
  })
  const { data, isError, error, write } = useArkaStakingDeposit(config)

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  return {
    isError: isErrorPrepare || isError,
    error: errorPrepare || error,
    isLoading,
    isSuccess,
    write,
  }
}
