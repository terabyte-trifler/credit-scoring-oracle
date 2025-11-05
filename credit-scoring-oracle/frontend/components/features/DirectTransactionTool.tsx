// components/features/DirectTransactionTool.tsx
"use client";

import { useState } from "react";
import { useWallet } from "../../lib/hooks/useWallet";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { getContract } from "../../lib/web3";
import { CONTRACT_ADDRESS, ORACLE_FEE } from "../../lib/contracts";
import { CheckCircle, AlertCircle } from "lucide-react";

interface ResultMessage {
  type: "success" | "error";
  message: string;
}

export function DirectTransactionTool() {
  const { wallet } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResultMessage | null>(null);

  const submitApplication = async () => {
    if (!wallet.address) {
      setResult({ type: "error", message: "Please connect wallet first" });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      console.log("📝 Submitting test application...");
      console.log("Wallet:", wallet.address);
      console.log("Contract:", CONTRACT_ADDRESS);
      console.log("Oracle Fee:", ORACLE_FEE.toString());

      const contract = await getContract();

      // Submit minimal loan application: 1 wei, Personal purpose (0)
      const tx = await contract.submitApplication(BigInt(1), 0, {
        value: ORACLE_FEE,
        gasLimit: 500000,
      });

      console.log("📤 Transaction sent:", tx.hash);

      const receipt = await tx.wait();
      console.log("✅ Confirmed:", receipt);

      setResult({
        type: "success",
        message: `Application submitted! TX: ${tx.hash.slice(
          0,
          10
        )}...${tx.hash.slice(
          -8
        )}\n\nWait 30 seconds for oracle processing, then check Dashboard.`,
      });
    } catch (err) {
      console.error("❌ Error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Transaction failed";
      setResult({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkCreditScore = async () => {
    if (!wallet.address) {
      setResult({ type: "error", message: "Please connect wallet first" });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      console.log("🔍 Checking credit score...");

      const contract = await getContract();
      const score = await contract.getCreditScore(wallet.address);

      console.log("✅ Score result:", score);

      if (score && score[0] > 0) {
        setResult({
          type: "success",
          message: `Credit Score: ${score[0].toString()}\nTotal Loans: ${score[1].toString()}\nLast Updated: ${new Date(
            Number(score[5]) * 1000
          ).toLocaleString()}`,
        });
      } else {
        setResult({
          type: "error",
          message:
            "No credit score found. Submit an application first to get scored.",
        });
      }
    } catch (err) {
      console.error("❌ Error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to check score";
      setResult({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🚀 Direct Transaction Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        {result && (
          <div
            className={`p-4 rounded-lg border ${
              result.type === "success"
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {result.type === "success" ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div
                className={`text-sm whitespace-pre-wrap ${
                  result.type === "success" ? "text-green-800" : "text-red-800"
                }`}
              >
                {result.message}
              </div>
            </div>
          </div>
        )}

        {/* Wallet Info */}
        <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-1">
          <div>
            <strong>Wallet:</strong> {wallet.address || "Not connected"}
          </div>
          <div>
            <strong>Contract:</strong> {CONTRACT_ADDRESS.slice(0, 10)}...
            {CONTRACT_ADDRESS.slice(-8)}
          </div>
          <div>
            <strong>Oracle Fee:</strong> 0.001 STT
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={submitApplication}
            disabled={!wallet.address || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading
              ? "Processing..."
              : "Submit Application (Triggers Scoring)"}
          </Button>

          <Button
            onClick={checkCreditScore}
            disabled={!wallet.address || isLoading}
            variant="secondary"
            className="w-full"
            size="lg"
          >
            {isLoading ? "Checking..." : "Check Current Credit Score"}
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-600 space-y-2">
          <p>
            <strong>How to use:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Connect your wallet at the top</li>
            <li>Click &quot;Submit Application&quot;</li>
            <li>Approve transaction in MetaMask</li>
            <li>Wait 30 seconds for oracle to process</li>
            <li>Click &quot;Check Current Credit Score&quot;</li>
          </ol>
          <p className="text-yellow-600 mt-3">
            ⚠️ Make sure ML API and Oracle are running in terminals!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
