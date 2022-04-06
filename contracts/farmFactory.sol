// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/Ownable.sol";

contract farmFactory is Ownable {
  event newFarm(string name, string region);
  event newForeman(uint workerId);

  // The farm struct will hold the details to distinguish one farm from another
  struct Farm {
    string farmName;
    string region;
  }

  Farm[] public farms;

  // Allow the creation of a new worker when they first connect to the DApp
  function createFarm(string memory _farmName, string memory _region) external onlyOwner {
    farms.push(Farm(_farmName, _region));
    emit newFarm(_farmName, _region);
  }

  // For tests.js
  function getFarmName(uint _index) public view onlyOwner returns(string memory) {
    return farms[_index].farmName;
  }

  
}