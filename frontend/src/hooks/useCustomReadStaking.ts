// prettier-ignore
import {
  useArkaMasterCurrentStake,
  useArkaStakingAmountReward,
  useArkaStakingFinishAt,
  useArkaStakingStakeBalanceOf,
  useArkaStakingTotalSupply,
} from "@/generated"
import { isAddressZero } from "@/utils/contract"
import { ethers } from "ethers"
import { Address } from "wagmi"

type Props = {
  address?: Address
}

export const useCustomReadStaking = ({ address = ethers.constants.AddressZero }: Props = {}) => {
  // Current stake address, if any
  const { data: addressCurrentStake } = useArkaMasterCurrentStake({
    watch: true,
  })

  const { data: totalSupply } = useArkaStakingTotalSupply({
    address: addressCurrentStake,
    enabled: !isAddressZero(addressCurrentStake),
    watch: true,
  })

  // Current stake finish date
  const { data: finishAt } = useArkaStakingFinishAt({
    address: addressCurrentStake,
    enabled: !isAddressZero(addressCurrentStake),
    watch: true,
  })

  // Current stake reward amount
  const { data: amountReward } = useArkaStakingAmountReward({
    address: addressCurrentStake,
    enabled: !isAddressZero(addressCurrentStake),
    watch: true,
  })

  // Get current stake balance of user
  const { data: arkaAlreadyStaked } = useArkaStakingStakeBalanceOf({
    address: addressCurrentStake,
    args: [address || ethers.constants.AddressZero],
    enabled: !isAddressZero(addressCurrentStake),
    watch: true,
  })

  return {
    addressCurrentStake,
    finishAt,
    amountReward,
    arkaAlreadyStaked,
    totalSupply,
  }
}
