import { InteractionType, Resource } from "@/arkaTypes"
import { useArkaMaster, useArkaMasterGetInteraction } from "@/generated"
import { CheckIcon, DeleteIcon } from "@chakra-ui/icons"
import { Button, ButtonGroup, Flex, IconButton, Td, Text, Tr, useToast } from "@chakra-ui/react"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { BigNumber, ethers } from "ethers"
import { getAddress } from "ethers/lib/utils.js"
import { useState } from "react"
import { FiHeart, FiThumbsDown, FiThumbsUp } from "react-icons/fi"
import { useAccount, useSigner } from "wagmi"
import { EndDate } from "./EndDate"

export const RowResource = ({ resource, index }: { resource: Resource; index: number }) => {
  const [parent] = useAutoAnimate()
  const { address } = useAccount()
  const toast = useToast()
  const [isVisited, setIsVisited] = useState(false)

  const { data: interaction } = useArkaMasterGetInteraction({
    args: [BigNumber.from(index), getAddress(address || ethers.constants.AddressZero)],
    watch: true,
  })

  const signer = useSigner()
  const arkaMasterContractWrite = useArkaMaster({ signerOrProvider: signer.data })

  const colorSelected = { colorScheme: "cyan" }

  const disabled = {
    isDisabled: interaction !== InteractionType.unset,
  }

  const handleClick = async (interaction: InteractionType) => {
    if (!isVisited)
      return toast({
        title: "Action requise",
        description: "Il est nécessaire de visiter le lien avant de voter.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      })

    try {
      await arkaMasterContractWrite?.interact(BigNumber.from(index), interaction)
    } catch (error: unknown) {
      console.error(error)
      if (error instanceof Error) {
        toast({
          title: "Erreur",
          description: error.message,
          status: "error",
          duration: 9000,
          isClosable: true,
        })
      }
    }
  }

  return (
    <Tr>
      <Td>{index}</Td>
      <Td>
        <Flex direction="column" gap="3">
          {resource.description}
          <Button
            ml="0"
            pl="0"
            variant="link"
            minWidth="max-content"
            maxWidth="max-content"
            onClick={() => {
              setIsVisited(true)
              window.open(resource.url, "_blank")
            }}
          >
            <Text fontSize={"sm"} color="violet">
              {resource.url}
            </Text>
          </Button>
          <EndDate value={resource.endDate} />
        </Flex>
      </Td>
      <Td>
        <Flex gap="8" justifyContent="center" alignItems="center">
          <ButtonGroup size="lg" isAttached variant="outline">
            <IconButton
              aria-label="love"
              icon={<FiHeart />}
              {...(interaction === InteractionType.love && colorSelected)}
              {...disabled}
              onClick={() => handleClick(InteractionType.love)}
            />
            <IconButton
              aria-label="like"
              icon={<FiThumbsUp />}
              {...(interaction === InteractionType.like && colorSelected)}
              {...disabled}
              onClick={() => handleClick(InteractionType.like)}
            />
            <IconButton
              aria-label="unlike"
              icon={<FiThumbsDown />}
              {...(interaction === InteractionType.unlike && colorSelected)}
              {...disabled}
              onClick={() => handleClick(InteractionType.unlike)}
            />
            <IconButton
              aria-label="like"
              icon={<DeleteIcon />}
              {...(interaction === InteractionType.toxic && colorSelected)}
              {...disabled}
              onClick={() => handleClick(InteractionType.toxic)}
            />
          </ButtonGroup>
          <div ref={parent}>
            {interaction !== InteractionType.unset && (
              <Flex gap="2" alignItems="center">
                <Text color="green.400">+ 2 Arkas</Text>
                <CheckIcon color="green.400" />
              </Flex>
            )}
          </div>
        </Flex>
      </Td>
    </Tr>
  )
}
