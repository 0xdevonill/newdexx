// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {MemeToken} from "./MemeToken.sol";
import {BondingCurve} from "./BondingCurve.sol";
import {SimpleAMM} from "./SimpleAMM.sol";

/// @title Helix.fun token factory
/// @notice Deploys an ERC-20 + bonding curve pair. Creation fee is 0.002 ETH.
///         Trade fee (1%) is enforced inside BondingCurve / SimpleAMM, not here.
contract TokenFactory {
    uint256 public constant CREATION_FEE = 0.002 ether;

    address public feeTo;
    address public owner;
    SimpleAMM public immutable amm;

    address[] public allTokens;
    mapping(address => address) public curveOf;
    mapping(address => bool) public isCurve;

    event TokenCreated(
        address indexed token,
        address indexed curve,
        address indexed creator,
        string name,
        string symbol,
        string image,
        uint256 supply
    );
    event Graduated(address indexed token, address indexed curve, uint256 ethLiq, uint256 tokenLiq);
    event FeeToUpdated(address indexed feeTo);

    modifier onlyOwner() {
        require(msg.sender == owner, "OWNER");
        _;
    }

    constructor(address feeTo_) {
        owner = msg.sender;
        feeTo = feeTo_ == address(0) ? msg.sender : feeTo_;
        amm = new SimpleAMM(address(this));
    }

    function tokenCount() external view returns (uint256) {
        return allTokens.length;
    }

    function createToken(
        string calldata name,
        string calldata symbol,
        string calldata description,
        string calldata image,
        string calldata twitter,
        string calldata telegram,
        string calldata website,
        uint256 supply
    ) external payable returns (address token, address curve) {
        require(msg.value >= CREATION_FEE, "FEE");
        require(bytes(name).length > 0 && bytes(name).length <= 32, "NAME");
        require(bytes(symbol).length > 0 && bytes(symbol).length <= 10, "SYMBOL");
        if (supply == 0) supply = 1_000_000_000 ether;

        MemeToken erc = new MemeToken(name, symbol, supply, address(this));
        BondingCurve bc = new BondingCurve(
            address(erc),
            address(this),
            msg.sender,
            description,
            image,
            twitter,
            telegram,
            website
        );
        token = address(erc);
        curve = address(bc);
        require(erc.transfer(curve, supply), "SEED");

        allTokens.push(token);
        curveOf[token] = curve;
        isCurve[curve] = true;

        uint256 tip = msg.value - CREATION_FEE;
        if (tip > 0) {
            BondingCurve(payable(curve)).buy{value: tip}(msg.sender);
        }
        (bool ok,) = feeTo.call{value: CREATION_FEE}("");
        require(ok, "PAY");

        emit TokenCreated(token, curve, msg.sender, name, symbol, image, supply);
    }

    function onGraduate(address token, uint256 ethLiq, uint256 tokenLiq) external payable {
        require(isCurve[msg.sender], "CURVE");
        require(curveOf[token] == msg.sender, "TOKEN");
        amm.graduate{value: msg.value}(token, msg.sender);
        emit Graduated(token, msg.sender, ethLiq, tokenLiq);
    }

    function setFeeTo(address next) external onlyOwner {
        require(next != address(0), "ZERO");
        feeTo = next;
        emit FeeToUpdated(next);
    }

    /// @dev AMM swap fees land here and are forwarded to `feeTo`.
    receive() external payable {
        if (msg.value == 0) return;
        (bool ok,) = feeTo.call{value: msg.value}("");
        require(ok, "FEE");
    }
}
