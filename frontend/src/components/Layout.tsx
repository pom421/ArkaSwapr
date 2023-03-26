import { Box, Container, Flex } from "@chakra-ui/react"
import { PropsWithChildren } from "react"
import { ClientOnly } from "./ClientOnly"
import Footer from "./Footer"
import Header from "./Header"

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <ClientOnly>
      <Flex justifyContent="space-between" alignItems="center" direction="column" height="100vh">
        <Header />
        <Container maxW="800px" flexGrow="1" py="8">
          <Box>{children}</Box>
        </Container>
        <Footer />
      </Flex>
    </ClientOnly>
  )
}

export default Layout
