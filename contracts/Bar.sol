// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Bar {
    uint256 public unlockTime;
    bool public initialized;
    
    function state() public payable returns (uint256) {
       return unlockTime + 10;
    } 
}
