// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Factory.sol";

contract LaunchpadAgent {
    Factory public immutable factory;
    address public agentAddress;
    address public owner;
    uint public agentFeePercentage = 5; // Default 5% fee for agent services
    mapping(string => address) public twitterToAddress; // Maps Twitter usernames to wallet addresses
    mapping(address => uint) public userTokenCredits; // Tracks pre-purchased token credits


    event AgentFeeWithdrawn(uint amount);
    event TwitterHandleRegistered(string twitterHandle, address userAddress);
    event TokenCreditsAdded(address indexed user, uint amount);

    modifier onlyAgent() {
        require(msg.sender == agentAddress, "Only agent can call this function");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(address _factory, address _agentAddress) {
        factory = Factory(_factory);
        agentAddress = _agentAddress;
        owner = msg.sender;
    }

    function setAgentAddress(address _agentAddress) external onlyOwner {
        require(_agentAddress != address(0), "Invalid agent address");
        agentAddress = _agentAddress;
    }

    function setAgentFeePercentage(uint _percentage) external onlyOwner {
        require(_percentage <= 20, "Fee cannot exceed 20%");
        agentFeePercentage = _percentage;
    }   

    function registerTwitterHandle(string memory twitterHandle) external {
        require(bytes(twitterHandle).length > 0, "Invalid twitter handle");
        twitterToAddress[twitterHandle] = msg.sender;
        emit TwitterHandleRegistered(twitterHandle, msg.sender);
    }

    function buyTokenCredits() external payable {
        require(msg.value > 0, "Must send some ether");
        userTokenCredits[msg.sender] += msg.value;
        emit TokenCreditsAdded(msg.sender, msg.value);
    }

    function calculateAgentFee(uint amount) internal view returns (uint) {
        return (amount * agentFeePercentage) / 100;
    }

    function createTokenForUserViaTwitter(
        string memory twitterHandle,
        string memory _name, 
        string memory _symbol,
        string memory _metadataURI
    ) external onlyAgent {
        address userAddress = twitterToAddress[twitterHandle];
        require(userAddress != address(0), "Twitter handle not registered");
        _createTokenForUser(userAddress, _name, _symbol, _metadataURI);
    }

    function createTokenForUserViaAddress(
        address userAddress,
        string memory _name, 
        string memory _symbol,
        string memory _metadataURI
    ) external onlyAgent {
        require(userAddress != address(0), "Twitter handle not registered");
        _createTokenForUser(userAddress, _name, _symbol, _metadataURI);
    }

    function _createTokenForUser(
        address userAddress,
        string memory _name,
        string memory _symbol,
        string memory _metadataURI
    ) internal {
        uint baseFee = factory.fee();
        uint agentFee = calculateAgentFee(baseFee);
        uint totalCost = baseFee + agentFee;

        require(userTokenCredits[userAddress] >= totalCost, "Insufficient token credits");
        
        // Deduct total amount from user credits
        userTokenCredits[userAddress] -= totalCost;

        // Create token through factory
        factory.create{value: baseFee}(_name, _symbol, _metadataURI, userAddress);
    }

    function withdrawAgentFees() external onlyAgent {
        uint balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = payable(agentAddress).call{value: balance}("");
        require(success, "Agent fee transfer failed");
        emit AgentFeeWithdrawn(balance);
    }

    function getAgentBalance() external view returns (uint) {
        return address(this).balance;
    }

    function getUserTokenCredits(address user) external view returns (uint) {
        return userTokenCredits[user];
    }

    function getTwitterHandleAddress(string memory twitterHandle) external view returns (address) {
        return twitterToAddress[twitterHandle];
    }

    function withdrawCredits(uint amount) external {
        require(userTokenCredits[msg.sender] >= amount, "Insufficient token credits");
        userTokenCredits[msg.sender] -= amount;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Credit withdrawal failed");
    }
}
