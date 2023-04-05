// TODO: delete because we use getPrice in ArkaMaster

export const ChainlinkEthUsdAddress = "0x9e7F7d0E8b8F38e3CF2b3F7dd362ba2e9E82baa4"

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
