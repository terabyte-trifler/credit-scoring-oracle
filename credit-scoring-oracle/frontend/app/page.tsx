// app/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useWallet } from '@/lib/hooks/useWallet';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { 
  Shield, 
  Zap, 
  TrendingUp, 
  Lock, 
  Clock, 
  DollarSign,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Cpu
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { wallet, connect, isConnecting } = useWallet();

  const handleGetStarted = () => {
    if (wallet.isConnected) {
      router.push('/dashboard');
    } else {
      connect();
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div className="space-y-8 animate-fade-in-up">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium">
                  <Zap className="h-4 w-4" />
                  Powered by Somnia - 400,000+ TPS
                </div>
                
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                  Credit Scoring
                  <span className="block text-blue-200">for DeFi</span>
                </h1>
                
                <p className="text-xl text-blue-100 leading-relaxed">
                  Get instant, ML-powered credit scores on-chain. 
                  Unlock better rates, higher limits, and transparent lending.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleGetStarted}
                  isLoading={isConnecting}
                  size="lg"
                  className="bg-white text-blue-700 hover:bg-blue-50"
                >
                  {wallet.isConnected ? 'Go to Dashboard' : 'Connect Wallet'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <Button 
                  variant="ghost"
                  size="lg"
                  onClick={() => router.push('/dashboard')}
                  className="text-white border-2 border-white/30 hover:bg-white/10"
                >
                  View Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
                <div>
                  <div className="text-3xl font-bold">85%</div>
                  <div className="text-sm text-blue-200">Model Accuracy</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">&lt;3s</div>
                  <div className="text-sm text-blue-200">Score Update</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">$0.0001</div>
                  <div className="text-sm text-blue-200">Gas Cost</div>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative lg:block hidden animate-fade-in">
              <div className="relative">
                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-2">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Credit Score</span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Excellent
                      </span>
                    </div>
                    <div className="text-6xl font-bold text-gray-900">
                      782
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 w-3/4" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div>
                        <div className="text-xs text-gray-600">Confidence</div>
                        <div className="text-lg font-semibold text-gray-900">94%</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">Requests</div>
                        <div className="text-lg font-semibold text-gray-900">12</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute -top-6 -right-6 bg-blue-500 rounded-xl shadow-xl p-4 transform -rotate-6">
                  <Cpu className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-green-500 rounded-xl shadow-xl p-4 transform rotate-6">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Oracle?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built on cutting-edge ML and blockchain technology for transparent, fast, and accurate credit scoring
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Lightning Fast
                </h3>
                <p className="text-gray-600">
                  Get credit scores in under 3 seconds thanks to Somnia's 400,000+ TPS blockchain
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  85% Accuracy
                </h3>
                <p className="text-gray-600">
                  Random Forest ML model trained on proven datasets with validated performance
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Transparent
                </h3>
                <p className="text-gray-600">
                  All scores stored on-chain with full audit trail and verifiable computation
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Low Cost
                </h3>
                <p className="text-gray-600">
                  ~$0.0001 per transaction vs $20+ on Ethereum. 99.9% cheaper!
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Secure
                </h3>
                <p className="text-gray-600">
                  Battle-tested smart contracts with comprehensive security patterns
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Real-Time
                </h3>
                <p className="text-gray-600">
                  Automatic oracle updates with event-driven architecture for instant scoring
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple 3-step process to get your credit score on-chain
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Connect Wallet
              </h3>
              <p className="text-gray-600">
                Connect your MetaMask wallet to Somnia Dream Testnet
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Request Score
              </h3>
              <p className="text-gray-600">
                Pay 0.001 STT oracle fee and submit your address
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Get Results
              </h3>
              <p className="text-gray-600">
                ML model analyzes your wallet and returns score in ~3 seconds
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl sm:text-5xl font-bold">
            Ready to Get Your Credit Score?
          </h2>
          <p className="text-xl text-blue-100">
            Join the future of decentralized lending with transparent, on-chain credit scoring
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleGetStarted}
              isLoading={isConnecting}
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50"
            >
              {wallet.isConnected ? 'Go to Dashboard' : 'Get Started Now'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <p className="text-sm text-blue-200">
            No credit card required • Free testnet tokens available
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">400K+</div>
              <div className="text-gray-600">TPS on Somnia</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">85%</div>
              <div className="text-gray-600">ML Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">&lt;3s</div>
              <div className="text-gray-600">Score Time</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Oracle Uptime</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}