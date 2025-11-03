"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Wallet,
  CreditCard,
  TrendingUp,
  Shield,
  AlertCircle,
} from "lucide-react";
import { connectWallet, getCurrentAccount, shortenAddress } from "../lib/web3";
import { switchToSomnia } from "../lib/chains";
import { toast } from "sonner";

export default function HomePage() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const currentAccount = await getCurrentAccount();
      setAccount(currentAccount);
    } catch (error) {
      console.error("Error checking connection:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // First switch to Somnia network
      await switchToSomnia();

      // Then connect wallet
      const connectedAccount = await connectWallet();
      setAccount(connectedAccount);

      toast.success("Wallet connected successfully!");
    } catch (error) {
      console.error("Connection error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to connect wallet";
      toast.error(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🏦 Credit Scoring Oracle
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Decentralized credit scoring powered by AI and blockchain technology
        </p>

        {/* Wallet Connection */}
        <div className="flex justify-center mb-8">
          {account ? (
            <Badge variant="outline" className="px-4 py-2 text-lg">
              <Wallet className="w-4 h-4 mr-2" />
              Connected: {shortenAddress(account)}
            </Badge>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              size="lg"
              className="px-8 py-3"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
              Apply for Loans
            </CardTitle>
            <CardDescription>
              Submit loan applications with instant AI-powered credit scoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              disabled={!account}
              onClick={() => (window.location.href = "/dashboard")}
            >
              {account ? "Apply Now" : "Connect Wallet First"}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              View Credit Score
            </CardTitle>
            <CardDescription>
              Check your on-chain credit score and application history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              disabled={!account}
              onClick={() => (window.location.href = "/dashboard")}
            >
              {account ? "View Score" : "Connect Wallet First"}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-purple-600" />
              Secure & Transparent
            </CardTitle>
            <CardDescription>
              All credit decisions are recorded on-chain for full transparency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                window.open("https://somnia-dream.socialscan.io", "_blank")
              }
            >
              View on Explorer
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* How it Works */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>
            Our decentralized credit scoring system in 4 simple steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Connect Wallet</h3>
              <p className="text-sm text-gray-600">
                Connect your MetaMask wallet to Somnia network
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Submit Application</h3>
              <p className="text-sm text-gray-600">
                Fill out loan application with required details
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">AI Processing</h3>
              <p className="text-sm text-gray-600">
                Our AI oracle analyzes and scores your application
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 font-bold">4</span>
              </div>
              <h3 className="font-semibold mb-2">Get Results</h3>
              <p className="text-sm text-gray-600">
                Receive instant approval/rejection with interest rate
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Info */}
      {!account && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
              <div>
                <p className="font-semibold text-orange-800">
                  Connect Your Wallet
                </p>
                <p className="text-sm text-orange-700">
                  Connect your MetaMask wallet to start using the Credit Scoring
                  Oracle on Somnia Dream Testnet
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
