// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {TokenFactory} from "../TokenFactory.sol";

/// forge script contracts/script/Deploy.s.sol:Deploy --rpc-url $RH_RPC_URL --broadcast --private-key $PRIVATE_KEY
contract Deploy is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address feeTo = vm.envOr("FEE_TO", address(0));
        vm.startBroadcast(pk);
        if (feeTo == address(0)) feeTo = vm.addr(pk);
        TokenFactory factory = new TokenFactory(feeTo);
        vm.stopBroadcast();
        console.log("TokenFactory", address(factory));
        console.log("SimpleAMM   ", address(factory.amm()));
        console.log("feeTo       ", factory.feeTo());
    }
}
