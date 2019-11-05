pragma solidity ^0.5.8;

import "./openzeppelin/IERC20.sol";

contract FundRace {

    address public racer1;
    address public racer2;
    IERC20 public donationToken;

    constructor(
                address _racer1,
                address _racer2,
                address _donationTokenAddr
                )
                public
    {
        require(address(0) != _racer1, "FundRace: Null Racer 1");
        require(address(0) != _racer2, "FundRace: Null Racer 2");
        require(address(0) != _donationTokenAddr, "FundRace: Null Token");

        racer1 = _racer1;
        racer2 = _racer2;
        donationToken = IERC20(_donationTokenAddr);
    }

    function makeDonation(uint256 _amount, address _designation) public isRacer(_designation) {
        require(
            donationToken.transferFrom(msg.sender, address(this), _amount),
            "FundRace - Transfer Failed"
            );
    }

    modifier isRacer(address _addr) {
        require(_addr == racer1 || _addr == racer2, "FundRace - Not Racer");
        _;
    }
}