// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract farmFactory is Ownable {
  event newFarm(string name, string region);
  event newForeman(uint workerId);

  // The farm struct will hold the details to distinguish one farm from another
  struct Farm {
    string farmName;
    string region;
    //array to hold all of the foreman contracts controlled by this farm
  }

  foremanRole[] public foremen;
  Farm[] public farms;

  //mapping to keep track of who owns what farm
  mapping (uint=>address) farmToOwner;
  mapping (uint=>address) foremanToOwner;

  // Allow the creation of a new worker when they first connect to the DApp
  function createFarm(string memory _farmName, string memory _region) external onlyOwner {
    farms.push(Farm(_farmName, _region));
    uint id = farms.length - 1;
    farmToOwner[id] = msg.sender;
    emit newFarm(_farmName, _region);
  }

  //function to create new foreman
  //need the address of the new foreman and region
  function createForemanContract(string memory region, address foremanAddress) public onlyOwner {
    // Add the new foreman onto the array of foremen
    foremen.push(new foremanRole(region));
    uint id = foremen.length - 1;

    // Map the foreman's ID with the address of the foreman
    foremanToOwner[id] = foremanAddress;

  }
}

contract foremanRole {
  
  string region;
  // Constructor to set the region that THIS foreman is working at
  constructor(string memory _region) {
    region = _region;
  }

  // Keep track of checkin times for workers that have checked in under this foreman
  // Checkin times will be in the format: 'Time(UTC) \n'
  // NB: Worker can figure out times that they worked based on looking through all foremen and checking if their
  // address pops up for valid checkInTimes
  mapping (address=>string) checkInTime;
  mapping (address=> uint) lastPaidTime;
  
  // Going with approach 'a' for now from our contract map just so we have something down:
  // https://docs.google.com/document/d/1LAGfZoLi2p2hZDc_PrnpJCeAjLyFpHN0yOR0bNA2WOE/edit
  // NB: Need to add a check that a user wasn't checked in so close to a previous check in time
  function checkIn(address _worker) external {
    string memory currentTime = checkInTime[_worker];
    currentTime = string(abi.encodePacked(currentTime, Strings.toString(block.timestamp), "\n"));
    checkInTime[_worker] = currentTime;
  }
}