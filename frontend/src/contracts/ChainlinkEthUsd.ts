export const ChainlinkEthUsdAddress = "0x64f5219563e28EeBAAd91Ca8D31fa3b36621FD4f"

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
