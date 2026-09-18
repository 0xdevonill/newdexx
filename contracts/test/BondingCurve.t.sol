// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {TokenFactory} from "../TokenFactory.sol";
import {BondingCurve} from "../BondingCurve.sol";
import {MemeToken} from "../MemeToken.sol";

contract BondingCurveTest is Test {
    TokenFactory factory;
    address alice = address(0xA11CE);
    address bob = address(0xB0B);

    function setUp() public {
        factory = new TokenFactory(address(this));
        vm.deal(alice, 50 ether);
        vm.deal(bob, 50 ether);
    }

    function testCreateAndBuyGraduatesAtFiveEth() public {
        vm.prank(alice);
        (address token, address curve) = factory.createToken{value: 0.002 ether}(
            "Hood Cat",
            "HOODCAT",
            "the cat that trades",
            "ipfs://logo",
            "https://x.com/hoodcat",
            "",
            "",
            1_000_000_000 ether
        );
        BondingCurve bc = BondingCurve(payable(curve));
        assertEq(MemeToken(token).balanceOf(curve), 1_000_000_000 ether);

        vm.prank(alice);
        bc.buy{value: 5.06 ether}(alice);
        assertTrue(bc.graduated());
        assertEq(MemeToken(token).balanceOf(curve), 0);
    }

    function testFeeIsOnePercent() public {
        vm.prank(alice);
        (, address curve) = factory.createToken{value: 0.002 ether}(
            "Fee", "FEE", "", "", "", "", "", 1_000_000_000 ether
        );
        uint256 before = address(this).balance;
        vm.prank(bob);
        BondingCurve(payable(curve)).buy{value: 1 ether}(bob);
        assertEq(address(this).balance - before, 0.01 ether);
    }

    receive() external payable {}
}
