import { Flex, Text } from "@chakra-ui/react"

const Footer = () => {
  return (
    <Flex justifyContent="center" alignItems="center" width="100%" height="10vh" p="2rem" backgroundColor={"lightblue"}>
      <Text>&copy; Pom421 {new Date().getFullYear()}</Text>
    </Flex>
  )
}

export default Footer
