// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/CreditScoringOracle.sol";

contract DeploySimple is Script {
    function run() external {
        // Hardcode the oracle address for now
        address oracleAddress = 0x742D35CC6634c0532925A3b844BC9E7595F0BEb0;
        
        vm.startBroadcast();
        
        // Deploy the CreditScoringOracle contract
        CreditScoringOracle oracle = new CreditScoringOracle(oracleAddress);
        
        console.log("CreditScoringOracle deployed to:", address(oracle));
        console.log("Oracle address set to:", oracleAddress);
        console.log("Contract owner:", oracle.owner());
        
        vm.stopBroadcast();
    }
}