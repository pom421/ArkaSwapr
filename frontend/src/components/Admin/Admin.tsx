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
} from "@chakra-ui/react"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { BigNumber } from "ethers"
import { FormEvent, useEffect, useState } from "react"
import { useProvider } from "wagmi"

type FormProps = {
  globalAmount?: string
}

export const Admin = () => {
  const [parent] = useAutoAnimate()
  const provider = useProvider()
  const [errors, setErrors] = useState<FormProps>({})
  const [globalAmount, setGlobalAmount] = useState("")
  const [balanceArkaMaster, setBalanceArkaMaster] = useState<BigNumber>()

  const isLoading = false

  useEffect(() => {
    const run = async () => {
      setBalanceArkaMaster(await provider.getBalance(ArkaMasterContractAddress))
    }
    run()
  }, [provider])

  console.log("balanceArkaMaster:", balanceArkaMaster?.toString())

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (globalAmount === "") return setErrors({ globalAmount: "Veuillez renseigner un montant" })

    console.log("dans submit")
  }

  return (
    <main>
      <Container maxW={"6xl"}>
        <Flex direction="column" gap="8">
          <Heading as="h1" mt="8">
            Admin
          </Heading>

          <Heading as="h2" fontSize="x-large">
            Nouveau stake
          </Heading>
          <Text fontSize="lg">Lancement de stake ou stake actuel.</Text>

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
            <Flex direction="column" gap="4">
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
            </Flex>
            <Button mt="8" type="submit" size="lg" disabled={isLoading || hasErrors(errors)}>
              Démarrer
            </Button>
          </form>
        </Flex>
      </Container>
    </main>
  )
}
