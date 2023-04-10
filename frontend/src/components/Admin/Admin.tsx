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
  useColorModeValue,
  useToast
} from "@chakra-ui/react"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { ethers } from "ethers"
import { formatEther, parseEther } from "ethers/lib/utils.js"
import { FormEvent, useState } from "react"
import { useBalance } from "wagmi"

type FormProps = {
  rewardAmount?: string
}

export const Admin = () => {
  const [parent] = useAutoAnimate()
  const toast = useToast()
  const color = useColorModeValue("blue.500", "cyan.500")
  const [errors, setErrors] = useState<FormProps>({})
  const [rewardAmount, setRewardAmount] = useState("")
  const debouncedRewardAmount = useDebounce(rewardAmount, 500)

  // Get current stake address, if any and its total suply.
  const { addressCurrentStake, finishAt, totalSupply } = useCustomReadStaking()

  // Get balance in ETH of ArkaMaster contract.
  const { data: balanceData, isLoading: isLoadingBalance } = useBalance({
    address: ArkaMasterContractAddress,
    watch: true,
    onError: () => {
      toast({
        title: "Erreur.",
        description: "Le solde du contrat n'a pas pu être récupéré.",
        duration: 5000,
        isClosable: true,
        status: "error",
      })
    },
  })

  // Get helpers for creating a new stake.
  const { isLoading: isLoadingNewStake, write: writeNewStake } = useCustomNewStake({
    rewardAmount: parseEther(debouncedRewardAmount || "0"),
    enabled: parseEther(debouncedRewardAmount || "0").gt(parseEther("0")),
    onSuccess: () => {
      toast({
        title: "Succès.",
        description: "Le stake a bien été créé.",
        duration: 5000,
        isClosable: true,
        status: "success",
      })
    },
    onError: () => {
      toast({
        title: "Erreur.",
        description: "Le stake n'a pas été créé.",
        duration: 5000,
        isClosable: true,
        status: "error",
      })
    },
  })

  // Get helpers for ending a stake.
  const { isLoading: isLoadingEndStake, write: writeEndStake } = useCustomEndStake({
    enabled: Boolean(finishAt && isFinisdhedStake(finishAt) && !isAddressZero(addressCurrentStake)),
    onSuccess: () => {
      toast({
        title: "Succès.",
        description: "Le stake a été achevé correctement.",
        duration: 5000,
        isClosable: true,
        status: "success",
      })
    },
    onError: () => {
      toast({
        title: "Erreur.",
        description: "Le stake ne s'est pas achevé correctement.",
        duration: 5000,
        isClosable: true,
        status: "error",
      })
    },
  })

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // This case is already handled by the onError but it's necessary to narrow the type.
    if (balanceData?.value === undefined) return

    if (isNaN(Number(rewardAmount))) return setErrors({ rewardAmount: "Veuillez renseigner un montant valide" })
    if (rewardAmount === "") return setErrors({ rewardAmount: "Veuillez renseigner un montant" })
    if (balanceData?.value.isZero()) return setErrors({ rewardAmount: "Pas de fonds disponibles" })
    if (parseEther(rewardAmount).gt(parseEther(balanceData.formatted)))
      return setErrors({ rewardAmount: "Montant trop élevé" })

    writeNewStake?.()
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

          <Text fontSize="lg">
            ETH disponible
            <Text as="span" color={color} ml="4">
              {balanceData?.formatted} {ethers.constants.EtherSymbol}
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
                  <FormLabel fontSize="lg">ETH à staker (max: {balanceData?.formatted})</FormLabel>
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
