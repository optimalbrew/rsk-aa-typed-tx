// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Bar {
    // when using "install code path", these variables will not get initialized. THe deployed bytecode will not have these values.
    // they are initialized only when a contract is deployed in the regular manner
    uint256 public unlockTime = 2;
    bool public initialized = true;
    
    function state() public payable returns (uint256) {
       // deployedBytecode will include hardcoded values like 10 (0x0a) here
       return unlockTime + 10;
    } 
}
