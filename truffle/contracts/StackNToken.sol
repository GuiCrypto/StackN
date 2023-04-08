// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract StackNToken is ERC20, Ownable {

    address public stackNMaster;

    constructor(address StackNMaster) ERC20("StackN", "STK") {
        stackNMaster=StackNMaster;
    }

    function setStackNMaster(address _stackNMaster) external onlyOwner {
        stackNMaster = _stackNMaster;
    }

    function mintStackN(address _account, uint _amount) external {
        require(msg.sender == stackNMaster, "Only StackNMaster can mint");
        _mint(_account, _amount);
    }
}