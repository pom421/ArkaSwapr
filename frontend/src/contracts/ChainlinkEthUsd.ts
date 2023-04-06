// TODO: delete because we use getPrice in ArkaMaster

export const ChainlinkEthUsdAddress = "0x7645182d5c559E4e2615a472C48F029ad649B156"

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
