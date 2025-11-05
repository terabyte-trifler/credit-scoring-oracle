// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/TestContract.sol";

contract DeployTest is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        TestContract test = new TestContract();
        
        console.log("TestContract deployed to:", address(test));
        console.log("Initial value:", test.value());
        
        vm.stopBroadcast();
    }
}