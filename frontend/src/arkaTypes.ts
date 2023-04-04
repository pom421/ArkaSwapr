import { BigNumber } from "ethers"

export type Resource = {
  description: string
  url: string
  endDate: BigNumber
}

export enum InteractionType {
  unset = 0,
  like,
  love,
  unlike,
  toxic,
}
