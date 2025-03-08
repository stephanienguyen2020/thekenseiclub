// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    address payable public owner;
    address public creator;

    string public metadataURI; // Stores IPFS metadata JSON URI

    constructor(
        address _creator,
        string memory _name,
        string memory _symbol,
        string memory _metadataURI,
        uint256 _totalSupply
    ) ERC20(_name, _symbol) {
        owner = payable(msg.sender);
        creator = _creator;
        metadataURI=_metadataURI;
        _mint(msg.sender, _totalSupply);
    }

    function mint(address receiver, uint256 mintQty) external {
        require(msg.sender == owner, "Mint can only be called by the owner");
        _mint(receiver, mintQty);
    }

    function burn(uint burnQty, address from) external {
        require(msg.sender == owner, "Burn can only be called by the owner");
        _burn(from, burnQty);
    }
}