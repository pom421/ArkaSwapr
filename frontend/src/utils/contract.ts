import { BigNumber, ethers } from "ethers"

export const isAddressZero = (address?: string) => address === ethers.constants.AddressZero

export const isFinisdhedStake = (timestamp: BigNumber) => {
  return timestamp.toNumber() * 1000 < new Date().getTime()
}
