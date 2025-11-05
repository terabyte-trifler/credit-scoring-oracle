// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/CreditScoringOracle.sol";

contract DeploySimple is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Use the deployer address as oracle for testing
        address deployer = vm.addr(deployerPrivateKey);
        console.log("Deployer address:", deployer);
        
        // Deploy the CreditScoringOracle contract
        CreditScoringOracle oracle = new CreditScoringOracle(deployer);
        
        console.log("CreditScoringOracle deployed to:", address(oracle));
        console.log("Oracle address set to:", deployer);
        console.log("Contract owner:", oracle.owner());
        
        vm.stopBroadcast();
    }
}