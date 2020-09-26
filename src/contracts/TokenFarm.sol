pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
  string public name = "Dapp Token Farm";
  address public owner;
  DappToken public dappToken;
  DaiToken public daiToken;

  address[] public stakers;
  mapping(address => uint) public stakingBalance;
  mapping(address => bool) public hasStaked;
  mapping(address => bool) public isStaking;

  // runs once when the smart contract is deployed to the network
  constructor(DappToken _dappToken, DaiToken _daiToken) public {
    dappToken = _dappToken;
    daiToken = _daiToken;
    owner = msg.sender;
  }

  // staking tokens (deposit)
  function stakeTokens(uint _amount) public {
    // require amount greater than 0
    require(_amount > 0, "amount cannot be 0");
    
    // transfer mock DAI tokens to this contract for staking
    daiToken.transferFrom(msg.sender, address(this), _amount);

    // update staking balance
    stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

    // add user to stakers array only if they haven't staked already
    if (!hasStaked[msg.sender]) {
      stakers.push(msg.sender);
    }

    // update staking status
    isStaking[msg.sender] = true;
    hasStaked[msg.sender] = true;
  }

  // unstaking tokens (withdraw)

  // issuing tokens
  function issueTokens() public {
    // only owner can call this function
    require(msg.sender == owner, "caller must be the owner");

    // issue tokens to all stakers
    for (uint i = 0; i < stakers.length; i++) {
      address recipient = stakers[i];
      uint balance = stakingBalance[recipient];
      if (balance > 0) {
        dappToken.transfer(recipient, balance);
      }
    }
  }
}