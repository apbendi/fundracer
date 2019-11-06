pragma solidity ^0.5.8;

import "./openzeppelin/IERC20.sol";

contract FundRace {

    address public racer1;
    address public racer2;
    uint256 public endDate;
    IERC20 public donationToken;

    mapping(address => uint256) designations;

    event Donation(address indexed donor, address indexed racer, uint256 indexed amount);

    constructor(
                address _racer1,
                address _racer2,
                uint256 _endDate,
                address _donationTokenAddr
                )
                public
    {
        require(address(0) != _racer1, "FundRace: Null Racer 1");
        require(address(0) != _racer2, "FundRace: Null Racer 2");
        require(now > endDate, "FundRace: Past End Date");
        require(address(0) != _donationTokenAddr, "FundRace: Null Token");

        racer1 = _racer1;
        racer2 = _racer2;
        endDate = _endDate;
        donationToken = IERC20(_donationTokenAddr);
    }

    function makeDonation(uint256 _amount, address _designation) public isRacer(_designation) isBeforeEnd() {

        designations[_designation] += _amount;

        require(
            donationToken.transferFrom(msg.sender, address(this), _amount),
            "FundRace - Transfer Failed"
            );

        emit Donation(msg.sender, _designation, _amount);
    }

    function getDesignations() public view returns(uint256 racer1Designations, uint256 racer2Designations) {
        return (designations[racer1], designations[racer2]);
    }

    modifier isRacer(address _addr) {
        require(_addr == racer1 || _addr == racer2, "FundRace - Not Racer");
        _;
    }

    modifier isBeforeEnd() {
        require(now < endDate, "FundRace - Past End Date");
        _;
    }
}