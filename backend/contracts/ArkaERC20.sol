// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ArkaERC20
 * @dev An ERC20 token for Arka
 */
contract ArkaERC20 is ERC20, Ownable {
    /**
     * @notice The initial supply of ARKA is 10^8.
     */
    uint constant _initialSupply = 1000000000000000000;

    /**
     * @notice The address of the ArkaMaster contract.
     */
    address public arkaMaster;

    constructor() ERC20("Arka", "ARK") {
        _mint(msg.sender, _initialSupply);
    }

    /**
     * @notice Setter to limit to arkaMaster the capacity to mint tokens.
     *
     * @param _arkaMaster The address of the ArkaMaster contract.
     */
    function setArkaMaster(address _arkaMaster) external onlyOwner {
        arkaMaster = _arkaMaster;
    }

    /**
     * @notice Mint tokens for a given account.
     *
     * @param _account The address of the account to mint tokens for.
     * @param _amount The amount of tokens to mint.
     */
    function mintArka(address _account, uint _amount) external {
        require(msg.sender == arkaMaster, "Only ArkaMaster can mint");
        _mint(_account, _amount);
    }
}
