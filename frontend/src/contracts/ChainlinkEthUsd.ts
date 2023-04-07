// TODO: delete because we use getPrice in ArkaMaster

export const ChainlinkEthUsdAddress = "0xf4AE7E15B1012edceD8103510eeB560a9343AFd3"

export const ChainlinkEthUsdAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_priceFeedEthUsd",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "getLatestPrice",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const
