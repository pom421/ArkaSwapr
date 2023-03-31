// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ArkaERC20.sol";

/**
 * @title ArkaMaster
 * @author Po Mauguet
 * @notice This contract is used for orchestrating all features of ArkaSwapr.
 */
contract ArkaMaster is Ownable {
    ArkaERC20 public immutable arkaToken;
    // Mapping of user interactions over an identified resource. A user can only have 1 interaction per resource.
    mapping(uint => mapping(address => InteractType)) public interactions;

    // makes a sort of enum in solidity, named interactType, with values "like", "unlike", "love", "toxic"
    enum InteractType {
        unset,
        like,
        unlike,
        love,
        toxic
    }

    constructor(address _arkaToken) {
        arkaToken = ArkaERC20(_arkaToken);
    }

    // A user can interact one time with a resource (liking, unliking, etc.) and get rewarded by minting 1 token of arkaToken.
    function interact(uint idResource, InteractType interaction) public {
        require(
            interactions[idResource][msg.sender] == InteractType.unset,
            "You already interacted with this resource"
        );

        interactions[idResource][msg.sender] = interaction;

        // Rewards the user by minting 2 arkaTokens to the user.
        arkaToken.mintArka(msg.sender, 2000000000000000000);
    }
}
