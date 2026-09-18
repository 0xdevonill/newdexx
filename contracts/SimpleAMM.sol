// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20Lite {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/// @title Helix.fun Uniswap-style constant-product AMM
/// @notice Receives graduated bonding-curve liquidity. 1% swap fee, hardcoded.
contract SimpleAMM {
    uint256 public constant FEE_BPS = 100;
    uint256 public constant BPS = 10_000;

    struct Pair {
        address token;
        uint256 reserveEth;
        uint256 reserveToken;
        bool exists;
    }

    address public immutable factory;
    mapping(address => Pair) public pairs;

    event Graduated(address indexed token, uint256 ethLiq, uint256 tokenLiq);
    event Swap(
        address indexed token,
        address indexed trader,
        bool isBuy,
        uint256 ethAmount,
        uint256 tokenAmount,
        uint256 fee
    );

    modifier onlyFactory() {
        require(msg.sender == factory, "FACTORY");
        _;
    }

    constructor(address factory_) {
        factory = factory_;
    }

    /// @dev Called by TokenFactory during graduation. Curve must have approved this contract.
    function graduate(address token, address curve) external payable onlyFactory {
        Pair storage p = pairs[token];
        require(!p.exists, "EXISTS");
        uint256 tok = IERC20Lite(token).balanceOf(curve);
        require(tok > 0 && msg.value > 0, "LIQ");
        require(IERC20Lite(token).transferFrom(curve, address(this), tok), "XFER");
        p.token = token;
        p.reserveEth = msg.value;
        p.reserveToken = tok;
        p.exists = true;
        emit Graduated(token, msg.value, tok);
    }

    function buy(address token) external payable {
        Pair storage p = pairs[token];
        require(p.exists, "PAIR");
        require(msg.value > 0, "ETH");
        uint256 fee = (msg.value * FEE_BPS) / BPS;
        uint256 net = msg.value - fee;
        uint256 out = (p.reserveToken * net) / (p.reserveEth + net);
        require(out > 0 && out < p.reserveToken, "OUT");
        p.reserveEth += net;
        p.reserveToken -= out;
        require(IERC20Lite(token).transfer(msg.sender, out), "XFER");
        _payFee(fee);
        emit Swap(token, msg.sender, true, msg.value, out, fee);
    }

    function sell(address token, uint256 tokenIn) external {
        Pair storage p = pairs[token];
        require(p.exists, "PAIR");
        require(tokenIn > 0, "AMT");
        uint256 ethOut = (p.reserveEth * tokenIn) / (p.reserveToken + tokenIn);
        uint256 fee = (ethOut * FEE_BPS) / BPS;
        uint256 net = ethOut - fee;
        require(net > 0 && ethOut < p.reserveEth, "OUT");
        require(IERC20Lite(token).transferFrom(msg.sender, address(this), tokenIn), "XFER");
        p.reserveToken += tokenIn;
        p.reserveEth -= ethOut;
        _payFee(fee);
        (bool ok,) = msg.sender.call{value: net}("");
        require(ok, "ETH");
        emit Swap(token, msg.sender, false, ethOut, tokenIn, fee);
    }

    function getReserves(address token) external view returns (uint256 ethRes, uint256 tokRes) {
        Pair storage p = pairs[token];
        return (p.reserveEth, p.reserveToken);
    }

    function _payFee(uint256 fee) internal {
        if (fee == 0) return;
        (bool ok,) = factory.call{value: fee}("");
        require(ok, "FEE");
    }

    receive() external payable {}
}
