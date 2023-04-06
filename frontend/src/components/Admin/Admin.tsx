import { ArkaMasterContractAddress } from "@/contracts/ArkaMaster"
import { hasErrors } from "@/utils/errors"
// prettier-ignore
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Text,
  useColorModeValue,
} from "@chakra-ui/react"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { FormEvent, useState } from "react"
import { useBalance } from "wagmi"

type FormProps = {
  globalAmount?: string
}

export const Admin = () => {
  const [parent] = useAutoAnimate()
  const [errors, setErrors] = useState<FormProps>({})
  const [globalAmount, setGlobalAmount] = useState("")

  const {
    data: balanceData,
    isError,
    isLoading,
  } = useBalance({
    address: ArkaMasterContractAddress,
    watch: true,
  })

  const color = useColorModeValue("blue.500", "cyan.500")

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (globalAmount === "") return setErrors({ globalAmount: "Veuillez renseigner un montant" })

    if (balanceData?.value.toNumber() === 0) return setErrors({ globalAmount: "Pas de fonds disponibles" })

    console.log("dans submit")
  }

  return (
    <main>
      <Container maxW={"4xl"}>
        <Flex direction="column" gap="8">
          <Heading as="h1" mt="8">
            Admin
          </Heading>

          <Heading as="h2" fontSize="x-large">
            Nouveau stake
          </Heading>
          <Text fontSize="lg">Lancement de stake ou stake actuel.</Text>

          {isError && (
            <Alert status="warning">
              <AlertTitle>Erreur</AlertTitle>
              <AlertIcon />
              <AlertDescription>Une erreur est survenue.</AlertDescription>
            </Alert>
          )}

          <Text fontSize="lg">
            ETH disponible
            <Text as="span" color={color} ml="4">
              {balanceData?.formatted}
            </Text>
          </Text>

          <div ref={parent}>
            {hasErrors(errors) && (
              <Alert status="warning">
                <AlertTitle>Erreur</AlertTitle>
                <AlertIcon />
                <AlertDescription>{errors.globalAmount}</AlertDescription>
              </Alert>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <Flex direction="row" gap="4">
              <FormControl isInvalid={Boolean(errors?.globalAmount)}>
                <FormLabel>Montant</FormLabel>
                <Input
                  name="globalAmount"
                  placeholder="Amount"
                  value={globalAmount}
                  onChange={(e) => {
                    setErrors({})
                    setGlobalAmount(e.target.value)
                  }}
                />
                <FormErrorMessage>{errors?.globalAmount}</FormErrorMessage>
              </FormControl>
              <Button mt="8" type="submit" size="lg" disabled={isLoading || hasErrors(errors)}>
                Démarrer
              </Button>
            </Flex>
          </form>
        </Flex>
      </Container>
    </main>
  )
}
