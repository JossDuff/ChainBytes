// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/Ownable.sol";

contract farmFactory is Ownable {
  event newFarm(string name, string region, address[] foremen);
  event newForeman(uint workerId);

  // The farm struct will hold the details to distinguish one farm from another
  struct Farm {
    string farmName;
    string region;
    //array to hold all of the foreman contracts controlled by this farm
    address[] formen;
  }

  Farm[] public farms;
  //mapping to keep track of who owns what farm
  mapping (uint => address) farmToOwner;
  // Allow the creation of a new worker when they first connect to the DApp
  function createFarm(string memory _farmName, string memory _region, address[] memory _foreman) external onlyOwner {
    farms.push(Farm(_farmName, _region, _foreman));
    uint id = farms.length - 1;
    farmToOwner[id] = msg.sender;
    emit newFarm(_farmName, _region, _foreman);
  }
  //function to create new foreman
  //need the address of the new foreman and region
  function createForemanContract(string memory region, address foremanAddress) public {
    foreman fm = new foreman();
    fm.createForeman(region, foremanAddress);
    //now we have to get the correct farm who is owned by msg.sender to add this foreman to it
    uint size = farms.length;
    for (uint i = 0; i < size; i++){
      if (farmToOwner[i] == msg.sender){
        //now the correct farm keeps track of this foreman
        (farms[i].formen).push(address(fm));
      }
    }
  }
}

contract foreman {

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

  function createForeman(string memory _region, address newForemanAddress) external  {
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