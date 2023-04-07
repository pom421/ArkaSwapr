import { useArkaErc20BalanceOf } from "@/generated"
import { useCustomArkaERC20Approve } from "@/hooks/useCustomArkaERC20Approve"
import { useCustomStaking } from "@/hooks/useCustomStaking"
import { useCustomStakingDeposit } from "@/hooks/useCustomStakingDeposit"
import useDebounce from "@/hooks/useDebounce"
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
  useColorModeValue,
  useToast
} from "@chakra-ui/react"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { BigNumber, ethers } from "ethers"
import { formatEther, parseEther } from "ethers/lib/utils.js"
import { FormEvent, useEffect, useState } from "react"
import { useAccount } from "wagmi"

type FormProps = {
  stakeAmount?: string
}

export const Staking = () => {
  const [parent] = useAutoAnimate()
  const [errors, setErrors] = useState<FormProps & { globalError?: string }>({})
  const { address } = useAccount()
  const [stakeAmount, setStakeAmount] = useState("")
  const debouncedStakeAmount = useDebounce(stakeAmount, 500)

  const color = useColorModeValue("blue.500", "cyan.500")
  const toast = useToast()

  const {
    data: balanceInArka,
    isError: isErrorBalance,
    isLoading: isLoadingBalance,
  } = useArkaErc20BalanceOf({
    args: [address || ethers.constants.AddressZero],
    watch: true,
  })

  console.log("stakeAmount:", stakeAmount)
  console.log("stakeAmount formatEther:", formatEther(stakeAmount || "0"))

  const { addressCurrentStake, finishAt, amountReward, arkaAlreadyStaked } = useCustomStaking({ address })

  // Deposit on ArkaStaking
  const {
    isError: isErrorStakingDeposit,
    error: errorStakingDeposit,
    isLoading: isLoadingStakingDeposit,
    isSuccess: isSuccessStakingDeposit,
    write: writeStakingDeposit,
  } = useCustomStakingDeposit({
    addressCurrentStake,
    stakeAmount: parseEther(debouncedStakeAmount || "0"),
  })

  // Approve on ArkaERC20
  const {
    isError: isErrorApprove,
    error: errorApprove,
    write: writeApprove,
    isLoading: isLoadingApprove,
    isSuccess: isSuccessApprove,
  } = useCustomArkaERC20Approve({
    addressCurrentStake,
    stakeAmount: parseEther(debouncedStakeAmount || "0"),
  })

  useEffect(() => {
    if (isErrorBalance) setErrors({ globalError: "Erreur lors de la récupération du solde" })
    if (isErrorStakingDeposit) setErrors({ globalError: "Erreur lors de l'ajout d'Arka en staking" })
  }, [isErrorBalance, isErrorStakingDeposit])

  useEffect(() => {
    if (isSuccessApprove) {
      writeStakingDeposit?.()
    }
  }, [isSuccessApprove, writeStakingDeposit])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    console.log("on va ajouter", debouncedStakeAmount)

    try {
      writeApprove?.()
      toast({
        title: "Arka ajoutés en staking",
        duration: 5000,
        isClosable: true,
      })
    } catch (error: unknown) {
      console.error("Error while deposit ", error)
      if (error instanceof Error) setErrors({ globalError: "Erreur lors de l'ajout d'Arka en staking 😣" })
    }
  }

  /*
  
   
    si stake non fini
      affichage des informations sur le stake en cours: date de fin, montant
      si pas d'arka stakés encore, ajout form
      sinon, affichage des arkas stakés
    si stake fini
      si pas d'arka stakés, affichage "aucun arka staké"
      sinon, affichage des arkas stakés + récompense + bouton pour récupérer les arkas + bouton pour récupérer les récompenses

  
  Form pour ajouter des arka
  - faire un approve sur ArkaERC20 du montant
  - faire un deposit sur ArkaStaking du montant
  - vérifier dans Remix que le stakedBalanceOf est bien mis à jour

  */

  const isFinisdhedStake = (timestamp: BigNumber) => {
    return timestamp.toNumber() * 1000 < new Date().getTime()
  }

  return (
    <main>
      <Container maxW={"4xl"}>
        <Flex direction="column" gap="8" ref={parent}>
          <Heading as="h1" mt="8">
            Staking
          </Heading>

          <Text fontSize="lg">
            Vous pouvez staker vos ARKA pour gagner des récompenses. Pour cela, vous devez avoir au moins 1 ARKA dans
            votre portefeuille. Ils seront bloqués pour une durée de 10 minutes. Vous pourrez ensuite les récupérer et
            obtenir les récompenses en ETH.
          </Text>

          {errors.globalError && (
            <Alert status="warning">
              <AlertIcon />
              <Box>
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{errors.globalError}</AlertDescription>
              </Box>
            </Alert>
          )}

          {!finishAt ? (
            <Text fontSize="lg">Pas de stake en cours.</Text>
          ) : (
            <>
              <Text fontSize="lg">Il y a un stake en cours.</Text>

              <Text fontSize="lg">
                Récompense totale
                <Text as="span" color={color} ml="3">
                  {amountReward && ethers.utils.formatEther(amountReward)} {ethers.constants.EtherSymbol}
                </Text>
              </Text>

              <Text fontSize="lg">
                {isFinisdhedStake(finishAt)
                  ? "Le stake en cours s'est terminé le "
                  : "Le stake en cours se termine le "}
                <Text as="span" color={color} ml="3">
                  {finishAt ? formatTimestamp(finishAt) : ""}
                </Text>
              </Text>

              {arkaAlreadyStaked && arkaAlreadyStaked.gt(0) && (
                <Text fontSize="lg">
                  Vous avez déjà staké{" "}
                  <Text as="span" color={color} ml="3">
                    {ethers.utils.formatEther(arkaAlreadyStaked)} {ethers.constants.EtherSymbol}
                  </Text>
                </Text>
              )}

              {!isFinisdhedStake(finishAt) && (
                <form onSubmit={handleSubmit}>
                  <Flex direction="row" gap="4">
                    <FormControl isInvalid={Boolean(errors?.stakeAmount)}>
                      <FormLabel fontSize="lg">
                        ARKA à staker (max: {ethers.utils.formatEther(balanceInArka || 0)})
                      </FormLabel>
                      <NumberInput
                        name="stakeAmount"
                        placeholder="Amount"
                        value={stakeAmount}
                        min={0}
                        max={Number(ethers.utils.formatEther(balanceInArka || 0))}
                        step={0.1}
                        onChange={(stakeAmount) => {
                          setErrors({})
                          setStakeAmount(stakeAmount)
                        }}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <FormErrorMessage>{errors?.stakeAmount}</FormErrorMessage>
                    </FormControl>
                    <Button
                      mt="8"
                      type="submit"
                      size="lg"
                      disabled={isLoadingBalance || isLoadingApprove || isLoadingStakingDeposit || hasErrors(errors)}
                    >
                      {isLoadingApprove || isLoadingStakingDeposit ? "Stake en cours..." : "Staker"}
                    </Button>
                  </Flex>
                </form>
              )}
            </>
          )}
        </Flex>
      </Container>
    </main>
  )
}
