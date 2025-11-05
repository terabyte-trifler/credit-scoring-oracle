// app/test/page.tsx
"use client";

import { WalletConnect } from "../components/features/WalletConnect";
import { ContractDiagnostic } from "../components/features/ContractDiagnostic";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Debug & Diagnostic Center
          </h1>
          <p className="text-gray-600">
            Test and debug your credit scoring oracle
          </p>
        </div>

        <WalletConnect />
        <ContractDiagnostic />
      </div>
    </div>
  );
}
