// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ArkaERC20.sol";
import "./ArkaStaking.sol";
import "./ChainlinkEthUsd.sol";
import "hardhat/console.sol";

/**
 * @title ArkaMaster
 * @author Po Mauguet
 * @notice This contract is used for orchestrating all features of ArkaSwapr.
 */
contract ArkaMaster is Ownable {
    ArkaERC20 public immutable arkaToken;

    // Price of ETH in USD from Chainlink.
    ChainlinkEthUsd public priceFeedEthUsd;

    /**
     * @notice The current stake contract.
     */
    ArkaStaking public currentStake;

    /**
     * @dev The price of a proposal is 7 days of hosting on ArkaSwapr.
     */
    uint usdPrice7days = 10; // Initial price. May change in the future with a DAO to set this price.

    /**
     * @dev The price of a proposal is 7 days of hosting on ArkaSwapr.
     */
    uint etherPrice7days = 6e14; // 0,000600 ETH, aka 10€ en avril 2023
    /**
     * @dev The reward for interacting with a resource is 2 ARKA.
     */
    uint amountArkaRewards = 2e18; // 2 ARKA

    /**
     * @notice A resource is a piece of content that can be liked, unliked, loved or toxic.
     */
    struct Resource {
        string description;
        string url;
        uint endDate;
    }
    /**
     * @notice An interaction is a reaction of a user on a resource.
     */
    enum InteractType {
        unset,
        love,
        like,
        unlike,
        toxic
    }

    /**
     * @notice List of resources.
     */
    Resource[] public resources;

    /**
     * @notice List of users's interactions on resources (id resource => user => interaction).
     */
    mapping(uint => mapping(address => InteractType)) public interactions;

    event Interaction(uint idResource, address user, InteractType interaction);
    event ResourceProposed(string description, string url, uint endDate);
    event NewStake(uint amountReward);
    event EndStake();
    event EthReceived(address sender, uint amount);

    constructor(address _arkaToken, address _priceFeedEthUsd) {
        arkaToken = ArkaERC20(_arkaToken);
        priceFeedEthUsd = ChainlinkEthUsd(_priceFeedEthUsd);
    }

    receive() external payable {
        emit EthReceived(msg.sender, msg.value);
    }

    /**
     * @notice Get the interaction on a resource for a user, if any.
     */
    function getInteraction(
        uint _idResource,
        address _user
    ) external view returns (InteractType) {
        return interactions[_idResource][_user];
    }

    /**
     * @notice Get the resource at index.
     */
    function getResource(
        uint _idResource
    ) external view returns (Resource memory) {
        return resources[_idResource];
    }

    /**
     * @notice Get the resource length.
     */
    function getResourceLength() external view returns (uint) {
        return resources.length;
    }

    /**
     * @notice Get the price of a proposal in Wei.
     */
    function getPriceForProposalInWei() public view returns (uint) {
        require(
            priceFeedEthUsd.getLatestPrice() > 0,
            "Price feed is not available"
        );

        return
            (1 ether * usdPrice7days) /
            uint(priceFeedEthUsd.getLatestPrice() / 1e8);
    }

    /**
     * A user can propose a resource to be added to the platform.
     *
     * @param _description The description to be added in the UI.
     * @param _url The URL of the resource.
     */
    function proposeResource(
        string calldata _description,
        string calldata _url
    ) external payable {
        require(
            msg.value >= getPriceForProposalInWei(),
            "You need to pay the price of 7 days of hosting"
        );

        // Add the resource to the array of resources
        resources.push(Resource(_description, _url, block.timestamp + 7 days));

        emit ResourceProposed(_description, _url, block.timestamp + 7 days);
    }

    /**
     * A user can interact one time with a resource (liking, unliking, etc.) and get rewarded by minting 1 token of arkaToken.
     *
     * @param _idResource The id of the resource.
     * @param _interaction The type of interaction.
     */
    function interact(uint _idResource, InteractType _interaction) public {
        require(
            interactions[_idResource][msg.sender] == InteractType.unset,
            "You already add interaction on this resource"
        );

        interactions[_idResource][msg.sender] = _interaction;

        // Rewards the user by minting some arkaTokens to the user.
        arkaToken.mintArka(msg.sender, amountArkaRewards);

        emit Interaction(_idResource, msg.sender, _interaction);
    }

    /**
     * @notice Start a stake contract, if no stake is running.
     *
     * @param _amountReward Amount of ETH to be sent to the new stake contract
     */
    function startNewStake(uint _amountReward) external onlyOwner {
        require(
            address(currentStake) == address(0),
            "A stake is already running"
        );

        require(_amountReward > 0, "Amount must be > 0");
        require(_amountReward < address(this).balance, "Not enough funds");

        currentStake = (new ArkaStaking){value: _amountReward}(
            address(arkaToken)
        );

        emit NewStake(_amountReward);
    }

    /**
     * @notice End the current stake contract, if any.
     */
    function endCurrentStake() external onlyOwner {
        require(address(currentStake) != address(0), "No stake is running");
        require(
            currentStake.finishAt() < block.timestamp,
            "Stake is not finished"
        );

        // require(
        //     address(currentStake).balance == 0,
        //     "You can't end a stake because reward is not fully distributed. Inform your user or get back the reward"
        // );

        currentStake.transferUnclaimedReward();
        currentStake = ArkaStaking(address(0));

        emit EndStake();
    }
}
