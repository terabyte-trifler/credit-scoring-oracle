// components/features/ApplicationList.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useContract } from "../../lib/hooks/useContract";
import { useWallet } from "../../lib/hooks/useWallet";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import {
  AlertCircle,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { formatTimestamp, formatBigInt } from "../../lib/web3";
import type { LoanApplication } from "../../lib/types";
import { ApplicationStatus } from "../../lib/types";

export function ApplicationList() {
  const { wallet, isCorrectNetwork } = useWallet();
  const { getUserApplications, getApplication } = useContract();
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchApplications = useCallback(async () => {
    if (!wallet.address) return;

    setIsLoading(true);
    try {
      const appIds = await getUserApplications(wallet.address);

      const apps = await Promise.all(
        appIds.map(async (id: bigint) => {
          const app = await getApplication(id);
          return app;
        })
      );

      setApplications(
        apps.filter(
          (app: LoanApplication | null): app is LoanApplication => app !== null
        )
      );
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [wallet.address, getUserApplications, getApplication]);

  useEffect(() => {
    if (wallet.isConnected && isCorrectNetwork && wallet.address) {
      fetchApplications();
    }
  }, [wallet.address, wallet.isConnected, isCorrectNetwork, fetchApplications]);

  const getStatusIcon = (status: number) => {
    switch (status) {
      case ApplicationStatus.Approved:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case ApplicationStatus.Rejected:
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case ApplicationStatus.Approved:
        return "Approved";
      case ApplicationStatus.Rejected:
        return "Rejected";
      default:
        return "Pending";
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case ApplicationStatus.Approved:
        return "bg-green-50 text-green-700 border-green-200";
      case ApplicationStatus.Rejected:
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }
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
                Connect your wallet to view your applications
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
          <CardTitle>Your Applications</CardTitle>
          <span className="text-sm text-gray-600">
            {applications.length} total
          </span>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">
              Loading applications...
            </p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <FileText className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                No Applications Yet
              </h3>
              <p className="text-sm text-gray-600">
                Submit your first loan application to get started
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id.toString()}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(app.status)}
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                          app.status
                        )}`}
                      >
                        {getStatusLabel(app.status)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {formatTimestamp(app.timestamp)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Amount</span>
                    <div className="font-semibold text-gray-900">
                      {formatBigInt(app.amount)} STT
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Purpose</span>
                    <div className="font-semibold text-gray-900">
                      {app.purpose}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Credit Score</span>
                    <div className="font-semibold text-gray-900">
                      {Number(app.creditScore) > 0
                        ? Number(app.creditScore)
                        : "N/A"}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Application ID</span>
                    <div className="font-mono text-xs text-gray-900">
                      #{app.id.toString()}
                    </div>
                  </div>
                </div>

                {app.status === ApplicationStatus.Pending && (
                  <div className="mt-3 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                    ⏳ Your application is being reviewed. This typically takes
                    24-48 hours.
                  </div>
                )}

                {app.status === ApplicationStatus.Approved && (
                  <div className="mt-3 p-2 bg-green-50 rounded text-xs text-green-800">
                    ✅ Congratulations! Your loan has been approved. Funds will
                    be disbursed within 3 business days.
                  </div>
                )}

                {app.status === ApplicationStatus.Rejected && (
                  <div className="mt-3 p-2 bg-red-50 rounded text-xs text-red-800">
                    ❌ Your application was not approved. Please improve your
                    credit score and try again.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
