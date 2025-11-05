#!/bin/bash

# Load environment variables
source ../.env

# Get wallet address from private key
WALLET_ADDRESS=$(cast wallet address --private-key $PRIVATE_KEY)
echo "📍 Your wallet address: $WALLET_ADDRESS"

# Check current credit score
echo "🔍 Checking current credit score..."
cast call $CONTRACT_ADDRESS "getCreditScore(address)" $WALLET_ADDRESS \
  --rpc-url https://dream-rpc.somnia.network

echo ""
echo "📝 Submitting loan application (this will trigger credit scoring)..."

# Submit application: 1 STT loan, Personal purpose (0)
cast send $CONTRACT_ADDRESS "submitApplication(uint256,uint8)" 1000000000000000000 0 \
  --rpc-url https://dream-rpc.somnia.network \
  --private-key $PRIVATE_KEY \
  --value 0.001ether

echo "✅ Application submitted! Wait 30 seconds for oracle processing, then check your score again."