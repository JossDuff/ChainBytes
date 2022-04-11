pragma solidity ^0.8.2;

import "./farmFactory.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

abstract contract farmOwnership is farmFactory, ERC721 {

  mapping (uint => address) farmApprovals;

  modifier onlyOwnerOf(uint _tokenId){
    require(msg.sender == farmToOwner[_tokenId]);
    _;
  }

  function ownerOfFarm(uint256 _tokenId) external view returns (address) {
    return farmToOwner[_tokenId];
  }

  // Functionality that supports transferring ownership of farms to another address
  function _transfer(address _from, address _to, uint256 _tokenId) internal override {
    farmToOwner[_tokenId] = _to;
    emit Transfer(_from, _to, _tokenId);
  }

  // Transfer ownership of a farm to another address
  function transferFarm(address _from, address _to, uint256 _tokenId) external payable {
    require (farmToOwner[_tokenId] == msg.sender || farmApprovals[_tokenId] == msg.sender);
    _transfer(_from, _to, _tokenId);
  }

  function approve(address to, uint256 tokenId) public override onlyOwnerOf(tokenId) {
    farmApprovals[tokenId] = to;
    emit Approval(msg.sender, to, tokenId);
  }
}
