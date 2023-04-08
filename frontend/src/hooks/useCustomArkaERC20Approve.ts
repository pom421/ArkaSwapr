import { useArkaErc20Approve, usePrepareArkaErc20Approve } from "@/generated"
import { isAddressZero } from "@/utils/contract"
import { BigNumber, ethers } from "ethers"
import { Address, useWaitForTransaction } from "wagmi"

type Props = {
  addressCurrentStake?: Address
  stakeAmount?: BigNumber
}

export const useCustomArkaERC20Approve = ({ addressCurrentStake, stakeAmount }: Props) => {
  const {
    config,
    isError: isErrorPrepare,
    error: errorPrepare,
  } = usePrepareArkaErc20Approve({
    args: [addressCurrentStake || ethers.constants.AddressZero, stakeAmount || BigNumber.from(0)],
    enabled: !isAddressZero(addressCurrentStake) && (stakeAmount || BigNumber.from(0)).gt(0),
  })
  const { data, isError, error, write } = useArkaErc20Approve(config)

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  return {
    isError: isErrorPrepare || isError,
    error: errorPrepare || error,
    write,
    isLoading,
    isSuccess,
  }
}
