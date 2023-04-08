import { useArkaStakingDeposit, usePrepareArkaStakingDeposit } from "@/generated"
import { isAddressZero } from "@/utils/contract"
import { BigNumber } from "ethers"
import { Address, useWaitForTransaction } from "wagmi"

type Props = {
  stakeAmount: BigNumber
  addressCurrentStake?: Address
}
export const useCustomStakingDeposit = ({ stakeAmount, addressCurrentStake }: Props) => {
  const {
    config,
    isError: isErrorPrepare,
    error: errorPrepare,
  } = usePrepareArkaStakingDeposit({
    address: addressCurrentStake,
    args: [stakeAmount],
    enabled: !isAddressZero(addressCurrentStake) && (stakeAmount || BigNumber.from(0)).gt(0),
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
