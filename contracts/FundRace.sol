pragma solidity ^0.5.8;

contract FundRace {

    address public racer1;
    address public racer2;

    constructor(address _racer1, address _racer2) public {
        racer1 = _racer1;
        racer2 = _racer2;
    }
}