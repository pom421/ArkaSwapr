import { Flex, Text, useColorModeValue } from "@chakra-ui/react"

const Footer = () => {
  const bg = useColorModeValue("blue.400", "blue.700")
  const color = useColorModeValue("white", "gray.100")

  return (
    <Flex justifyContent="center" alignItems="center" width="100%" height="10vh" p="2rem" bg={bg} color={color}>
      <Text>&copy; Pom421 {new Date().getFullYear()}</Text>
    </Flex>
  )
}

export default Footer
