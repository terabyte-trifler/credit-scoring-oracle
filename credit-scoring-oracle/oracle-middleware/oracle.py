#!/usr/bin/env python3
"""
Oracle Middleware - Day 2
Listens for credit score requests on Somnia chain and fulfills them using ML API
"""

import os
import time
import json
import requests
from web3 import Web3
from web3.middleware import ExtraDataToPOAMiddleware
from eth_account import Account
from dotenv import load_dotenv
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class OracleMiddleware:
    def __init__(self):
        """Initialize the oracle middleware"""
        # Configuration
        self.rpc_url = os.getenv('SOMNIA_TESTNET_RPC_URL', 'https://dream-rpc.somnia.network')
        self.contract_address = os.getenv('CONTRACT_ADDRESS')
        self.private_key = os.getenv('PRIVATE_KEY')
        self.ml_api_url = os.getenv('ML_API_URL', 'http://localhost:8001')
        
        # Validate configuration
        if not self.contract_address:
            raise ValueError("CONTRACT_ADDRESS not set in .env file")
        if not self.private_key:
            raise ValueError("PRIVATE_KEY not set in .env file")
        
        # Initialize Web3
        logger.info(f"Connecting to Somnia RPC: {self.rpc_url}")
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        
        # Add POA middleware for Somnia
        self.w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)
        
        # Verify connection
        if not self.w3.is_connected():
            raise ConnectionError(f"Failed to connect to {self.rpc_url}")
        
        logger.info(f"✅ Connected to Somnia (Chain ID: {self.w3.eth.chain_id})")
        
        # Setup account
        self.account = Account.from_key(self.private_key)
        self.oracle_address = self.account.address
        logger.info(f"Oracle address: {self.oracle_address}")
        
        # Check balance
        balance = self.w3.eth.get_balance(self.oracle_address)
        balance_eth = self.w3.from_wei(balance, 'ether')
        logger.info(f"Oracle balance: {balance_eth} STT")
        
        if balance == 0:
            logger.warning("⚠️  Oracle has no balance! Get testnet tokens from https://faucet.somnia.network")
        
        # Load contract ABI
        self.contract_abi = self._load_contract_abi()
        self.contract = self.w3.eth.contract(
            address=Web3.to_checksum_address(self.contract_address),
            abi=self.contract_abi
        )
        
        logger.info(f"✅ Contract loaded: {self.contract_address}")
        
        # Verify oracle role
        try:
            oracle_addr = self.contract.functions.oracleAddress().call()
            if oracle_addr.lower() != self.oracle_address.lower():
                logger.warning(f"⚠️  Oracle address mismatch!")
                logger.warning(f"   Contract expects: {oracle_addr}")
                logger.warning(f"   Your address: {self.oracle_address}")
        except Exception as e:
            logger.error(f"Failed to verify oracle role: {e}")
    
    def _load_contract_abi(self):
        """Load contract ABI from compiled artifacts"""
        # Try multiple locations
        abi_paths = [
            '../smart-contracts/out/CreditScoreOracle.sol/CreditScoreOracle.json',
            './CreditScoreOracle.json',
            '../CreditScoreOracle.json'
        ]
        
        for path in abi_paths:
            if os.path.exists(path):
                with open(path, 'r') as f:
                    artifact = json.load(f)
                    return artifact['abi']
        
        # If no file found, use embedded ABI
        logger.warning("Contract ABI file not found, using embedded ABI")
        return self._get_embedded_abi()
    
    def _get_embedded_abi(self):
        """Embedded contract ABI for CreditScoringOracle"""
        return [
            {
                "inputs": [{"internalType": "address", "name": "_oracleAddress", "type": "address"}],
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "anonymous": False,
                "inputs": [
                    {"indexed": True, "internalType": "uint256", "name": "applicationId", "type": "uint256"},
                    {"indexed": True, "internalType": "address", "name": "applicant", "type": "address"},
                    {"indexed": False, "internalType": "uint256", "name": "loanAmount", "type": "uint256"},
                    {"indexed": False, "internalType": "uint8", "name": "purpose", "type": "uint8"}
                ],
                "name": "ApplicationSubmitted",
                "type": "event"
            },
            {
                "anonymous": False,
                "inputs": [
                    {"indexed": True, "internalType": "uint256", "name": "applicationId", "type": "uint256"},
                    {"indexed": False, "internalType": "uint8", "name": "status", "type": "uint8"},
                    {"indexed": False, "internalType": "uint256", "name": "creditScore", "type": "uint256"},
                    {"indexed": False, "internalType": "uint256", "name": "riskScore", "type": "uint256"}
                ],
                "name": "ApplicationProcessed",
                "type": "event"
            },
            {
                "inputs": [
                    {"internalType": "uint256", "name": "_loanAmount", "type": "uint256"},
                    {"internalType": "uint8", "name": "_purpose", "type": "uint8"}
                ],
                "name": "submitApplication",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "uint256", "name": "_applicationId", "type": "uint256"},
                    {"internalType": "uint256", "name": "_creditScore", "type": "uint256"},
                    {"internalType": "uint256", "name": "_riskScore", "type": "uint256"}
                ],
                "name": "processApplication",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "uint256", "name": "_applicationId", "type": "uint256"}],
                "name": "getApplication",
                "outputs": [
                    {"internalType": "address", "name": "applicant", "type": "address"},
                    {"internalType": "uint256", "name": "loanAmount", "type": "uint256"},
                    {"internalType": "uint256", "name": "creditScore", "type": "uint256"},
                    {"internalType": "uint256", "name": "riskScore", "type": "uint256"},
                    {"internalType": "uint8", "name": "purpose", "type": "uint8"},
                    {"internalType": "uint8", "name": "status", "type": "uint8"},
                    {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
                    {"internalType": "uint256", "name": "interestRate", "type": "uint256"}
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "oracleAddress",
                "outputs": [{"internalType": "address", "name": "", "type": "address"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "owner",
                "outputs": [{"internalType": "address", "name": "", "type": "address"}],
                "stateMutability": "view",
                "type": "function"
            }
        ]
    
    def get_credit_score_from_api(self, wallet_address):
        """Call ML API to get credit score for a wallet"""
        try:
            logger.info(f"Calling ML API for wallet: {wallet_address}")
            
            # Prepare request
            url = f"{self.ml_api_url}/api/v1/credit-score"
            payload = {
                "wallet_address": wallet_address
            }
            
            # Make request with timeout
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data['status'] == 'success':
                score = int(data['credit_score'])
                confidence = int(data['confidence'])
                logger.info(f"✅ ML API returned: score={score}, confidence={confidence}")
                return score, confidence
            else:
                logger.error(f"ML API error: {data.get('message', 'Unknown error')}")
                return None, None
                
        except requests.exceptions.Timeout:
            logger.error("ML API request timed out")
            return None, None
        except requests.exceptions.ConnectionError:
            logger.error(f"Cannot connect to ML API at {self.ml_api_url}")
            logger.error("Make sure the API is running: cd ml-api && python3 api.py")
            return None, None
        except Exception as e:
            logger.error(f"Error calling ML API: {e}")
            return None, None
    
    def update_score_on_chain(self, request_id, wallet_address, score, confidence):
        """Update credit score on the smart contract"""
        try:
            logger.info(f"Updating score on-chain for request {request_id.hex()}")
            
            # Get current nonce
            nonce = self.w3.eth.get_transaction_count(self.oracle_address)
            
            # Build transaction
            tx = self.contract.functions.updateCreditScore(
                request_id,
                Web3.to_checksum_address(wallet_address),
                score,
                confidence
            ).build_transaction({
                'from': self.oracle_address,
                'nonce': nonce,
                'gas': 200000,
                'maxFeePerGas': self.w3.to_wei('2', 'gwei'),
                'maxPriorityFeePerGas': self.w3.to_wei('1', 'gwei'),
                'chainId': self.w3.eth.chain_id
            })
            
            # Sign transaction
            signed_tx = self.w3.eth.account.sign_transaction(tx, self.private_key)
            
            # Send transaction
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            logger.info(f"Transaction sent: {tx_hash.hex()}")
            
            # Wait for receipt (Somnia is fast, ~400ms)
            logger.info("Waiting for confirmation...")
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=30)
            
            if receipt['status'] == 1:
                logger.info(f"✅ Score updated successfully!")
                logger.info(f"   Block: {receipt['blockNumber']}")
                logger.info(f"   Gas used: {receipt['gasUsed']}")
                return True
            else:
                logger.error(f"❌ Transaction failed!")
                return False
                
        except Exception as e:
            logger.error(f"Error updating score on-chain: {e}")
            return False
    
    def process_score_request(self, event):
        """Process a single score request event"""
        try:
            request_id = event['args']['requestId']
            wallet = event['args']['wallet']
            requester = event['args']['requester']
            
            logger.info("="*60)
            logger.info(f"📋 New Score Request")
            logger.info(f"   Request ID: {request_id.hex()}")
            logger.info(f"   Wallet: {wallet}")
            logger.info(f"   Requester: {requester}")
            logger.info(f"   Block: {event['blockNumber']}")
            logger.info("="*60)
            
            # Get credit score from ML API
            score, confidence = self.get_credit_score_from_api(wallet)
            
            if score is None:
                logger.error("Failed to get score from ML API, skipping...")
                return False
            
            # Update score on blockchain
            success = self.update_score_on_chain(request_id, wallet, score, confidence)
            
            if success:
                logger.info("✅ Request processed successfully!")
            else:
                logger.error("❌ Failed to process request")
            
            return success
            
        except Exception as e:
            logger.error(f"Error processing request: {e}")
            return False
    
    def listen_for_requests(self):
        """Listen for ScoreRequested events and process them"""
        logger.info("\n" + "="*60)
        logger.info("🎧 Oracle Middleware Started")
        logger.info("="*60)
        logger.info(f"Contract: {self.contract_address}")
        logger.info(f"Oracle: {self.oracle_address}")
        logger.info(f"ML API: {self.ml_api_url}")
        logger.info(f"Network: Somnia Dream Testnet")
        logger.info("="*60)
        logger.info("Listening for score requests...")
        logger.info("Press Ctrl+C to stop")
        logger.info("="*60 + "\n")
        
        # Get current block
        latest_block = self.w3.eth.block_number
        from_block = latest_block
        
        # Create event filter for ApplicationSubmitted
        event_filter = self.contract.events.ApplicationSubmitted.create_filter(
            from_block=from_block
        )
        
        processed_requests = set()
        
        try:
            while True:
                # Check for new events
                events = event_filter.get_new_entries()
                
                for event in events:
                    request_id = event['args']['requestId']
                    
                    # Skip if already processed
                    if request_id in processed_requests:
                        continue
                    
                    # Process the request
                    success = self.process_score_request(event)
                    
                    if success:
                        processed_requests.add(request_id)
                
                # Sleep briefly (Somnia is fast!)
                time.sleep(2)
                
        except KeyboardInterrupt:
            logger.info("\n\n" + "="*60)
            logger.info("🛑 Oracle Middleware Stopped")
            logger.info("="*60)
            logger.info(f"Processed {len(processed_requests)} requests")
            logger.info("="*60)

def main():
    """Main entry point"""
    try:
        oracle = OracleMiddleware()
        oracle.listen_for_requests()
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        return 1
    
    return 0

if __name__ == '__main__':
    exit(main())