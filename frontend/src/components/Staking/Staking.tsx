import { ArkaERC20Address } from "@/contracts/ArkaERC20"
import {
  useArkaMasterCurrentStake,
  useArkaMasterStartNewStake,
  useArkaStakingAmountReward,
  useArkaStakingFinishAt,
  useArkaStakingStakeBalanceOf,
  usePrepareArkaMasterStartNewStake,
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
  useColorModeValue
} from "@chakra-ui/react"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { BigNumber, ethers } from "ethers"
import { parseEther } from "ethers/lib/utils.js"
import { FormEvent, useEffect, useState } from "react"
import { useAccount, useBalance } from "wagmi"

type FormProps = {
  rewardAmount?: string
}

export const Staking = () => {
  const [parent] = useAutoAnimate()
  const [errors, setErrors] = useState<FormProps & { globalError?: string }>({})
  const { address } = useAccount()
  const [stakeAmount, setStakeAmount] = useState("")
  const color = useColorModeValue("blue.500", "cyan.500")

  // Balance de l'utilisateur en Arka
  const {
    data: balanceInArka,
    isError: isErrorBalance,
    isLoading: isLoadingBalance,
  } = useBalance({
    address,
    token: ArkaERC20Address,
    watch: true,
  })

  // Current stake address, if any
  const { data: addressCurrentStake } = useArkaMasterCurrentStake({
    watch: true,
  })

  // Current stake finish date
  const { data: finishAt } = useArkaStakingFinishAt({
    address: addressCurrentStake,
  })

  // Current stake reward amount
  const { data: amountReward } = useArkaStakingAmountReward({
    address: addressCurrentStake,
  })

  const { data: arkaAlreadyStaked } = useArkaStakingStakeBalanceOf({
    address: addressCurrentStake,
    args: [address || ethers.constants.AddressZero],
  })

  // Start a new stake
  const { config } = usePrepareArkaMasterStartNewStake({
    args: [parseEther(stakeAmount || "0")],
  })

  const { isLoading: isLoadingNewStake, isError: isErrorNewStake, write } = useArkaMasterStartNewStake(config)

  useEffect(() => {
    if (isErrorBalance) setErrors({ globalError: "Erreur lors de la récupération du solde" })
    if (isErrorNewStake) setErrors({ globalError: "Erreur lors de la création du contrat de staking" })
  }, [isErrorBalance, isErrorNewStake])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
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

          {addressCurrentStake === ethers.constants.AddressZero ? (
            <Text fontSize="lg">Pas de stake en cours.</Text>
          ) : (
            <>
              <Text fontSize="lg">Il y a un stake en cours.</Text>

              {finishAt && (
                <>
                  <Text fontSize="lg">
                    {isFinisdhedStake(finishAt)
                      ? "Le stake en cours s'est terminé le "
                      : "Le stake en cours se termine le "}
                    <Text as="span" color={color} ml="3">
                      {finishAt ? formatTimestamp(finishAt) : ""}
                    </Text>
                  </Text>

                  <Text fontSize="lg">
                    Récompense totale
                    <Text as="span" color={color} ml="3">
                      {amountReward && ethers.utils.formatEther(amountReward)} {ethers.constants.EtherSymbol}
                    </Text>
                  </Text>
                </>
              )}
            </>
          )}

          {finishAt && arkaAlreadyStaked && arkaAlreadyStaked.gt(0) && (
            <Text fontSize="lg">
              Vous avez déjà staké{" "}
              <Text as="span" color={color} ml="3">
                {ethers.utils.formatEther(arkaAlreadyStaked)} {ethers.constants.EtherSymbol}
              </Text>
            </Text>
          )}

          {finishAt && !isFinisdhedStake(finishAt) && (
            <form onSubmit={handleSubmit}>
              <Flex direction="row" gap="4">
                <FormControl isInvalid={Boolean(errors?.rewardAmount)}>
                  <FormLabel fontSize="lg">Arka à staker (max: {balanceInArka?.formatted})</FormLabel>
                  <NumberInput
                    name="rewardAmount"
                    placeholder="Amount"
                    value={stakeAmount}
                    min={0}
                    max={Number(balanceInArka?.formatted || 0)}
                    step={0.1}
                    onChange={(e) => {
                      setErrors({})
                      setStakeAmount(e)
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
                  Staker
                </Button>
              </Flex>
            </form>
          )}
        </Flex>
      </Container>
    </main>
  )
}
