// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BookieBet {
    struct BetInfo {
        uint id;
        address creator;
        uint amount;
        string title;
        string description;
        string category;
        string twitterHandle;
        uint endDate;
        uint initialPoolAmount;
        string imageURL;
        bool isClosed;
        uint supportCount;
        uint againstCount;
        bool outcome;
    }
    
    struct Bet {
        uint id;
        address creator;
        uint amount;
        string title;           
        string description;
        string category;        
        string twitterHandle;  
        uint endDate;         
        uint initialPoolAmount; 
        string imageURL;        
        bool isClosed;
        address[] support;
        address[] against;
        mapping(address => bool) hasJoined;
        bool outcome; 
    }

    uint public betCounter;
    mapping(uint => Bet) public bets;
    mapping(address => uint) public balances;
    
    // Agent functionality
    address public agentAddress;
    address public owner;
    mapping(string => address) public twitterToAddress; // Maps Twitter usernames to wallet addresses
    mapping(address => uint) public userBetCredits; // Tracks pre-purchased bet credits
    uint public agentFeePercentage = 5; // Default 5% fee for agent services
    uint public agentBalance; // Track the agent's earned fees

    event BetCreated(uint betId, address indexed creator, string title, string description, string category, string twitterHandle, uint endDate, uint amount, uint initialPoolAmount, string imageURL);
    event BetJoined(uint betId, address indexed participant, bool support);
    event BetClosed(uint betId, bool outcome);
    event Withdrawal(address indexed user, uint amount);
    event TwitterHandleRegistered(string twitterHandle, address userAddress);
    event BetCreditsPurchased(address indexed user, uint amount);
    event AgentFeePaid(address indexed user, uint amount);
    event AgentFeeWithdrawn(uint amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyAgent() {
        require(msg.sender == agentAddress, "Only agent can call this function");
        _;
    }

    function setAgentAddress(address _agentAddress) external onlyOwner {
        agentAddress = _agentAddress;
    }

    function setAgentFeePercentage(uint _percentage) external onlyOwner {
        require(_percentage <= 20, "Fee cannot exceed 20%");
        agentFeePercentage = _percentage;
    }

    function createBet(
        string memory _title,
        string memory _description,
        string memory _category,
        string memory _twitterHandle,
        uint _endDate,
        uint _amount,
        uint _initialPoolAmount,
        string memory _imageURL
    ) external payable {
        require(msg.value == _amount + _initialPoolAmount, "Must send exact bet amount plus initial pool amount");
        require(_endDate > block.timestamp, "End date must be in the future");
        
        uint _betId = betCounter;
        Bet storage newBet = bets[_betId];
        newBet.id = _betId;
        newBet.creator = msg.sender;
        newBet.amount = _amount;
        newBet.title = _title;
        newBet.description = _description;
        newBet.category = _category;
        newBet.twitterHandle = _twitterHandle;
        newBet.endDate = _endDate;
        newBet.initialPoolAmount = _initialPoolAmount;
        newBet.imageURL = _imageURL;
        newBet.isClosed = false;
        
        betCounter++;
        
        emit BetCreated(
            _betId, 
            msg.sender, 
            _title, 
            _description, 
            _category, 
            _twitterHandle, 
            _endDate, 
            _amount, 
            _initialPoolAmount, 
            _imageURL
        );
    }

    function joinBet(uint _betId, bool _support) external payable {
        Bet storage bet = bets[_betId];
        require(!bet.isClosed, "Bet is closed");
        require(block.timestamp < bet.endDate, "Bet has expired");
        require(!bet.hasJoined[msg.sender], "Already joined");
        require(msg.value == bet.amount, "Incorrect bet amount");
        
        if (_support) {
            bet.support.push(msg.sender);
        } else {
            bet.against.push(msg.sender);
        }
        
        bet.hasJoined[msg.sender] = true;
        
        emit BetJoined(_betId, msg.sender, _support);
    }

    function closeBet(uint _betId, bool _outcome) external onlyAgent {
        Bet storage bet = bets[_betId];
        require(!bet.isClosed, "Bet already closed");
        require(block.timestamp >= bet.endDate, "Cannot close before end date");
        
        bet.isClosed = true;
        bet.outcome = _outcome;
        
        address[] storage winners = _outcome ? bet.support : bet.against;
        uint totalPrize = bet.amount * (bet.support.length + bet.against.length) + bet.initialPoolAmount;
        uint prizePerWinner = winners.length > 0 ? totalPrize / winners.length : 0;
        
        for (uint i = 0; i < winners.length; i++) {
            balances[winners[i]] += prizePerWinner;
        }
        
        emit BetClosed(_betId, _outcome);
    }

    function withdraw() external {
        uint amount = balances[msg.sender];
        require(amount > 0, "No balance to withdraw");
        
        balances[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
        
        emit Withdrawal(msg.sender, amount);
    }

    // User registration and bet credit functions
    function registerTwitterHandle(string memory twitterHandle) external {
        twitterToAddress[twitterHandle] = msg.sender;
        emit TwitterHandleRegistered(twitterHandle, msg.sender);
    }

    function buyBetCredits() external payable {
        require(msg.value > 0, "Must send some ether");
        userBetCredits[msg.sender] += msg.value;
        emit BetCreditsPurchased(msg.sender, msg.value);
    }

    // Calculate agent fee based on bet amount
    function calculateAgentFee(uint amount) internal view returns (uint) {
        return (amount * agentFeePercentage) / 100;
    }

    // Agent functions with compensation
    function createBetForUser(
        string memory twitterHandle,
        string memory title,
        string memory description,
        string memory category,
        uint endDate,
        uint amount,
        uint initialPoolAmount,
        string memory imageURL
    ) external onlyAgent {
        address userAddress = twitterToAddress[twitterHandle];
        require(userAddress != address(0), "Twitter handle not registered");
        require(endDate > block.timestamp, "End date must be in the future");
        
        // Calculate agent fee
        uint agentFee = calculateAgentFee(amount + initialPoolAmount);
        uint totalCost = amount + initialPoolAmount + agentFee;
        
        require(userBetCredits[userAddress] >= totalCost, "Insufficient bet credits");
        
        // Deduct total amount from user credits
        userBetCredits[userAddress] -= totalCost;
        
        // Add fee to agent balance
        agentBalance += agentFee;
        
        uint _betId = betCounter;
        Bet storage newBet = bets[_betId];
        newBet.id = _betId;
        newBet.creator = userAddress;
        newBet.amount = amount;
        newBet.title = title;
        newBet.description = description;
        newBet.category = category;
        newBet.twitterHandle = twitterHandle;
        newBet.endDate = endDate;
        newBet.initialPoolAmount = initialPoolAmount;
        newBet.imageURL = imageURL;
        newBet.isClosed = false;
        
        betCounter++;
        

        emit AgentFeePaid(userAddress, agentFee);
    }

    function joinBetForUser(
        string memory twitterHandle,
        uint betId,
        bool support
    ) external onlyAgent {
        address userAddress = twitterToAddress[twitterHandle];
        require(userAddress != address(0), "Twitter handle not registered");
        
        Bet storage bet = bets[betId];
        require(!bet.isClosed, "Bet is closed");
        require(block.timestamp < bet.endDate, "Bet has expired");
        require(!bet.hasJoined[userAddress], "User already joined this bet");
        
        // Calculate agent fee
        uint agentFee = calculateAgentFee(bet.amount);
        uint totalCost = bet.amount + agentFee;
        
        require(userBetCredits[userAddress] >= totalCost, "Insufficient bet credits");
        
        // Deduct total amount from user credits
        userBetCredits[userAddress] -= totalCost;
        
        // Add fee to agent balance
        agentBalance += agentFee;
        
        if (support) {
            bet.support.push(userAddress);
        } else {
            bet.against.push(userAddress);
        }
        
        bet.hasJoined[userAddress] = true;
        
        emit BetJoined(betId, userAddress, support);
        emit AgentFeePaid(userAddress, agentFee);
    }

    // Agent fee withdrawal
    function withdrawAgentFees() external onlyAgent {
        uint amount = agentBalance;
        require(amount > 0, "No fees to withdraw");
        
        agentBalance = 0;
        payable(agentAddress).transfer(amount);
        
        emit AgentFeeWithdrawn(amount);
    }

    // Additional utility functions
    function getUserBetCredits(address user) external view returns (uint) {
        return userBetCredits[user];
    }

    function getTwitterHandleAddress(string memory twitterHandle) external view returns (address) {
        return twitterToAddress[twitterHandle];
    }

    function withdrawCredits(uint amount) external {
        require(userBetCredits[msg.sender] >= amount, "Insufficient bet credits");
        
        userBetCredits[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
    
    function getAgentBalance() external view returns (uint) {
        return agentBalance;
    }

    // Split the getBetDetails function to avoid stack too deep errors
    function getBetBasicDetails(uint _betId) external view returns (
        uint id,
        address creator,
        uint amount,
        string memory title,
        string memory description,
        string memory category,
        string memory twitterHandle
    ) {
        Bet storage bet = bets[_betId];
        return (
            bet.id,
            bet.creator,
            bet.amount,
            bet.title,
            bet.description,
            bet.category,
            bet.twitterHandle
        );
    }
    
    function getBetExtendedDetails(uint _betId) external view returns (
        uint endDate,
        uint initialPoolAmount,
        string memory imageURL,
        bool isClosed,
        uint supportCount,
        uint againstCount,
        bool outcome
    ) {
        Bet storage bet = bets[_betId];
        return (
            bet.endDate,
            bet.initialPoolAmount,
            bet.imageURL,
            bet.isClosed,
            bet.support.length,
            bet.against.length,
            bet.outcome
        );
    }

    // Alternative approach using structs - this won't hit stack too deep issues
    function getBetDetailsAsStruct(uint _betId) external view returns (BetInfo memory) {
        Bet storage bet = bets[_betId];
        return BetInfo({
            id: bet.id,
            creator: bet.creator,
            amount: bet.amount,
            title: bet.title,
            description: bet.description,
            category: bet.category,
            twitterHandle: bet.twitterHandle,
            endDate: bet.endDate,
            initialPoolAmount: bet.initialPoolAmount,
            imageURL: bet.imageURL,
            isClosed: bet.isClosed,
            supportCount: bet.support.length,
            againstCount: bet.against.length,
            outcome: bet.outcome
        });
    }
}