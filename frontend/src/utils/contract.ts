import { ethers } from "ethers"

export const isAddressZero = (address?: string) => address === ethers.constants.AddressZero
