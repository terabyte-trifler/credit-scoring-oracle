// app/dashboard/page.tsx
"use client";

import { useWallet } from "../../lib/hooks/useWallet";
import { WalletConnect } from "../../components/features/WalletConnect";
import { CreditScoreDisplay } from "../../components/features/CreditScoreDisplay";
import { LoanApplicationForm } from "../../components/features/LoanApplicationForm";
import { ApplicationList } from "../../components/features/ApplicationList";
import { OracleStatus } from "../../components/features/OracleStatus";
import { BarChart3, FileText, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { wallet, isCorrectNetwork } = useWallet();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Manage your credit score and loan applications
          </p>
        </div>

        {/* Wallet Connection */}
        {!wallet.isConnected && (
          <div className="mb-8">
            <WalletConnect />
          </div>
        )}

        {/* Main Content */}
        {wallet.isConnected && isCorrectNetwork ? (
          <div className="space-y-8">
            {/* Top Row - Credit Score & Oracle Status */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <CreditScoreDisplay />
              </div>
              <div>
                <OracleStatus />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-500">This Month</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  +24 pts
                </div>
                <div className="text-sm text-gray-600">Credit Score Change</div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-xs text-gray-500">Total</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">0</div>
                <div className="text-sm text-gray-600">Active Applications</div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-xs text-gray-500">Average</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">94%</div>
                <div className="text-sm text-gray-600">Confidence Score</div>
              </div>
            </div>

            {/* Middle Row - Application Form */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <LoanApplicationForm />
              </div>
              <div className="space-y-6">
                {/* Info Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-3">
                    💡 Pro Tips
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>• Request score updates weekly</li>
                    <li>• Higher scores = better rates</li>
                    <li>• Applications reviewed in 24-48h</li>
                    <li>• Oracle fee: 0.001 STT</li>
                  </ul>
                </div>

                {/* Risk Info */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Credit Score Ranges
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Excellent:</span>
                      <span className="font-semibold text-green-600">800+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Good:</span>
                      <span className="font-semibold text-blue-600">
                        700-799
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fair:</span>
                      <span className="font-semibold text-yellow-600">
                        600-699
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Poor:</span>
                      <span className="font-semibold text-red-600">
                        &lt;600
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row - Application List */}
            <div>
              <ApplicationList />
            </div>
          </div>
        ) : wallet.isConnected ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold text-yellow-900 mb-2">
              Wrong Network
            </h3>
            <p className="text-yellow-700">
              Please switch to Somnia Dream Testnet in MetaMask
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
