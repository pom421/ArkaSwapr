// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title ArkaERC20
 * @dev An ERC20 token for Arka
 */
contract ArkaERC20 is ERC20 {
    uint constant _initialSupply = 1000000000000000000;
    
    // constructor(uint256 initialSupply) ERC20("Arka", "ARK") {
    constructor() ERC20("Arka", "ARK") {
        _mint(msg.sender, _initialSupply);
    }
}
