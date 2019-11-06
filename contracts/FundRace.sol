pragma solidity ^0.5.8;

import "./openzeppelin/IERC20.sol";

contract FundRace {

    address public racer1;
    address public racer2;
    uint256 public endDate;
    IERC20 public donationToken;

    mapping(address => uint256) designations;
    mapping(address => bool) hasWithdrawnFlags;

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

    function withdrawWinnings() public
                                isAfterEnd()
                                isRacer(msg.sender)
                                hasNotWithdrawn(msg.sender)
    {
        hasWithdrawnFlags[msg.sender] = true;

        (uint256 racer1Designations, uint256 racer2Designations) = getDesignations();

        if (racer1Designations == racer2Designations) {
            donationToken.transfer(msg.sender, racer1Designations);
            return;
        }

        uint256 totalDonations = racer1Designations + racer2Designations;
        uint256 losersTake = totalDonations / 5;            // 20%
        uint256 winnersTake = totalDonations - losersTake;  // 80%

        bool isWinner = (msg.sender == racer1 && (racer1Designations > racer2Designations)) ||
                            (msg.sender == racer2 && (racer2Designations > racer1Designations));
        uint256 sendersTake;

        if (isWinner) {
            sendersTake = winnersTake;
        } else {
            sendersTake = losersTake;
        }

        donationToken.transfer(msg.sender, sendersTake);
    }

    function getDesignations() public view returns(uint256 racer1Designations, uint256 racer2Designations) {
        return (designations[racer1], designations[racer2]);
    }

    modifier isRacer(address _addr) {
        require(_addr == racer1 || _addr == racer2, "FundRace - Not Racer");
        _;
    }

    modifier hasNotWithdrawn(address _addr) {
        require(!hasWithdrawnFlags[_addr], "FundRace - Already Withdrawn");
        _;
    }

    modifier isBeforeEnd() {
        require(now < endDate, "FundRace - Past End Date");
        _;
    }

    modifier isAfterEnd() {
        require(now > endDate, "FundRace - Has Not Ended");
        _;
    }
}