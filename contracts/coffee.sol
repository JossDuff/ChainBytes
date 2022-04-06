// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/Ownable.sol";

contract coffee is Ownable{

    // Modifier to add to functions that only a farm address can call.
    // Checks isFarm to see if that address is mapped to 'true', indicating
    // that it is a farm.
    // If the address is mapped to a false value (the address isn't a farm)
    // the caller won't be able to use the function with this 'onlyFarm'
    // modifier attatched.
    modifier onlyFarm {
        require(isFarm[msg.sender]);
        _;
    }

    // Modifier to add to functions that only foremen can call.
    // Checks isForemen function to see if the address is mapped to 'true',
    // indicating that it is a foreman.
    // If the address is mapped to a false value (the address isn't a foreman)
    // the caller won't be able to use the function with this 'onlyForeman'
    // modifier attatched.   
    modifier onlyForeman {
        require(isForeman[msg.sender]);
        _;
    }

    // Mapping to indicate if an address is a farm.
    // Can use this to verify an address is a farm.
    // 'bool' starts as false by default, and is set to true
    // in the newFarm function. 
    mapping(address => bool) isFarm;

    // Only the owner (admin) can call this function to create a new farm.
    // TODO: maybe any address should be able to call this to create their
    // own farm.
    function newFarm(address _farmAddress) public onlyOwner {
        // Adds the _farmAddress to the mapping and sets boolean as true,
        // indicating that this address is a farm.
        isFarm[_farmAddress] = true;
    }



    struct maybeForeman {
        address owner;
        bool isForeman;
    }

    // Mapping for verifying an address is a foreman.
    // Used in onlyForeman modifier.
    mapping(address => bool) isForeman;

    // Double mapping for address (farm) => address (forman) => bool (isForeman).
    // It's really a mapping of farm addresses to the space of all addresses
    // with a flag (bool isForeman) indicating this address is a foreman at 
    // the farm.
    // This way we can associate a foreman's address with a farm.
    mapping(address => maybeForeman[]) farmForemen;


    // Is to be called by a farm address to create a new foreman for that farm.
    // 'address _foremanAddress' is the address of the foreman to be added to the farm.
    function newForeman(address _foremanAddress) public onlyFarm {

        // Creates a new maybeForeman struct with the foreman's address and sets
        // 'isForeman' to true, indicating that this address is a foreman.
        maybeForeman memory _newForeman = maybeForeman(_foremanAddress, true);

        // Adds the new foreman address to the mapping of farm's foremen.
        // msg.sender is the farm calling this function who wants a new foreman.
        farmForemen[msg.sender].push(_newForeman);

        // Additionally sets the isForeman mapping to true.
        isForeman[_foremanAddress] = true;

    }


    function checkIn(address _workerAddress) public onlyForeman {

    }
    
}