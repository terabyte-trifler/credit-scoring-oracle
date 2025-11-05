// components/features/CreditScoreDisplay.tsx
"use client";

import { useEffect, useState } from "react";
import { useContract } from "../../lib/hooks/useContract";
import { useWallet } from "../../lib/hooks/useWallet";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import {
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Calendar,
  Hash,
  Info,
} from "lucide-react";
import { formatTimestamp } from "../../lib/web3";
import type { CreditScore } from "../../lib/types";

export function CreditScoreDisplay() {
  const { wallet, isCorrectNetwork } = useWallet();
  const { getCreditScore, requestCreditScore, isLoading, error } =
    useContract();
  const [score, setScore] = useState<CreditScore | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  // Fetch credit score on mount and wallet change
  useEffect(() => {
    if (wallet.isConnected && isCorrectNetwork && wallet.address) {
      fetchScore();
    }
  }, [wallet.address, isCorrectNetwork, wallet.isConnected, fetchScore]);

  const fetchScore = async () => {
    if (!wallet.address) return;

    setIsRefreshing(true);
    setDebugInfo("Fetching score...");

    try {
      console.log("🔍 Fetching score for:", wallet.address);
      const result = await getCreditScore(wallet.address);

      console.log("📊 Score result:", result);
      setDebugInfo(`Raw result: ${JSON.stringify(result)}`);

      if (result) {
        // Check if score is actually zero or just not set
        const scoreValue = Number(result.score);
        const hasData = scoreValue > 0 || Number(result.requestCount) > 0;

        if (hasData) {
          setScore(result);
          setDebugInfo(
            `Score loaded: ${scoreValue} (confidence: ${result.confidence}%)`
          );
        } else {
          setScore(null);
          setDebugInfo("No score found - you need to request your first score");
        }
      } else {
        setScore(null);
        setDebugInfo("Contract returned null - score not found");
      }

      setLastFetch(new Date());
    } catch (err: any) {
      console.error("❌ Error fetching score:", err);
      setDebugInfo(`Error: ${err.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRequestScore = async () => {
    if (!wallet.address) return;

    try {
      console.log("📝 Requesting new score...");
      const txHash = await requestCreditScore(wallet.address);

      alert(
        `✅ Score requested successfully!\n\nTransaction: ${txHash}\n\nThe oracle will process this in 5-10 seconds. Click "Refresh" to check for updates.`
      );

      // Auto-refresh after delay
      setTimeout(() => {
        fetchScore();
      }, 10000); // Wait 10 seconds
    } catch (err: any) {
      console.error("❌ Request failed:", err);
      alert(
        `Failed to request score:\n${err.message}\n\nMake sure:\n1. You have enough STT for the fee\n2. ML API is running\n3. Oracle middleware is running`
      );
    }
  };

  // Calculate score status and color
  const getScoreStatus = (scoreValue: bigint) => {
    const score = Number(scoreValue);
    if (score >= 800)
      return {
        label: "Excellent",
        color: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-200",
      };
    if (score >= 700)
      return {
        label: "Good",
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
      };
    if (score >= 600)
      return {
        label: "Fair",
        color: "text-yellow-600",
        bg: "bg-yellow-50",
        border: "border-yellow-200",
      };
    return {
      label: "Poor",
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
    };
  };

  if (!wallet.isConnected || !isCorrectNetwork) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center space-y-3">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Wallet Not Connected
              </h3>
              <p className="text-sm text-gray-600">
                Connect your wallet on Somnia Network to view your credit score
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Your Credit Score</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchScore}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Debug Info */}
        {debugInfo && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2 text-xs">
              <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="font-mono text-blue-800 break-all">
                {debugInfo}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {!score || Number(score.score) === 0 ? (
          // No score yet
          <div className="text-center py-8 space-y-4">
            <div className="text-6xl font-bold text-gray-300">---</div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                No Credit Score Yet
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Request your first credit score to get started
              </p>
              <Button
                onClick={handleRequestScore}
                isLoading={isLoading}
                size="lg"
              >
                Request Credit Score
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Fee: 0.001 STT • Takes ~5-10 seconds
              </p>
            </div>

            {/* Prerequisites Checklist */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
              <h4 className="font-semibold text-yellow-900 mb-2 text-sm">
                ⚠️ Before requesting, make sure:
              </h4>
              <ul className="text-xs text-yellow-800 space-y-1">
                <li>✓ ML API is running (Terminal 1)</li>
                <li>✓ Oracle middleware is running (Terminal 2)</li>
                <li>✓ You have at least 0.01 STT in your wallet</li>
                <li>✓ You're on Somnia Dream Testnet</li>
              </ul>
            </div>
          </div>
        ) : (
          // Display score
          <div className="space-y-6">
            {/* Score Gauge */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="text-7xl font-bold text-gray-900">
                  {Number(score.score)}
                </div>
                <div
                  className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-sm font-medium border ${
                    getScoreStatus(score.score).bg
                  } ${getScoreStatus(score.score).color} ${
                    getScoreStatus(score.score).border
                  }`}
                >
                  {getScoreStatus(score.score).label}
                </div>
              </div>

              {/* Score Bar */}
              <div className="mt-8 w-full max-w-md mx-auto">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        (Number(score.score) / 850) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>300</span>
                  <span>850</span>
                </div>
              </div>
            </div>

            {/* Score Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Confidence</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {Number(score.confidence)}%
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Last Updated</span>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {Number(score.lastUpdate) > 0
                    ? formatTimestamp(score.lastUpdate)
                    : "Never"}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Hash className="h-4 w-4" />
                  <span className="text-sm">Requests</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {Number(score.requestCount)}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleRequestScore}
                isLoading={isLoading}
                className="flex-1"
              >
                Update Score
              </Button>
              <Button
                variant="secondary"
                onClick={fetchScore}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>

            {lastFetch && (
              <p className="text-xs text-gray-500 text-center">
                Last fetched: {lastFetch.toLocaleTimeString()}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
