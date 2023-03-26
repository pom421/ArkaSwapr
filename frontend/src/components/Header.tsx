import { Flex, Text } from "@chakra-ui/react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import Link from "next/link"

const Header = () => {
  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      height="10vh"
      width="100%"
      p="2rem"
      borderBottom={"1px solid lightgray"}
    >
      <Flex justifyContent="start" direction="row">
        <Text fontWeight="bold">Logo</Text>
        <Flex width="30%" justifyContent="start" alignItems="center" minW="500" ml="8" gap="8">
          <Text>
            <Link href="/">Home</Link>
          </Text>
          <Text>
            <Link href="/getNumber">Get the number</Link>
          </Text>
          <Text>
            <Link href="/setNumber">Set the number</Link>
          </Text>
        </Flex>
      </Flex>
      <ConnectButton />
    </Flex>
  )
}

export default Header
