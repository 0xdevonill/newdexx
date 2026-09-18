// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IMemeToken {
    function transfer(address to, uint256 value) external returns (bool);
    function approve(address spender, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function totalSupply() external view returns (uint256);
}

interface IFactoryLite {
    function feeTo() external view returns (address);
    function amm() external view returns (address);
    function onGraduate(address token, uint256 ethLiq, uint256 tokenLiq) external payable;
}

/// @title Helix.fun constant-product bonding curve
/// @notice Virtual reserves: 1.25 ETH × totalSupply. Price = virtualEth / tokenReserve.
///         Collecting 5 ETH of real reserves graduates leftover tokens + ETH into SimpleAMM.
///         1% protocol fee (FEE_BPS) is hardcoded on every buy and sell.
contract BondingCurve {
    uint256 public constant VIRTUAL_ETH = 1.25 ether;
    uint256 public constant GRADUATION_ETH = 5 ether;
    uint256 public constant FEE_BPS = 100;
    uint256 public constant BPS = 10_000;

    IMemeToken public immutable token;
    IFactoryLite public immutable factory;
    address public immutable creator;

    string public description;
    string public image;
    string public twitter;
    string public telegram;
    string public website;

    uint256 public realEth;
    bool public graduated;

    uint256 private _locked = 1;

    event Trade(
        address indexed trader,
        bool isBuy,
        uint256 ethAmount,
        uint256 tokenAmount,
        uint256 fee,
        uint256 realEthAfter,
        uint256 tokenReserveAfter
    );
    event Graduated(uint256 ethLiq, uint256 tokenLiq);

    modifier nonReentrant() {
        require(_locked == 1, "REENTRANCY");
        _locked = 2;
        _;
        _locked = 1;
    }

    constructor(
        address token_,
        address factory_,
        address creator_,
        string memory description_,
        string memory image_,
        string memory twitter_,
        string memory telegram_,
        string memory website_
    ) {
        token = IMemeToken(token_);
        factory = IFactoryLite(factory_);
        creator = creator_;
        description = description_;
        image = image_;
        twitter = twitter_;
        telegram = telegram_;
        website = website_;
    }

    function tokenReserve() public view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function virtualEth() public view returns (uint256) {
        return VIRTUAL_ETH + realEth;
    }

    function spotPriceWei() public view returns (uint256) {
        uint256 reserve = tokenReserve();
        if (reserve == 0) return 0;
        return (virtualEth() * 1 ether) / reserve;
    }

    function marketCapWei() public view returns (uint256) {
        uint256 reserve = tokenReserve();
        if (reserve == 0) return 0;
        return (virtualEth() * token.totalSupply()) / reserve;
    }

    function progressBps() public view returns (uint256) {
        uint256 p = (realEth * BPS) / GRADUATION_ETH;
        return p > BPS ? BPS : p;
    }

    function quoteBuy(uint256 ethIn) public view returns (uint256 tokensOut, uint256 fee) {
        require(!graduated, "GRADUATED");
        fee = (ethIn * FEE_BPS) / BPS;
        uint256 net = ethIn - fee;
        uint256 vEth = virtualEth();
        uint256 reserve = tokenReserve();
        uint256 k = vEth * reserve;
        uint256 newReserve = k / (vEth + net);
        tokensOut = reserve - newReserve;
    }

    function quoteSell(uint256 tokenIn) public view returns (uint256 ethOut, uint256 fee) {
        require(!graduated, "GRADUATED");
        uint256 vEth = virtualEth();
        uint256 reserve = tokenReserve();
        uint256 k = vEth * reserve;
        uint256 newVEth = k / (reserve + tokenIn);
        uint256 gross = vEth - newVEth;
        fee = (gross * FEE_BPS) / BPS;
        ethOut = gross - fee;
    }

    function buy(address recipient) external payable nonReentrant {
        require(!graduated, "GRADUATED");
        require(msg.value > 0, "ETH");
        address to = recipient == address(0) ? msg.sender : recipient;
        (uint256 tokensOut, uint256 fee) = quoteBuy(msg.value);
        require(tokensOut > 0, "OUT");
        uint256 net = msg.value - fee;
        realEth += net;
        require(token.transfer(to, tokensOut), "XFER");
        _payFee(fee);
        emit Trade(to, true, msg.value, tokensOut, fee, realEth, tokenReserve());
        if (realEth >= GRADUATION_ETH) {
            _graduate();
        }
    }

    function sell(uint256 tokenIn, address recipient) external nonReentrant {
        require(!graduated, "GRADUATED");
        require(tokenIn > 0, "AMT");
        address to = recipient == address(0) ? msg.sender : recipient;
        (uint256 ethOut, uint256 fee) = quoteSell(tokenIn);
        require(ethOut > 0, "OUT");
        uint256 gross = ethOut + fee;
        require(gross <= realEth, "LIQ");
        require(IERC20Pull(address(token)).transferFrom(msg.sender, address(this), tokenIn), "XFER");
        realEth -= gross;
        _payFee(fee);
        (bool ok,) = to.call{value: ethOut}("");
        require(ok, "ETH");
        emit Trade(to, false, gross, tokenIn, fee, realEth, tokenReserve());
    }

    function _graduate() internal {
        graduated = true;
        uint256 tokLiq = token.balanceOf(address(this));
        uint256 ethLiq = address(this).balance;
        require(token.approve(factory.amm(), tokLiq), "APPROVE");
        factory.onGraduate{value: ethLiq}(address(token), ethLiq, tokLiq);
        emit Graduated(ethLiq, tokLiq);
    }

    function _payFee(uint256 fee) internal {
        if (fee == 0) return;
        address feeTo = factory.feeTo();
        (bool ok,) = feeTo.call{value: fee}("");
        require(ok, "FEE");
    }

    receive() external payable {}
}

interface IERC20Pull {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}
