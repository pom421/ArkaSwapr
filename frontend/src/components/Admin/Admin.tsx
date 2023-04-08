import { ArkaMasterContractAddress } from "@/contracts/ArkaMaster"
import { useCustomEndStake } from "@/hooks/useCustomEndStake"
import { useCustomNewStake } from "@/hooks/useCustomNewStake"
import { useCustomReadStaking } from "@/hooks/useCustomReadStaking"
import useDebounce from "@/hooks/useDebounce"
import { isAddressZero, isFinisdhedStake } from "@/utils/contract"
import { formatTimestamp } from "@/utils/date"
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
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
  useColorModeValue
} from "@chakra-ui/react"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { formatEther, parseEther } from "ethers/lib/utils.js"
import { FormEvent, useEffect, useState } from "react"
import { useBalance } from "wagmi"

type FormProps = {
  rewardAmount?: string
}

export const Admin = () => {
  const [parent] = useAutoAnimate()
  const [errors, setErrors] = useState<FormProps & { globalError?: string }>({})
  const [rewardAmount, setRewardAmount] = useState("")
  const debouncedRewardAmount = useDebounce(rewardAmount, 500)

  const color = useColorModeValue("blue.500", "cyan.500")

  // Get current stake address, if any and its total suply.
  const { addressCurrentStake, finishAt, totalSupply } = useCustomReadStaking()

  // Get balance in ETH of ArkaMaster contract.
  const {
    data: balanceData,
    isError: isErrorBalance,
    isLoading: isLoadingBalance,
  } = useBalance({
    address: ArkaMasterContractAddress,
    watch: true,
  })

  // Get helpers for creating a new stake.
  const {
    isError: isErrorNewStake,
    error: errorNewStake,
    isLoading: isLoadingNewStake,
    isSuccess: isSuccessNewStake,
    write: writeNewStake,
  } = useCustomNewStake({
    rewardAmount: parseEther(debouncedRewardAmount || "0"),
    enabled: parseEther(debouncedRewardAmount || "0").gt(parseEther("0")),
  })

  // Get helpers for ending a stake.
  const {
    isError: isErrorEndStake,
    error: errorEndStake,
    isLoading: isLoadingEndStake,
    isSuccess: isSuccessEndStake,
    write: writeEndStake,
  } = useCustomEndStake({ enabled: finishAt && isFinisdhedStake(finishAt) })

  useEffect(() => {
    if (isErrorBalance) setErrors({ globalError: "Erreur lors de la récupération du solde" })
    if (isErrorNewStake) setErrors({ globalError: "Erreur lors de la création du contrat de staking" })
    if (isErrorEndStake)
      setErrors({
        globalError: errorEndStake?.message || "Erreur lors de la fermeture du contrat de staking",
      })
  }, [errorEndStake?.message, errorNewStake?.message, isErrorBalance, isErrorEndStake, isErrorNewStake])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isNaN(Number(rewardAmount))) return setErrors({ rewardAmount: "Veuillez renseigner un montant valide" })
    if (balanceData?.value === undefined) return setErrors({ globalError: "Erreur lors de la récupération du solde" })
    if (rewardAmount === "") return setErrors({ rewardAmount: "Veuillez renseigner un montant" })
    if (balanceData?.value.isZero()) return setErrors({ rewardAmount: "Pas de fonds disponibles" })
    if (parseEther(rewardAmount).gt(parseEther(balanceData.formatted)))
      return setErrors({ rewardAmount: "Montant trop élevé" })

    try {
      writeNewStake?.()
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

          {(isSuccessNewStake || isSuccessEndStake) && (
            <Alert status="success">
              <AlertIcon />
              <Box>
                <AlertTitle>{isSuccessNewStake ? "Stake créé" : "Stake terminé"}</AlertTitle>
              </Box>
            </Alert>
          )}

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

          {!isAddressZero(addressCurrentStake) ? (
            <>
              <Text fontSize="lg">Vous avez déjà un stake en cours.</Text>
              <Text fontSize="lg">
                {"Nb d'ARKA stakés"}
                <Text as="span" color={color} ml="4">
                  {formatEther(totalSupply || "0")} ARKA
                </Text>
              </Text>
              {finishAt && (
                <Text fontSize="lg">
                  {isFinisdhedStake(finishAt)
                    ? "Le stake en cours s'est terminé le "
                    : "Le stake en cours se termine le "}
                  <Text as="span" color={color} ml="3">
                    {finishAt ? formatTimestamp(finishAt) : ""}
                  </Text>
                </Text>
              )}
              {finishAt && isFinisdhedStake(finishAt) && (
                <>
                  <pre>Write ? {JSON.stringify({ writeEndStake }, null, 2)}</pre>
                  <br />
                  <pre>isLoadingEndStake?: {JSON.stringify(isLoadingEndStake, null, 2)}</pre>
                  <Button
                    mt="8"
                    type="submit"
                    size="lg"
                    disabled={!writeEndStake || isLoadingEndStake}
                    onClick={writeEndStake}
                    title="Clore le stake et rapatrier les récompenses non distribuées"
                  >
                    Clore le stake
                  </Button>
                </>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <Flex direction="row" gap="4">
                <FormControl isInvalid={Boolean(errors?.rewardAmount)}>
                  <FormLabel fontSize="lg">Arka à staker (max: {balanceData?.formatted})</FormLabel>
                  <NumberInput
                    name="rewardAmount"
                    placeholder="Amount"
                    value={rewardAmount}
                    min={0}
                    max={Number(balanceData?.formatted)}
                    step={0.1}
                    onChange={(rewardAmount) => {
                      setErrors({})
                      setRewardAmount(rewardAmount)
                    }}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
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
