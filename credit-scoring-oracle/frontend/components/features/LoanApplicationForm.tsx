// components/features/LoanApplicationForm.tsx
"use client";

import { useState } from "react";
import { useContract } from "../../lib/hooks/useContract";
import { useWallet } from "../../lib/hooks/useWallet";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { AlertCircle, DollarSign, FileText, CheckCircle } from "lucide-react";

const LOAN_PURPOSES = [
  "Working Capital",
  "Equipment Purchase",
  "Business Expansion",
  "Debt Consolidation",
  "Real Estate",
  "Other",
];

export function LoanApplicationForm() {
  const { wallet, isCorrectNetwork } = useWallet();
  const { submitApplication, isLoading, error } = useContract();

  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState(LOAN_PURPOSES[0]);
  const [submitted, setSubmitted] = useState(false);
  const [txHash, setTxHash] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid loan amount");
      return;
    }

    try {
      const purposeIndex = LOAN_PURPOSES.indexOf(purpose);
      const hash = await submitApplication(amount, purposeIndex);
      setTxHash(hash);
      setSubmitted(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setAmount("");
        setPurpose(LOAN_PURPOSES[0]);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      alert(`Failed to submit application: ${errorMessage}`);
    }
  };

  const estimateMonthlyPayment = () => {
    const principal = parseFloat(amount) || 0;
    const annualRate = 0.08; // 8% APR
    const months = 12;
    const monthlyRate = annualRate / 12;

    if (principal === 0) return "0.00";

    const payment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
      (Math.pow(1 + monthlyRate, months) - 1);

    return payment.toFixed(2);
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
                Connect your wallet to submit a loan application
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Application Submitted!
              </h3>
              <p className="text-gray-600 mb-4">
                Your loan application has been submitted successfully
              </p>
              <div className="inline-block p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Transaction Hash</p>
                <code className="text-sm font-mono text-gray-900">
                  {txHash.slice(0, 10)}...{txHash.slice(-8)}
                </code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply for a Loan</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Loan Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Amount (STT)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Minimum: 1 STT • Maximum: 10,000 STT
            </p>
          </div>

          {/* Loan Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Purpose
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                required
              >
                {LOAN_PURPOSES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loan Summary */}
          {amount && parseFloat(amount) > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
              <h4 className="font-medium text-blue-900">Loan Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Principal:</span>
                  <div className="font-semibold text-blue-900">
                    {amount} STT
                  </div>
                </div>
                <div>
                  <span className="text-blue-700">Est. Monthly:</span>
                  <div className="font-semibold text-blue-900">
                    {estimateMonthlyPayment()} STT
                  </div>
                </div>
                <div>
                  <span className="text-blue-700">Interest Rate:</span>
                  <div className="font-semibold text-blue-900">8% APR</div>
                </div>
                <div>
                  <span className="text-blue-700">Term:</span>
                  <div className="font-semibold text-blue-900">12 months</div>
                </div>
              </div>
            </div>
          )}

          {/* Oracle Fee Notice */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Oracle Fee:</strong> 0.001 STT will be charged to fetch
              your credit score
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="w-full"
          >
            Submit Application
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By submitting, you agree to our terms and conditions
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
