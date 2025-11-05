// components/features/ContractDiagnostic.tsx
"use client";

import { useState } from "react";
import { useWallet } from "../../lib/hooks/useWallet";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { CONTRACT_ADDRESS } from "../../lib/contracts";
import { getReadOnlyContract } from "../../lib/web3";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

interface LogEntry {
  type: "info" | "success" | "error";
  message: string;
}

export function ContractDiagnostic() {
  const { wallet, isCorrectNetwork, connect, checkNetwork } = useWallet();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addLog = (type: "info" | "success" | "error", message: string) => {
    setLogs((prev) => [...prev, { type, message }]);
    console.log(`[${type.toUpperCase()}]`, message);
  };

  const runDiagnostic = async () => {
    setLogs([]);
    setIsRunning(true);

    try {
      addLog("info", "🔍 Starting diagnostic...");
      addLog("info", `Contract Address: ${CONTRACT_ADDRESS}`);

      // Check network first
      addLog(
        "info",
        "\n📋 Network Check: Verifying Somnia Dream Testnet connection..."
      );
      await checkNetwork();

      if (!isCorrectNetwork) {
        addLog(
          "error",
          "❌ Wrong network! Please connect to Somnia Dream Testnet (Chain ID: 50312)"
        );
        addLog(
          "info",
          "💡 Use the wallet connect button to switch to the correct network"
        );
        return;
      }
      addLog("success", "✅ Connected to Somnia Dream Testnet");

      // Test 1: Check contract exists
      addLog("info", "\n📋 Test 1: Checking if contract exists...");
      try {
        const contract = await getReadOnlyContract();
        addLog("success", `✅ Contract object created: ${contract.target}`);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        addLog("error", `❌ Failed to create contract: ${errorMessage}`);
        return;
      }

      // Test 2: Try to call owner() function (should always work)
      addLog("info", "\n📋 Test 2: Testing basic contract call (owner)...");
      try {
        const contract = await getReadOnlyContract();
        const owner = await contract.owner();
        addLog("success", `✅ Contract is callable! Owner: ${owner}`);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        addLog("error", `❌ Contract call failed: ${errorMessage}`);
        addLog(
          "info",
          "💡 This means the contract address might be wrong or not deployed"
        );
        return;
      }

      // Test 3: Check oracleFee
      addLog("info", "\n📋 Test 3: Checking oracle fee...");
      try {
        const contract = await getReadOnlyContract();
        const fee = await contract.oracleFee();
        addLog(
          "success",
          `✅ Oracle Fee: ${fee.toString()} wei (${Number(fee) / 1e18} STT)`
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        addLog("error", `❌ Failed to get oracle fee: ${errorMessage}`);
      }

      // Test 4: Try to read credit score with different methods
      if (wallet.address) {
        addLog(
          "info",
          `\n📋 Test 4: Trying to read credit score for ${wallet.address}...`
        );

        const contract = await getReadOnlyContract();

        // Method 1: getCreditScore function
        addLog("info", "Method 1: Trying getCreditScore(address)...");
        try {
          const result = await contract.getCreditScore(wallet.address);
          addLog(
            "success",
            `✅ getCreditScore returned: ${JSON.stringify(result)}`
          );
          addLog("info", `   Score: ${result[0]?.toString()}`);
          addLog("info", `   TotalLoans: ${result[1]?.toString()}`);
          addLog("info", `   ActiveLoans: ${result[2]?.toString()}`);
          addLog("info", `   DefaultCount: ${result[3]?.toString()}`);
          addLog("info", `   IsBlacklisted: ${result[4]?.toString()}`);
          addLog("info", `   LastUpdated: ${result[5]?.toString()}`);
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Unknown error";
          addLog("error", `❌ getCreditScore failed: ${errorMessage}`);
        }

        // Method 2: getCreditScoreSimple function
        addLog("info", "\nMethod 2: Trying getCreditScoreSimple(address)...");
        try {
          const result = await contract.getCreditScoreSimple(wallet.address);
          addLog(
            "success",
            `✅ getCreditScoreSimple returned: ${result.toString()}`
          );
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Unknown error";
          addLog("error", `❌ getCreditScoreSimple failed: ${errorMessage}`);
        }

        // Method 3: List all contract functions
        addLog("info", "\n📋 Test 5: Listing available contract functions...");
        try {
          const contract = await getReadOnlyContract();
          const functions = contract.interface.fragments
            .filter((f) => f.type === "function")
            .map((f) => f.format());
          addLog("success", `✅ Available functions: ${functions.join(", ")}`);
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Unknown error";
          addLog("error", `❌ Failed to list functions: ${errorMessage}`);
        }
      } else {
        addLog("info", "⚠️ No wallet connected, skipping credit score tests");
      }

      addLog("success", "\n✅ Diagnostic complete!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      addLog("error", `❌ Diagnostic failed: ${errorMessage}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔬 Contract Diagnostic Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Button
            onClick={runDiagnostic}
            disabled={isRunning}
            className="flex-1"
          >
            {isRunning ? "Running Diagnostic..." : "Run Full Diagnostic"}
          </Button>
          {!wallet.isConnected && (
            <Button onClick={connect} variant="outline">
              Connect Wallet
            </Button>
          )}
        </div>

        {wallet.isConnected && !isCorrectNetwork && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Wrong Network: Please switch to Somnia Dream Testnet
              </span>
            </div>
          </div>
        )}

        {logs.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
            <div className="space-y-1 font-mono text-xs">
              {logs.map((log, i) => (
                <div key={i} className="flex items-start gap-2">
                  {getIcon(log.type)}
                  <span
                    className={
                      log.type === "error"
                        ? "text-red-700"
                        : log.type === "success"
                        ? "text-green-700"
                        : "text-gray-700"
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-600 space-y-2">
          <p>
            <strong>This tool will:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Verify contract is deployed and callable</li>
            <li>Test different methods to read credit scores</li>
            <li>Show exactly what the contract returns</li>
            <li>List all available contract functions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
