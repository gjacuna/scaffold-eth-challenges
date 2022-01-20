//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface IKoywePledge {
  function isPledged(address _pledger)
    external
    view
    returns (
      bool pledged
    );
  function getCommitment(address _pledger)
    external
    view
    returns (
      uint64 tonsCommitted
    );
  function getPledgeTime(address _pledger)
    external
    view
    returns (
      uint64 tonsCommitted
    );
}

contract CO2TokenContract is Ownable{

  mapping(address => uint256) public accruedSince;
  /// @dev A lower bound of the total supply. Does not take into account tokens minted as UBI by an address before it moves those (transfer or burn).  
  uint256 public totalSupply;

  /// @dev Name of the token.
  string public name;

  /// @dev Symbol of the token.
  string public symbol;

  /// @dev Number of decimals of the token.
  uint8 public decimals;

  IKoywePledge public koywePledge;

  using SafeMath for uint64;
  using SafeMath for uint256;

  constructor(address _koywePledge, uint256 _initialSupply, string memory _name, string memory _symbol) {
    koywePledge = IKoywePledge(_koywePledge);
    name = _name;
    symbol = _symbol;
    decimals = 18;
    totalSupply = _initialSupply;
  }

  function startDripping(address _pledger) external {
    require(koywePledge.isPledged(_pledger), "Address has not pledged.");
    require(accruedSince[_pledger] == 0, "Pledger is already emitting CO2.");
    accruedSince[_pledger] = koywePledge.getPledgeTime(_pledger);
  }

  function getEmittedCO2(address _pledger) public view returns (uint256 emitted) {
    if (accruedSince[_pledger] == 0 || !koywePledge.isPledged(_pledger)) return 0;
    else {
      uint256 accruedPerSecond = koywePledge.getCommitment(_pledger).mul(10**18).div(31556952);
      return accruedPerSecond.mul(block.timestamp.sub(accruedSince[_pledger]));
    }
  }

  function balanceOf(address _pledger) public view returns (uint256) {
    return getEmittedCO2(_pledger);
  }
}
