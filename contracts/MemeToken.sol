// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Helix.fun ERC-20
/// @notice Fixed-supply meme token. The entire supply is minted to the bonding
///         curve at creation; the curve is the only initial holder.
contract MemeToken {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(string memory name_, string memory symbol_, uint256 supply_, address recipient) {
        require(bytes(name_).length > 0 && bytes(symbol_).length > 0, "NAME");
        require(supply_ >= 1_000_000 ether, "SUPPLY");
        name = name_;
        symbol = symbol_;
        totalSupply = supply_;
        balanceOf[recipient] = supply_;
        emit Transfer(address(0), recipient, supply_);
    }

    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transfer(address to, uint256 value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        if (allowed != type(uint256).max) {
            require(allowed >= value, "ALLOWANCE");
            allowance[from][msg.sender] = allowed - value;
        }
        _transfer(from, to, value);
        return true;
    }

    function _transfer(address from, address to, uint256 value) internal {
        require(to != address(0), "ZERO");
        uint256 bal = balanceOf[from];
        require(bal >= value, "BALANCE");
        unchecked {
            balanceOf[from] = bal - value;
            balanceOf[to] += value;
        }
        emit Transfer(from, to, value);
    }
}
