import {
  useArkaErc20Approve,
  useArkaErc20BalanceOf,
  useArkaMasterCurrentStake,
  useArkaStakingAmountReward,
  useArkaStakingDeposit,
  useArkaStakingFinishAt,
  useArkaStakingStakeBalanceOf,
  usePrepareArkaErc20Approve,
  usePrepareArkaStakingDeposit,
} from "@/generated"
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
import { useAccount, useWaitForTransaction } from "wagmi"

type FormProps = {
  rewardAmount?: string
}

export const Staking = () => {
  const [parent] = useAutoAnimate()
  const [errors, setErrors] = useState<FormProps & { globalError?: string }>({})
  const { address } = useAccount()
  const [stakeAmount, setStakeAmount] = useState("")
  const color = useColorModeValue("blue.500", "cyan.500")
  const toast = useToast()

  // Balance de l'utilisateur en Arka
  // const {
  //   data: balanceInArka,
  //   isError: isErrorBalance,
  //   isLoading: isLoadingBalance,
  // } = useBalance({
  //   address,
  //   token: ArkaERC20Address,
  //   watch: true,
  // })

  const {
    data: balanceInArka,
    isError: isErrorBalance,
    isLoading: isLoadingBalance,
  } = useArkaErc20BalanceOf({
    args: [address || ethers.constants.AddressZero],
    watch: true,
  })

  console.log("balanceInArka", formatEther(balanceInArka || 0))

  // Current stake address, if any
  const { data: addressCurrentStake } = useArkaMasterCurrentStake({
    watch: true,
  })

  // Current stake finish date
  const { data: finishAt } = useArkaStakingFinishAt({
    address: addressCurrentStake,
    enabled: ethers.constants.AddressZero !== addressCurrentStake,
  })

  // Current stake reward amount
  const { data: amountReward } = useArkaStakingAmountReward({
    address: addressCurrentStake,
    enabled: ethers.constants.AddressZero !== addressCurrentStake,
  })

  // Get current stake balance of user
  const { data: arkaAlreadyStaked } = useArkaStakingStakeBalanceOf({
    address: addressCurrentStake,
    args: [address || ethers.constants.AddressZero],
    enabled: ethers.constants.AddressZero !== addressCurrentStake,
    watch: true,
  })

  // Deposit on ArkaStaking
  const { config: configDeposit } = usePrepareArkaStakingDeposit({
    address: addressCurrentStake,
    args: [parseEther(stakeAmount || "0")],
    enabled: ethers.constants.AddressZero !== addressCurrentStake,
  })
  const { isError: isErrorStakingDeposit, write: writeDeposit } = useArkaStakingDeposit(configDeposit)

  // Approve on ArkaERC20
  const { config: configApprove } = usePrepareArkaErc20Approve({
    args: [addressCurrentStake || ethers.constants.AddressZero, parseEther(stakeAmount || "0")],
    enabled: ethers.constants.AddressZero !== addressCurrentStake,
  })
  const { data: dataApprove, write: writeApprove } = useArkaErc20Approve(configApprove)
  const { isSuccess: isSuccessApprove } = useWaitForTransaction(dataApprove)

  useEffect(() => {
    if (isErrorBalance) setErrors({ globalError: "Erreur lors de la récupération du solde" })
    if (isErrorStakingDeposit) setErrors({ globalError: "Erreur lors de l'ajout d'Arka en staking" })
  }, [isErrorBalance, isErrorStakingDeposit])

  useEffect(() => {
    if (isSuccessApprove) {
      writeDeposit?.()
    }
  }, [isSuccessApprove, writeDeposit])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    console.log("on va ajouter", stakeAmount)

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
                    <FormControl isInvalid={Boolean(errors?.rewardAmount)}>
                      <FormLabel fontSize="lg">
                        Arka à staker (max: {ethers.utils.formatEther(balanceInArka || 0)})
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
                      <FormErrorMessage>{errors?.rewardAmount}</FormErrorMessage>
                    </FormControl>
                    <Button mt="8" type="submit" size="lg" disabled={isLoadingBalance || hasErrors(errors)}>
                      Staker
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
