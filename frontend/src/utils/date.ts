import { format } from "date-fns"
import { BigNumber } from "ethers"

export function formatTimestamp(timestamp: BigNumber) {
  const endDate = new Date(timestamp.toNumber() * 1000)
  return format(endDate, "dd/MM/yyyy 'à' HH:mm")
}
