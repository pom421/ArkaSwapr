import { formatTimestamp } from "@/utils/date"
import { Text, useColorModeValue } from "@chakra-ui/react"
import { BigNumber } from "ethers"

export const EndDate = ({ value }: { value: BigNumber }) => {
  const color = useColorModeValue("blue.500", "cyan.500")

  return (
    <Text fontSize="sm" color={color}>
      Se termine le {formatTimestamp(value)}
    </Text>
  )
}
