import { MoonIcon, SunIcon } from "@chakra-ui/icons"
import { Button, Flex, Link, Text, useColorMode } from "@chakra-ui/react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import NextLink from "next/link"

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      height="10vh"
      width="100%"
      p="2rem"
      borderBottom={"1px solid lightgray"}
    >
      <Flex justifyContent="start" alignItems="center" direction="row">
        <Text fontWeight="bold" fontSize="2xl">
          ArkaSwapr
        </Text>
        <Flex width="30%" justifyContent="start" alignItems="center" minW="500" ml="8" gap="8">
          <Text>
            <Link as={NextLink} href="/">
              Home
            </Link>
          </Text>
          <Text>
            <Link as={NextLink} href="/store">
              Mémoriser
            </Link>
          </Text>
          <Text>
            <Link as={NextLink} href="/retrieve">
              Récupérer
            </Link>
          </Text>
          <Button
            variant="link"
            onClick={toggleColorMode}
            leftIcon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          >
            {colorMode === "light" ? "Mode sombre" : "Mode clair"}
          </Button>
          {/*
          <Text>
            <Link href="/setNumber">Set the number</Link>
          </Text> */}
        </Flex>
      </Flex>
      <ConnectButton />
    </Flex>
  )
}

export default Header
