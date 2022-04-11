pragma solidity ^0.8.2;

import "./farmFactory.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

abstract contract foremanOwnership is farmFactory, ERC721 {

  mapping (uint => address) foremanApprovals;

  modifier onlyOwnerOf(uint _tokenId){
    require(msg.sender == foremanToOwner[_tokenId]);
    _;
  }

  function ownerOf(uint256 _tokenId) public view override returns (address) {
    return foremanToOwner[_tokenId];
  }

  // Functionality that supports transferring ownership of foreman role to another address
  function _transfer(address _from, address _to, uint256 _tokenId) internal override {
    foremanToOwner[_tokenId] = _to;
    emit Transfer(_from, _to, _tokenId);
  }
  
  // Transfer ownership of a foreman contract to another address
  function transferFrom(address _from, address _to, uint256 _tokenId) public override {
    require (foremanToOwner[_tokenId] == msg.sender || foremanApprovals[_tokenId] == msg.sender);
    _transfer(_from, _to, _tokenId);
  }

  function approve(address to, uint256 tokenId) public override onlyOwnerOf(tokenId) {
    foremanApprovals[tokenId] = to;
    emit Approval(msg.sender, to, tokenId);
  }

}
