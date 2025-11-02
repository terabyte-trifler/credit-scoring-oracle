// components/features/WalletConnect.tsx
"use client";

import { useWallet } from "../../lib/hooks/useWallet";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Wallet, AlertCircle, CheckCircle, ExternalLink } from "lucide-react";

import { getExplorerUrl, SOMNIA_DREAM_TESTNET } from "../../lib/chains";
import { shortenAddress } from "../../lib/web3";

export function WalletConnect() {
  const { wallet, connect, disconnect, isConnecting, error, isCorrectNetwork } =
    useWallet();

  if (!wallet.isConnected) {
    return (
      <Card className="max-w-md mx-auto">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-blue-100 p-4">
              <Wallet className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-gray-600">
              Connect your MetaMask wallet to access credit scoring and loan
              applications
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <Button
            onClick={connect}
            disabled={isConnecting}
            size="lg"
            className="w-full"
          >
            {isConnecting ? "Connecting..." : "Connect MetaMask"}
          </Button>

          <p className="text-xs text-gray-500">
            Make sure you&apos;re on Somnia Dream Testnet
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="space-y-4">
        {/* Network Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isCorrectNetwork ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <span className="font-medium">
              {isCorrectNetwork ? "Connected to Somnia" : "Wrong Network"}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={disconnect}>
            Disconnect
          </Button>
        </div>

        {/* Wrong Network Warning */}
        {!isCorrectNetwork && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-yellow-900 mb-1">
                  Please Switch Networks
                </h4>
                <p className="text-sm text-yellow-800 mb-3">
                  You&apos;re connected to the wrong network. Please switch to
                  Somnia Dream Testnet in MetaMask.
                </p>
                <div className="text-xs text-yellow-700 space-y-1">
                  <p>
                    <strong>Network:</strong> {SOMNIA_DREAM_TESTNET.name}
                  </p>
                  <p>
                    <strong>Chain ID:</strong> {SOMNIA_DREAM_TESTNET.chainId}
                  </p>
                  <p>
                    <strong>RPC:</strong> {SOMNIA_DREAM_TESTNET.rpcUrl}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Wallet Address</div>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono text-gray-900">
                {shortenAddress(wallet.address || "")}
              </code>
              <a
                href={getExplorerUrl(wallet.address || "", "address")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Network</div>
            <div className="text-lg font-semibold text-gray-900">
              {isCorrectNetwork ? "Somnia Dream Testnet" : "Wrong Network"}
            </div>
          </div>
        </div>

        {/* Success Message */}
        {isCorrectNetwork && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800">
              Wallet connected successfully! You can now use the credit scoring
              oracle.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
