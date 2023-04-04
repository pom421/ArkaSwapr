import { InteractionType, Resource } from "@/arkaTypes"
import { useArkaMasterGetInteraction } from "@/generated"
import { DeleteIcon } from "@chakra-ui/icons"
import { ButtonGroup, Flex, IconButton, Link, Td, Text, Tr } from "@chakra-ui/react"
import { BigNumber } from "ethers"
import { getAddress } from "ethers/lib/utils.js"
import { FiHeart, FiThumbsDown, FiThumbsUp } from "react-icons/fi"
import { EndDate } from "./EndDate"

export const RowResource = ({
  resource,
  index,
  userAddress,
}: {
  resource: Resource
  index: number
  userAddress: string
}) => {
  const { data: interaction } = useArkaMasterGetInteraction({
    args: [BigNumber.from(index), getAddress(userAddress)],
  })

  const color = { colorScheme: "cyan" }

  const disabled = {
    isDisabled: interaction !== InteractionType.unset,
  }

  return (
    <Tr>
      <Td>{index}</Td>
      <Td>
        <Flex direction="column" gap="3">
          {resource.description}
          <Link href={resource.url}>
            <Text fontSize={"sm"} color="violet">
              {resource.url}
            </Text>
          </Link>
          <EndDate value={resource.endDate} />
        </Flex>
      </Td>
      <Td>
        <ButtonGroup size="lg" isAttached variant="outline">
          <IconButton
            aria-label="like"
            icon={<FiThumbsUp />}
            {...(interaction === InteractionType.like && color)}
            {...disabled}
          />
          <IconButton
            aria-label="unlike"
            icon={<FiThumbsDown />}
            {...(interaction === InteractionType.unlike && color)}
            {...disabled}
          />
          <IconButton
            aria-label="love"
            icon={<FiHeart />}
            {...(interaction === InteractionType.love && color)}
            {...disabled}
          />
          <IconButton
            aria-label="like"
            icon={<DeleteIcon />}
            {...(interaction === InteractionType.toxic && color)}
            {...disabled}
          />
        </ButtonGroup>
      </Td>
    </Tr>
  )
}
