// app/test/page.tsx
"use client";

import { WalletConnect } from "../../components/features/WalletConnect";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Contract Interaction Test
          </h1>
          <p className="text-gray-600">
            Debug and test your smart contract functions
          </p>
        </div>

        <WalletConnect />
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Debug Panel</h2>
          <p className="text-gray-600">
            Debug panel functionality can be added here.
          </p>
        </div>
      </div>
    </div>
  );
}
