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
    
    // TODO: a DAO would be able to allow to set the price of proposal and rewards.
    uint etherPrice7days = 600000000000000; // 0,000600 ETH, aka 10€ en avril 2023
    uint amountArkaRewards = 2000000000000000000; // 2 ARKA

    // Make a struct, named Resource, with 3 fields: description, url, duration
    struct Resource {
        string description;
        string url;
        uint endDate;
    }
    // makes a sort of enum in solidity, named interactType, with values "like", "unlike", "love", "toxic"
    enum InteractType {
        unset,
        like,
        unlike,
        love,
        toxic
    }

    // Make an array of Resource, named resources
    Resource[] public resources;

    // Mapping of user interactions over an identified resource. A user can only have 1 interaction per resource.
    mapping(uint => mapping(address => InteractType)) public interactions;

    event Interaction(uint idResource, address user, InteractType interaction);
    event ResourceProposed(string description, string url, uint endDate);

    constructor(address _arkaToken) {
        arkaToken = ArkaERC20(_arkaToken);
    }

    /**
     * A user can interact one time with a resource (liking, unliking, etc.) and get rewarded by minting 1 token of arkaToken.
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
