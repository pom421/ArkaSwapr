import { BigNumber } from "ethers"

export type Resource = {
  description: string
  url: string
  endDate: BigNumber
}

export enum InteractionType {
  unset = 0,
  love,
  like,
  unlike,
  toxic,
}
