// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CreditScoringOracle
 * @dev Smart contract for on-chain credit scoring and loan management
 */
contract CreditScoringOracle is Ownable, ReentrancyGuard {
    
    struct CreditApplication {
        address applicant;
        uint256 loanAmount;
        uint256 creditScore;
        uint256 riskScore; // 0-100
        LoanPurpose purpose;
        ApplicationStatus status;
        uint256 timestamp;
        uint256 interestRate; // basis points (e.g., 500 = 5%)
    }
    
    struct CreditProfile {
        uint256 creditScore;
        uint256 totalLoans;
        uint256 activeLoans;
        uint256 defaultCount;
        bool isBlacklisted;
        uint256 lastUpdated;
    }
    
    enum LoanPurpose {
        Personal,
        Home,
        Auto,
        Business,
        Education
    }
    
    enum ApplicationStatus {
        Pending,
        Approved,
        Rejected,
        Funded,
        Repaid,
        Defaulted
    }
    
    // State variables
    mapping(uint256 => CreditApplication) public applications;
    mapping(address => CreditProfile) public creditProfiles;
    mapping(address => uint256[]) public userApplications;
    
    uint256 public nextApplicationId = 1;
    uint256 public constant MIN_CREDIT_SCORE = 300;
    uint256 public constant MAX_CREDIT_SCORE = 850;
    uint256 public constant APPROVAL_THRESHOLD = 600;
    
    // Oracle settings
    address public oracleAddress;
    uint256 public oracleFee = 0.001 ether;
    
    // Events
    event ApplicationSubmitted(
        uint256 indexed applicationId,
        address indexed applicant,
        uint256 loanAmount,
        LoanPurpose purpose
    );
    
    event ApplicationProcessed(
        uint256 indexed applicationId,
        ApplicationStatus status,
        uint256 creditScore,
        uint256 riskScore
    );
    
    event CreditProfileUpdated(
        address indexed user,
        uint256 newCreditScore,
        uint256 timestamp
    );
    
    event OracleAddressUpdated(address indexed newOracle);
    
    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "Only oracle can call this function");
        _;
    }
    
    modifier validCreditScore(uint256 score) {
        require(
            score >= MIN_CREDIT_SCORE && score <= MAX_CREDIT_SCORE,
            "Invalid credit score range"
        );
        _;
    }
    
    constructor(address _oracleAddress) Ownable(msg.sender) {
        oracleAddress = _oracleAddress;
    }
    
    /**
     * @dev Submit a new credit application
     */
    function submitApplication(
        uint256 _loanAmount,
        LoanPurpose _purpose
    ) external payable nonReentrant returns (uint256) {
        require(_loanAmount > 0, "Loan amount must be greater than 0");
        require(msg.value >= oracleFee, "Insufficient oracle fee");
        
        uint256 applicationId = nextApplicationId++;
        
        applications[applicationId] = CreditApplication({
            applicant: msg.sender,
            loanAmount: _loanAmount,
            creditScore: 0, // Will be set by oracle
            riskScore: 0,   // Will be set by oracle
            purpose: _purpose,
            status: ApplicationStatus.Pending,
            timestamp: block.timestamp,
            interestRate: 0 // Will be calculated based on risk
        });
        
        userApplications[msg.sender].push(applicationId);
        
        emit ApplicationSubmitted(applicationId, msg.sender, _loanAmount, _purpose);
        
        return applicationId;
    }
    
    /**
     * @dev Process application with credit score from oracle
     */
    function processApplication(
        uint256 _applicationId,
        uint256 _creditScore,
        uint256 _riskScore
    ) external onlyOracle validCreditScore(_creditScore) {
        require(_riskScore <= 100, "Risk score must be 0-100");
        
        CreditApplication storage app = applications[_applicationId];
        require(app.applicant != address(0), "Application does not exist");
        require(app.status == ApplicationStatus.Pending, "Application already processed");
        
        app.creditScore = _creditScore;
        app.riskScore = _riskScore;
        
        // Determine approval based on credit score
        if (_creditScore >= APPROVAL_THRESHOLD && _riskScore < 70) {
            app.status = ApplicationStatus.Approved;
            app.interestRate = calculateInterestRate(_creditScore, _riskScore);
        } else {
            app.status = ApplicationStatus.Rejected;
        }
        
        // Update user's credit profile
        _updateCreditProfile(app.applicant, _creditScore);
        
        emit ApplicationProcessed(_applicationId, app.status, _creditScore, _riskScore);
    }
    
    /**
     * @dev Calculate interest rate based on credit score and risk
     */
    function calculateInterestRate(
        uint256 _creditScore,
        uint256 _riskScore
    ) public pure returns (uint256) {
        // Base rate starts at 15% (1500 basis points)
        uint256 baseRate = 1500;
        
        // Reduce rate for higher credit scores
        if (_creditScore >= 750) {
            baseRate = 500; // 5%
        } else if (_creditScore >= 700) {
            baseRate = 800; // 8%
        } else if (_creditScore >= 650) {
            baseRate = 1200; // 12%
        }
        
        // Add risk premium
        uint256 riskPremium = (_riskScore * 10); // 0.1% per risk point
        
        return baseRate + riskPremium;
    }
    
    /**
     * @dev Update user's credit profile
     */
    function _updateCreditProfile(address _user, uint256 _creditScore) internal {
        CreditProfile storage profile = creditProfiles[_user];
        profile.creditScore = _creditScore;
        profile.lastUpdated = block.timestamp;
        
        emit CreditProfileUpdated(_user, _creditScore, block.timestamp);
    }
    
    /**
     * @dev Get user's applications
     */
    function getUserApplications(address _user) external view returns (uint256[] memory) {
        return userApplications[_user];
    }
    
    /**
     * @dev Get application details
     */
    function getApplication(uint256 _applicationId) external view returns (CreditApplication memory) {
        return applications[_applicationId];
    }
    
    /**
     * @dev Update oracle address (only owner)
     */
    function updateOracleAddress(address _newOracle) external onlyOwner {
        require(_newOracle != address(0), "Invalid oracle address");
        oracleAddress = _newOracle;
        emit OracleAddressUpdated(_newOracle);
    }
    
    /**
     * @dev Update oracle fee (only owner)
     */
    function updateOracleFee(uint256 _newFee) external onlyOwner {
        oracleFee = _newFee;
    }
    
    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Emergency pause functionality
     */
    function blacklistUser(address _user) external onlyOwner {
        creditProfiles[_user].isBlacklisted = true;
    }
    
    function removeBlacklist(address _user) external onlyOwner {
        creditProfiles[_user].isBlacklisted = false;
    }
}