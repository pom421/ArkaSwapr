// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ArkaERC20
 * @dev An ERC20 token for Arka
 */
contract ArkaERC20 is ERC20, Ownable {
    uint constant _initialSupply = 1000000000000000000;

    address public arkaMaster;

    // constructor(uint256 initialSupply) ERC20("Arka", "ARK") {
    constructor() ERC20("Arka", "ARK") {
        _mint(msg.sender, _initialSupply);
    }

    /**
     * @dev Setter to mean to the ERC20 which contract can mint tokens.
     *
     * @param _arkaMaster The address of the ArkaMaster contract.
     */
    function setArkaMaster(address _arkaMaster) external onlyOwner {
        arkaMaster = _arkaMaster;
    }

    function mintArka(address _account, uint _amount) external {
        require(msg.sender == arkaMaster, "Only ArkaMaster can mint");
        _mint(_account, _amount);
    }
}
