// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract SimpleStorage {
  uint256 value;
  string greeter;

  event ValueChanged(uint256 newValue);
  event GreetChanged(string newGreet);


  function read() public view returns (uint256) {
    return value;
  }

  function write(uint256 newValue) public {
    value = newValue;
    emit ValueChanged(newValue);
  }

  function greet() public view returns(string memory) {
    return greeter;
  }

  function setGreet(string calldata _greeter) public {
    greeter = _greeter;
    emit GreetChanged(_greeter);
  }
    
}
