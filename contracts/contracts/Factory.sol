// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Token} from "./Token.sol";
import "./NativeLiquidityPool.sol";

contract Factory {
    uint256 public constant TARGET = 3 ether;
    uint256 public constant TOKEN_LIMIT = 500_000 ether;
    
    uint constant BASE_REWARD_PERCENTAGE = 3; // 3% reward
    uint256 public immutable fee;
    address public owner;

    uint256 public totalTokens;
    address[] public tokens;
    mapping(address => TokenSale) public tokenToSale;
    mapping(address => mapping(address => uint256)) public userTokenContributions;
    mapping(address => mapping(address => uint256)) public userEthContributions;
    mapping(address => mapping(address => bool)) public hasClaimedReward;
    mapping(address => address[]) public tokenContributors;

    struct TokenSale {
        address token;
        string name;
        string metadataURI;
        address creator;
        uint256 sold;
        uint256 raised;
        bool isOpen;
        bool isLiquidityCreated;
    }

    NativeLiquidityPool public nativeLiquidityPool;
    
    event Created(address indexed token);
    event RewardClaimed(address indexed user, address indexed token, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(uint256 _fee) {
        fee = _fee;
        owner = msg.sender;
    }

    function setLiquidityPool(address _liquidityPool) external onlyOwner {
        nativeLiquidityPool = NativeLiquidityPool(_liquidityPool);
    }

    function create(
        string memory _name, 
        string memory _symbol,
        string memory _metadataURI,
        address _creator
    ) external payable {
        require(msg.value >= fee, "Creator fee not met");

        // Default to msg.sender if _creator is zero address
        if (_creator == address(0)) {
            _creator = msg.sender;
        }

        Token token = new Token(_creator, _name, _symbol, _metadataURI, 1_000_000 ether);
        tokens.push(address(token));
        totalTokens++;

        TokenSale memory sale = TokenSale(address(token), _name, _metadataURI, _creator, 0, 0, true, false);
        tokenToSale[address(token)] = sale;

        emit Created(address(token));
    }


    function buy(address _token, uint256 _amount) external payable{
        TokenSale storage sale = tokenToSale[_token];

        require(sale.token != address(0) && sale.isOpen, "!available");
        require(_amount >= 1 ether && _amount <= 10000 ether, "!amount");
        
        // Calculate the price if 1 token based upon total bought
        uint256 price = getCost(sale.sold) * (_amount / 10 ** 18);
        require(msg.value >= price, "Insufficient ETH received");

        // Record the contribution
        if (userTokenContributions[_token][msg.sender] == 0) {
            tokenContributors[_token].push(msg.sender); // Store unique contributors
        }
        userTokenContributions[_token][msg.sender] += _amount;
        userEthContributions[_token][msg.sender] += msg.value;
        
        // transfer tokens to the buyer's wallet
        Token(_token).transfer(msg.sender, _amount);
        
        // Update the sale
        sale.sold += _amount;
        sale.raised += msg.value;
        // Make sure fund raising goal isn't met, since if its met we don't want people to keep buy tokens
        if (sale.sold >= TOKEN_LIMIT || sale.raised >= TARGET){
            sale.isOpen = false;
            if (!sale.isLiquidityCreated){
                triggerLiquidityCreation(_token);
                sale.isLiquidityCreated = true;
            }
        }
    }

    function triggerLiquidityCreation(address _token) internal {
        TokenSale storage sale = tokenToSale[_token];
        require(!sale.isLiquidityCreated, "Liquidity already created"); 
        Token memeTokenCt = Token(_token);
        uint256 tokenBalance = memeTokenCt.balanceOf(address(this));

        (address[] memory contributors, uint256[] memory contributorAmounts) = getContributors(_token);

        memeTokenCt.approve(address(nativeLiquidityPool), tokenBalance);
        nativeLiquidityPool.addLiquidity{value: sale.raised}(_token, tokenBalance, contributors, contributorAmounts);
    }

    function calculateReward(address _token, address user) internal view returns (uint256) {
        if (!tokenToSale[_token].isLiquidityCreated || 
            hasClaimedReward[_token][user] ||
            userTokenContributions[_token][user] == 0) {
            return 0;
        }

        uint256 userTokens = userTokenContributions[_token][user];
        TokenSale storage sale = tokenToSale[_token];
        return (sale.raised * BASE_REWARD_PERCENTAGE * userTokens) / (sale.sold * 100);
    }
 
    function claimReward(address _token) public {
        require(tokenToSale[_token].isLiquidityCreated, "Liquidity not created yet");
        require(!hasClaimedReward[_token][msg.sender], "Reward already claimed");
        require(userTokenContributions[_token][msg.sender] > 0, "No contribution found");

        uint256 reward = calculateReward(_token, msg.sender);
        require(reward > 0, "No reward available");

        hasClaimedReward[_token][msg.sender] = true; 
        Token(_token).mint(msg.sender, reward); // distribute token to LPs

        emit RewardClaimed(msg.sender, _token, reward);
    }

    function withdraw(uint256 _amount) external onlyOwner{
        (bool success, ) = payable(owner).call{value: _amount}("");
        require(success, "Factory: ETH transfer failed");
    }
    
    function getTokenSale(uint256 _index) external view returns (TokenSale memory){
        require(_index < tokens.length, "Index out of bounds");
        return tokenToSale[tokens[_index]];
    }

    function getCost(uint256 _sold) public pure returns(uint256){
        uint256 floor = 0.0001 ether; // starting price of a token
        uint256 step = 0.0001 ether; // each time increase by this amount in price
        uint256 increment = 10000 ether;

        uint256 cost = (step * (_sold / increment)) + floor;
        return cost;
    }

    function getContributors(address _token) public view returns (address[] memory, uint256[] memory){
        address[] memory contributors = tokenContributors[_token];
        uint256[] memory contributions = new uint256[](contributors.length);

        for (uint256 i = 0; i < contributors.length; i++) {
            contributions[i] = userEthContributions[_token][contributors[i]];
        }

        return (contributors, contributions);
    }

    function getPriceForTokens(address _token, uint256 _amount) public view returns (uint256) {
        TokenSale storage sale = tokenToSale[_token];
        require(_amount >= 1 ether && _amount <= 10000 ether, "!amount");
        require(sale.isOpen, "!available");

        return getCost(sale.sold) * (_amount / 10 ** 18);
    }
} 