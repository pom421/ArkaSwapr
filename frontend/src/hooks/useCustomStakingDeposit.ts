import { useArkaStakingDeposit, usePrepareArkaStakingDeposit } from "@/generated"
import { isAddressZero } from "@/utils/contract"
import { BigNumber } from "ethers"
import { formatEther } from "ethers/lib/utils.js"
import { Address, useWaitForTransaction } from "wagmi"

type Props = {
  stakeAmount: BigNumber
  addressCurrentStake?: Address
}
export const useCustomStakingDeposit = ({ stakeAmount, addressCurrentStake }: Props) => {
  console.log("XXX", formatEther(stakeAmount))
  console.log("YYY", stakeAmount.eq(0))

  const {
    config,
    isError: isErrorPrepare,
    error: errorPrepare,
  } = usePrepareArkaStakingDeposit({
    address: addressCurrentStake,
    args: [stakeAmount],
    enabled: !isAddressZero(addressCurrentStake) && !stakeAmount.eq(0),
  })
  const { data, isError, error, write } = useArkaStakingDeposit(config)

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  console.log("errorPrepare:", errorPrepare)
  console.log("error:", error)

  return {
    isError: isErrorPrepare || isError,
    error: errorPrepare || error,
    isLoading,
    isSuccess,
    write,
  }
}
