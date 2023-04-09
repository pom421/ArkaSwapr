// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract ChainlinkEthUsd {
    /**
     * @notice address of the ETH/USD aggregator
     */
    AggregatorV3Interface internal priceFeedEthUsd;

    constructor(address _priceFeedEthUsd) {
        priceFeedEthUsd = AggregatorV3Interface(_priceFeedEthUsd);
    }

    /**
     * @notice Returns the latest price.
     */
    function getLatestPrice() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeedEthUsd.latestRoundData();
        return price;
    }
}
