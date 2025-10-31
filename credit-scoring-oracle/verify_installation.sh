#!/bin/bash
echo "🔍 Verifying Installation..."
echo ""

# Check Python
echo "1. Checking Python..."
python3 --version && echo "   ✅ Python installed" || echo "   ❌ Python missing"

# Check pip packages
echo "2. Checking Python packages..."
python3 -c "import sklearn, pandas, numpy, flask" 2>/dev/null && echo "   ✅ All packages installed" || echo "   ❌ Some packages missing"

# Check Foundry
echo "3. Checking Foundry..."
forge --version > /dev/null 2>&1 && echo "   ✅ Forge installed" || echo "   ❌ Forge missing"
cast --version > /dev/null 2>&1 && echo "   ✅ Cast installed" || echo "   ❌ Cast missing"

# Check project structure
echo "4. Checking project structure..."
[ -f "ml-api/app.py" ] && echo "   ✅ ML API files present" || echo "   ❌ ML API files missing"
[ -f "smart-contracts/src/CreditScoringOracle.sol" ] && echo "   ✅ Smart contracts present" || echo "   ❌ Smart contracts missing"
[ -f "ml-api/models/best_credit_model.pkl" ] && echo "   ✅ ML models present" || echo "   ❌ ML models missing"

# Check dependencies
echo "5. Checking contract dependencies..."
[ -d "smart-contracts/lib/forge-std" ] && echo "   ✅ Forge-std installed" || echo "   ❌ Forge-std missing"
[ -d "smart-contracts/lib/openzeppelin-contracts" ] && echo "   ✅ OpenZeppelin installed" || echo "   ❌ OpenZeppelin missing"

echo ""
echo "✅ Verification complete!"
