import { Resource } from "@/arkaTypes"
import { useArkaMaster, useArkaMasterResourceProposedEvent } from "@/generated"
import { uniqBy } from "lodash"
import { useEffect, useState } from "react"
import { useProvider } from "wagmi"

/**
 * Show only resources that are not finished yet.
 *
 * @param resources List of resources from the contract
 * @returns valid resources
 */
const filterResources = (resources: Resource[]) => {
  return resources.filter((resource) => resource.endDate.toNumber() * 1000 > Date.now())
}

const eventName = "ResourceProposed"

export const useResourcesFromEvent = () => {
  const [resources, setResources] = useState<Resource[]>([])
  const provider = useProvider()
  const arkaMasterContract = useArkaMaster({ signerOrProvider: provider })

  // Récupération des events passés de manière statique.
  useEffect(() => {
    const run = async () => {
      if (arkaMasterContract) {
        // @ts-ignore
        const filters = arkaMasterContract.filters[eventName]()

        if (filters && arkaMasterContract) {
          const allEvents = await arkaMasterContract.queryFilter(filters, 0, "latest")

          setResources(
            filterResources(
              allEvents.map((event) => ({
                description: event.args?.[0],
                url: event.args?.[1],
                endDate: event.args?.[2],
              })),
            ),
          )
        }
      }
    }

    run()
  }, [arkaMasterContract])

  useArkaMasterResourceProposedEvent({
    // @ts-ignore
    listener(description, url, endDate) {
      console.log("watchEvent", description, url, endDate)

      // Remove potential duplicates.
      const newResources = uniqBy([...resources, { description, url, endDate }], (resource) =>
        [resource.description, resource.url, resource.endDate].join(""),
      )

      setResources(filterResources(newResources))
    },
  })

  return resources
}
