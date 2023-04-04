// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ArkaERC20.sol";
import "hardhat/console.sol";

/**
 * @title ArkaMaster
 * @author Po Mauguet
 * @notice This contract is used for orchestrating all features of ArkaSwapr.
 */
contract ArkaMaster is Ownable {
    ArkaERC20 public immutable arkaToken;

    // TODO: make a DAO to allow setting proposal's price and rewards.

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
        like,
        love,
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

    constructor(address _arkaToken) {
        arkaToken = ArkaERC20(_arkaToken);
    }

    function getInteraction(
        uint _idResource,
        address _user
    ) external view returns (InteractType) {
        return interactions[_idResource][_user];
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
     * A user can propose a resource to be added to the platform.
     *
     * @param _description The description to be added in the UI.
     * @param _url The URL of the resource.
     */
    function proposeResource(
        string calldata _description,
        string calldata _url
    ) external payable {
        console.log("dans ProposeResource", _description, msg.value);
        require(
            msg.value >= etherPrice7days,
            "You need to pay the price of 7 days of hosting"
        );

        // Add the resource to the array of resources
        resources.push(Resource(_description, _url, block.timestamp + 7 days));

        emit ResourceProposed(_description, _url, block.timestamp + 7 days);
    }
}
