// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useWallet } from "../../lib/hooks/useWallet";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { OracleStatus } from "../../components/features/OracleStatus";
import {
  Users,
  FileText,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

export default function AdminPage() {
  const { wallet, isCorrectNetwork } = useWallet();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    avgCreditScore: 0,
    totalScoreRequests: 0,
    activeOracles: 1,
  });

  // Simulate loading stats
  useEffect(() => {
    const loadStats = async () => {
      if (wallet.isConnected && isCorrectNetwork) {
        // In production, fetch from contract
        setStats({
          totalUsers: 0,
          totalApplications: 0,
          pendingApplications: 0,
          approvedApplications: 0,
          rejectedApplications: 0,
          avgCreditScore: 0,
          totalScoreRequests: 0,
          activeOracles: 1,
        });
      }
    };

    loadStats();
  }, [wallet.isConnected, isCorrectNetwork]);

  if (!wallet.isConnected || !isCorrectNetwork) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-yellow-900 mb-2">
              Admin Access Required
            </h3>
            <p className="text-yellow-700">
              Please connect your wallet with admin privileges to access this
              page
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor system performance and manage applications
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stats.totalUsers}
              </div>
              <div className="text-sm text-gray-600">Total Users</div>
            </CardContent>
          </Card>

          {/* Total Applications */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stats.totalApplications}
              </div>
              <div className="text-sm text-gray-600">Total Applications</div>
            </CardContent>
          </Card>

          {/* Pending Applications */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <span className="text-xs text-yellow-600 font-medium">
                  Pending
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stats.pendingApplications}
              </div>
              <div className="text-sm text-gray-600">Need Review</div>
            </CardContent>
          </Card>

          {/* Average Score */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stats.avgCreditScore || "N/A"}
              </div>
              <div className="text-sm text-gray-600">Avg Credit Score</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Applications */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.totalApplications === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No applications yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Application items would go here */}
                    <p className="text-gray-600 text-sm">
                      Applications will appear here when users submit them
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Oracle Status */}
          <div>
            <OracleStatus />
          </div>
        </div>

        {/* Application Status Breakdown */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.pendingApplications}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Awaiting review and processing
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.approvedApplications}
                  </div>
                  <div className="text-sm text-gray-600">Approved</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Successfully processed loans
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.rejectedApplications}
                  </div>
                  <div className="text-sm text-gray-600">Rejected</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">Did not meet criteria</div>
            </CardContent>
          </Card>
        </div>

        {/* System Info */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                <div>
                  <div className="text-gray-600 mb-1">Network</div>
                  <div className="font-semibold text-gray-900">
                    Somnia Dream Testnet
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Oracle Fee</div>
                  <div className="font-semibold text-gray-900">0.001 STT</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">ML Model</div>
                  <div className="font-semibold text-gray-900">
                    Random Forest v1.0
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Model Accuracy</div>
                  <div className="font-semibold text-gray-900">85%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
