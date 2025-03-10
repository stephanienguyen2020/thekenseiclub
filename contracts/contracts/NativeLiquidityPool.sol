// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./Token.sol";
import "./Factory.sol";

contract NativeLiquidityPool {
    address public factory;
    uint256 public vestingPeriod;
 
    // Track liquidity providers for each token
    mapping(address => uint256) public liquidity;
    mapping(address => mapping(address => uint256)) public userLiquidity;
    mapping(address => mapping(address => uint256)) public liquidityDepositTime;

    event LiquidityAdded(address indexed tokenAddress, address indexed provider, uint256 tokenAmount, uint256 avaxAmount);
    event LiquidityRemoved(address indexed token, address indexed provider, uint256 tokenAmount, uint256 ethAmount);

    constructor(address _factory) {
        require(_factory != address(0), "Invalid factory");
        factory = _factory;
        vestingPeriod = 604800; // Default vesting period: 1 week (in seconds)
    }
    
    function setVestingPeriod(uint256 _vestingPeriod) external {
        require(msg.sender == factory, "Only factory can set vesting period");
        vestingPeriod = _vestingPeriod;
    }

    function addLiquidity(address _tokenAddress, uint256 tokenAmount, address[] memory contributors, uint256[] memory contributorAmounts) external payable {
        require(msg.value > 0, "Must provide ETH");
        require(tokenAmount > 0, "Must provide tokens");

        Token token = Token(_tokenAddress);
        require(token.transferFrom(msg.sender, address(this), tokenAmount), "Transfer failed");
        if(msg.sender == factory){
            for (uint256 i = 0; i < contributors.length; i++) {
                userLiquidity[_tokenAddress][contributors[i]] += contributorAmounts[i];
                liquidityDepositTime[_tokenAddress][contributors[i]] = block.timestamp;
            }
        } else {
            userLiquidity[_tokenAddress][msg.sender] += msg.value;
            liquidityDepositTime[_tokenAddress][msg.sender] = block.timestamp;
        }
        liquidity[_tokenAddress] += msg.value;
        emit LiquidityAdded(_tokenAddress, msg.sender, tokenAmount, msg.value);
    }

    function removeLiquidity(address _tokenAddress, uint256 liquidityAmount) external {
        // withdraw eth from the liquidity
        require(userLiquidity[_tokenAddress][msg.sender] >= liquidityAmount, "Insufficient liquidity");
        require(block.timestamp >= liquidityDepositTime[_tokenAddress][msg.sender] + vestingPeriod, "Liquidity is still locked");
        
        Token token = Token(_tokenAddress);
        uint256 tokenReserve = token.balanceOf(address(this));
        uint256 ethReserve = liquidity[_tokenAddress];

        uint256 ethOut = (liquidityAmount * ethReserve) / liquidity[_tokenAddress]; // uint256 ethOut = liquidityAmount;
        uint256 tokenOut = (liquidityAmount * tokenReserve) / liquidity[_tokenAddress];

        require(ethOut > 0 && tokenOut > 0, "Insufficient withdrawal amount");

        userLiquidity[_tokenAddress][msg.sender] -= liquidityAmount;
        liquidity[_tokenAddress] -= ethOut; // liquidity[_tokenAddress] -= liquidityAmount;

        (bool success, ) = payable(msg.sender).call{value: ethOut}("");
        require(success, "ETH transfer failed");
        require(token.transfer(msg.sender, tokenOut), "Token transfer failed");

        emit LiquidityRemoved(_tokenAddress, msg.sender, tokenOut, ethOut);
    }

    function swapEthForToken(address _tokenAddress) external payable {
        require(msg.value > 0, "Must provide ETH");

        Token token = Token(_tokenAddress);
        uint256 tokenReserve = token.balanceOf(address(this));
        uint256 ethReserve = liquidity[_tokenAddress];

        uint256 tokensOut = (msg.value * tokenReserve)/ (ethReserve + msg.value);
        require(tokensOut > 0, "Insufficient output amount");
        require(token.transfer(msg.sender, tokensOut), "Token transfer failed");

        liquidity[_tokenAddress] += msg.value;
    }

    function swapTokenForEth(address _tokenAddress, uint256 _tokenAmount) external {
        require(_tokenAddress != address(0), "Invalid address");

        Token token = Token(_tokenAddress);
        uint256 tokenReserve = token.balanceOf(address(this));
        uint256 ethReserve = liquidity[_tokenAddress];

        uint256 ethOut = (_tokenAmount * ethReserve) / (tokenReserve + _tokenAmount);
        require(ethOut > 0, "Insufficient output amount");
        require(token.transferFrom(msg.sender, address(this), _tokenAmount), "transfer failed!");

        (bool success, ) = payable(msg.sender).call{value: ethOut}("");
        require(success, "ETH transfer failed");

        liquidity[_tokenAddress] -= ethOut;

    }

    /** 
     * @dev View function to estimate how many tokens will be received for a given ETH amount
     */
    function getEstimatedTokensForEth(address _tokenAddress, uint256 ethAmount) external view returns (uint256) {
        require(ethAmount > 0, "Must provide ETH");

        Token token = Token(_tokenAddress);
        uint256 tokenReserve = token.balanceOf(address(this));
        uint256 ethReserve = liquidity[_tokenAddress];

        if (ethReserve == 0 || tokenReserve == 0) return 0;

        return (ethAmount * tokenReserve) / (ethReserve + ethAmount);
    }

    /** 
     * @dev View function to estimate how much ETH will be received for a given token amount
     */
    function getEstimatedEthForTokens(address _tokenAddress, uint256 tokenAmount) external view returns (uint256) {
        require(tokenAmount > 0, "Must provide tokens");

        Token token = Token(_tokenAddress);
        uint256 tokenReserve = token.balanceOf(address(this));
        uint256 ethReserve = liquidity[_tokenAddress];

        if (ethReserve == 0 || tokenReserve == 0) return 0;

        return (tokenAmount * ethReserve) / (tokenReserve + tokenAmount);
    }
    
}