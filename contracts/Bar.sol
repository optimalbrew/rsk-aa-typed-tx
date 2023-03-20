// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Bar {
    uint public unlockTime = 2;
    bool public initialized = true;

    function state() public payable returns (uint) {
       return unlockTime;
    } 
}
