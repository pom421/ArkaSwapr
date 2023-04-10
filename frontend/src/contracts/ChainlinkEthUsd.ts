// TODO: delete because we use getPrice in ArkaMaster

export const ChainlinkEthUsdAddress = "0x6D712CB50297b97b79dE784d10F487C00d7f8c2C"

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
