// app/test/page.tsx
"use client";

import { WalletConnect } from "@/components/features/WalletConnect";
import { DebugPanel } from "@/components/features/DebugPanel";
import { ContractDiagnostic } from "@/components/features/ContractDiagnostic";
import { DirectTransactionTool } from "@/components/features/DirectTransactionTool";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Debug & Test Center
          </h1>
          <p className="text-gray-600">
            Test your credit scoring oracle without command line
          </p>
        </div>

        <WalletConnect />
        <DirectTransactionTool />
        <ContractDiagnostic />
        <DebugPanel />
      </div>
    </div>
  );
}
