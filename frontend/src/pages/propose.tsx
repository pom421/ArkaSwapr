import Layout from "@/components/Layout"
import {
  useArkaMasterGetPriceForProposalInWei,
  useArkaMasterProposeResource,
  usePrepareArkaMasterProposeResource,
} from "@/generated"
import { hasErrors } from "@/utils/errors"
import { AtSignIcon } from "@chakra-ui/icons"
import {
  Alert,
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
  Select,
  Text,
  useToast,
} from "@chakra-ui/react"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { ethers } from "ethers"
import { FormEventHandler, ReactElement, useEffect, useState } from "react"

type FormErrorType = {
  description?: string
  url?: string
}

const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi

export default function Propose() {
  const [errors, setErrors] = useState<FormErrorType>({})
  const [parent] = useAutoAnimate()
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [currency, setCurrency] = useState("")
  const toast = useToast()

  const priceInWei = useArkaMasterGetPriceForProposalInWei()

  const priceInWeiString = ethers.utils.formatEther(priceInWei?.data || "0")

  const { config } = usePrepareArkaMasterProposeResource({
    args: [description, url],
    overrides: {
      value: ethers.utils.parseEther(priceInWeiString),
    },
  })
  const { isLoading, isSuccess, write } = useArkaMasterProposeResource(config)

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()

    const errors: FormErrorType = {}

    if (!description) errors.description = "La description ne peut pas être vide."
    if (!url) {
      errors.url = "L'url ne peut pas être vide."
    } else {
      if (!url.match(regex)) errors.url = "Le format d'URL n'est pas valide."
    }

    if (hasErrors(errors)) return setErrors(errors)
    else {
      setErrors({})
      console.debug("handleSubmit", description, url, currency)
      write?.()
    }
  }

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "La ressource a été ajoutée.",
        description: "Votre ressource sera visible dans quelques instants.",
        duration: 5000,
        isClosable: true,
      })

      setDescription("")
      setUrl("")
      setCurrency("")
    }
  }, [isSuccess, toast])

  return (
    <main>
      <Container maxW={"3xl"}>
        <Flex direction="column" gap="8">
          <Heading as="h1" mt="8">
            Proposer un nouveau site
          </Heading>

          <Text fontSize="lg">Proposer un nouveau site que tous les utilisateurs pourront voir.</Text>

          <Text fontSize="lg">
            Seulement 10$ (en équivalent ether) pour 7 jours de visibilité. Paiement en USDT ou en wETH.
          </Text>

          <div ref={parent}>
            {hasErrors(errors) && (
              <Alert status="error">
                <AlertIcon />
                Veuillez corriger le formulaire.
              </Alert>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="4">
              <FormControl isInvalid={Boolean(errors?.description)}>
                <FormLabel>Description</FormLabel>
                <Input
                  value={description}
                  onChange={(e) => {
                    setErrors((errors) => ({ ...errors, description: "" }))
                    setDescription(e.target.value)
                  }}
                  name="description"
                  placeholder="New kid on the block"
                />
                {/* <FormHelperText>La description ne peut pas être vide.</FormHelperText> */}
                <FormErrorMessage>{errors?.description}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={Boolean(errors?.url)}>
                <FormLabel>URL</FormLabel>
                <Input
                  value={url}
                  onChange={(e) => {
                    setErrors((errors) => ({ ...errors, url: "" }))
                    setUrl(e.target.value)
                  }}
                  name="url"
                  placeholder="Ex: www.arkaswapr.xyz"
                />
                <FormErrorMessage>{errors.url}</FormErrorMessage>
              </FormControl>
              <FormControl>
                <FormLabel>Token</FormLabel>
                <Select name="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="USDT">
                    <Flex>
                      <AtSignIcon />
                      USDT
                    </Flex>
                  </option>
                  <option value="wETH">wETH</option>
                </Select>
              </FormControl>
              <Alert status="info" mt="8" variant="solid">
                <AlertIcon />
                {/* Mettre un titre à l'alert */}
                <AlertTitle>Estimation du prix</AlertTitle>
                <Text> {priceInWeiString} ethers</Text>
              </Alert>
              <Button mt="8" type="submit" size="lg" disabled={isLoading || hasErrors(errors)}>
                Ajouter
              </Button>
            </Flex>
          </form>
        </Flex>
      </Container>
    </main>
  )
}

Propose.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>
}
