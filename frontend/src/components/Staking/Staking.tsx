import { ArkaMasterContractAddress } from "@/contracts/ArkaMaster"
import { useArkaMasterCurrentStake, useArkaMasterStartNewStake, usePrepareArkaMasterStartNewStake } from "@/generated"
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
import { ethers } from "ethers"
import { parseEther } from "ethers/lib/utils.js"
import { FormEvent, useEffect, useState } from "react"
import { useBalance } from "wagmi"

type FormProps = {
  rewardAmount?: string
}

export const Staking = () => {
  const [parent] = useAutoAnimate()
  const [errors, setErrors] = useState<FormProps & { globalError?: string }>({})
  const [rewardAmount, setRewardAmount] = useState("")
  const color = useColorModeValue("blue.500", "cyan.500")

  const {
    data: balanceData,
    isError: isErrorBalance,
    isLoading: isLoadingBalance,
  } = useBalance({
    address: ArkaMasterContractAddress,
    watch: true,
  })

  const { config } = usePrepareArkaMasterStartNewStake({
    args: [parseEther(rewardAmount || "0")],
  })

  const { isLoading: isLoadingNewStake, isError: isErrorNewStake, write } = useArkaMasterStartNewStake(config)

  const { data: addressCurrentStake } = useArkaMasterCurrentStake({
    watch: true,
  })

  useEffect(() => {
    if (isErrorBalance) setErrors({ globalError: "Erreur lors de la récupération du solde" })
    if (isErrorNewStake) setErrors({ globalError: "Erreur lors de la création du contrat de staking" })
  }, [isErrorBalance, isErrorNewStake])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isNaN(Number(rewardAmount))) return setErrors({ rewardAmount: "Veuillez renseigner un montant valide" })
    if (balanceData?.value === undefined) return setErrors({ globalError: "Erreur lors de la récupération du solde" })
    if (rewardAmount === "") return setErrors({ rewardAmount: "Veuillez renseigner un montant" })
    if (balanceData?.value.isZero()) return setErrors({ rewardAmount: "Pas de fonds disponibles" })
    if (parseEther(rewardAmount).gt(parseEther(balanceData.formatted)))
      return setErrors({ rewardAmount: "Montant trop élevé" })

    try {
      write?.()
    } catch (error: unknown) {
      console.error("Error while writing to contract", error)
      if (error instanceof Error) setErrors({ globalError: "Erreur lors de la création du contrat de staking 😣" })
    }
  }

  return (
    <main>
      <Container maxW={"4xl"}>
        <Flex direction="column" gap="8" ref={parent}>
          <Heading as="h1" mt="8">
            Admin
          </Heading>

          <Heading as="h2" fontSize="x-large">
            Nouveau stake
          </Heading>
          <Text fontSize="lg">Lancement de stake ou stake actuel.</Text>

          {errors.globalError && (
            <Alert status="warning">
              <AlertIcon />
              <Box>
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{errors.globalError}</AlertDescription>
              </Box>
            </Alert>
          )}

          <Text fontSize="lg">
            ETH disponible
            <Text as="span" color={color} ml="4">
              {balanceData?.formatted}
            </Text>
          </Text>

          {addressCurrentStake !== ethers.constants.AddressZero ? (
            <Text fontSize="lg">Vous avez déjà un stake en cours.</Text>
          ) : (
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
                <Button
                  mt="8"
                  type="submit"
                  size="lg"
                  disabled={isLoadingBalance || isLoadingNewStake || hasErrors(errors)}
                >
                  Démarrer
                </Button>
              </Flex>
            </form>
          )}
        </Flex>
      </Container>
    </main>
  )
}
