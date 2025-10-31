// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/CreditScoringOracle.sol";

contract DeploySomnia is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address oracleAddress = vm.envAddress("ORACLE_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the CreditScoringOracle contract
        CreditScoringOracle oracle = new CreditScoringOracle(oracleAddress);
        
        console.log("CreditScoringOracle deployed to:", address(oracle));
        console.log("Oracle address set to:", oracleAddress);
        console.log("Contract owner:", oracle.owner());
        
        vm.stopBroadcast();
    }
}