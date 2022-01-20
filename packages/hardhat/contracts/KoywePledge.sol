//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract KoywePledge is Ownable{
  struct Pledge {
    bool pledged;
    uint64 pledgeTime;
    uint64 tonsCommitted;
    //maybe add a duration, count or indexes to this. TODO
  }
  mapping ( address => Pledge ) private pledges;
  
  event NewPledge(address indexed pledger, uint64 commitment, uint64 pledgeTime);
  event Unpledge(address indexed pledger);

  constructor() {
  }

  function newPledge(uint64 _commitment) public {
    Pledge storage pledge = pledges[msg.sender];
    require(_commitment > pledge.tonsCommitted, "New Pledge can't be lower than previous one.");
    pledge.pledged = true;
    pledge.tonsCommitted = _commitment;
    pledge.pledgeTime = uint64(block.timestamp);
    emit NewPledge(msg.sender, _commitment, pledge.pledgeTime);
  }

  function isPledged(address _pledger) public view returns (bool){
    Pledge memory pledge = pledges[_pledger];
    return pledge.pledged;
  }
  
  function getCommitment(address _pledger) public view returns (uint64){
    Pledge memory pledge = pledges[_pledger];
    return pledge.tonsCommitted;
  }

  function getPledgeTime(address _pledger) public view returns (uint64){
    Pledge memory pledge = pledges[_pledger];
    return pledge.pledgeTime;
  }

  function quit() public {
    require(pledges[msg.sender].pledged, "You're not pledged, why waste gas?");
    Pledge storage pledge = pledges[msg.sender];
    pledge.pledged = false;
    pledge.tonsCommitted = uint64(0);
    emit Unpledge(msg.sender);
  }
}