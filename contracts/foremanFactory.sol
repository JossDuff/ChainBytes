// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./farmFactory.sol";

contract foremanFactory is farmFactory {

  struct Foreman {
    string region;
    uint numTimesCheckedIn;
  }
  
  Foreman[] public foremen;

  // Returns the Foreman given the address.
  // Set an address to a foreman: addressToForeman[bobAddress] = bobForeman;
  // Get a foreman from address: Foreman bobForeman = addressToForeman[bobAdress];
  // Only need to use this in a situation where we would normally 
  // search through the whole workers array for a specific foreman 
  // based on their address.
  mapping (address=>Foreman) internal addressToForeman;

  function createForeman(string memory _region, address newForemanAddress) external onlyOwner {
    Foreman memory _newForeman = Foreman(_region, 0);
    foremen.push(_newForeman);

    // Ties the foreman to an address by adding it to the mapping.
    // This way we can be given just an address and return it's foreman object.
    // ex: Foreman bobForeman = addressToForeman[bobsAdress];
    addressToForeman[newForemanAddress] = _newForeman;

  }
  
  // Going with approach 'a' for now from our contract map just so we have something down:
  // https://docs.google.com/document/d/1LAGfZoLi2p2hZDc_PrnpJCeAjLyFpHN0yOR0bNA2WOE/edit
  function checkIn(address worker) external {

  }

}