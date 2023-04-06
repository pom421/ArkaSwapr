import { ArkaMasterContractAddress } from "@/contracts/ArkaMaster"
import { hasErrors } from "@/utils/errors"
// prettier-ignore
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
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
import { parseEther } from "ethers/lib/utils.js"
import { FormEvent, useEffect, useState } from "react"
import { useBalance } from "wagmi"

type FormProps = {
  rewardAmount?: string
}

export const Admin = () => {
  const [parent] = useAutoAnimate()
  const [errors, setErrors] = useState<FormProps & { globalError?: string }>({})
  const [rewardAmount, setRewardAmount] = useState("")

  const {
    data: balanceData,
    isError,
    isLoading,
  } = useBalance({
    address: ArkaMasterContractAddress,
    watch: true,
  })

  useEffect(() => {
    if (isError) setErrors({ globalError: "Erreur lors de la récupération du solde" })
  }, [isError])

  const color = useColorModeValue("blue.500", "cyan.500")

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isNaN(Number(rewardAmount))) return setErrors({ rewardAmount: "Veuillez renseigner un montant valide" })
    if (balanceData?.value === undefined) return setErrors({ globalError: "Erreur lors de la récupération du solde" })
    if (rewardAmount === "") return setErrors({ rewardAmount: "Veuillez renseigner un montant" })
    if (balanceData?.value.isZero()) return setErrors({ rewardAmount: "Pas de fonds disponibles" })
    if (parseEther(rewardAmount).gt(parseEther(balanceData.formatted)))
      return setErrors({ rewardAmount: "Montant trop élevé" })
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

          <div ref={parent}>
            {errors.globalError && (
              <Alert status="warning">
                <AlertIcon />
                <Box>
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>{errors.globalError}</AlertDescription>
                </Box>
              </Alert>
            )}
          </div>

          <Text fontSize="lg">
            ETH disponible
            <Text as="span" color={color} ml="4">
              {balanceData?.formatted}
            </Text>
          </Text>

          <form onSubmit={handleSubmit}>
            <Flex direction="row" gap="4">
              <FormControl isInvalid={Boolean(errors?.rewardAmount)}>
                <FormLabel>Montant</FormLabel>
                <Input
                  name="rewardAmount"
                  placeholder="Amount"
                  value={rewardAmount}
                  onChange={(e) => {
                    setErrors({})
                    setRewardAmount(e.target.value.replaceAll(",", "."))
                  }}
                />
                <FormErrorMessage>{errors?.rewardAmount}</FormErrorMessage>
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
