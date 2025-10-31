// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/CreditScoringOracle.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CreditScoringOracleTest is Test {
    CreditScoringOracle public oracle;
    
    address public owner = address(0x1);
    address public oracleAddress = address(0x2);
    address public user1 = address(0x3);
    address public user2 = address(0x4);
    
    uint256 public constant ORACLE_FEE = 0.001 ether;
    
    event ApplicationSubmitted(
        uint256 indexed applicationId,
        address indexed applicant,
        uint256 loanAmount,
        CreditScoringOracle.LoanPurpose purpose
    );
    
    event ApplicationProcessed(
        uint256 indexed applicationId,
        CreditScoringOracle.ApplicationStatus status,
        uint256 creditScore,
        uint256 riskScore
    );
    
    function setUp() public {
        vm.prank(owner);
        oracle = new CreditScoringOracle(oracleAddress);
        
        // Give users some ETH for testing
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
    }
    
    function testSubmitApplication() public {
        vm.prank(user1);
        
        vm.expectEmit(true, true, false, true);
        emit ApplicationSubmitted(1, user1, 50000, CreditScoringOracle.LoanPurpose.Personal);
        
        uint256 applicationId = oracle.submitApplication{value: ORACLE_FEE}(
            50000,
            CreditScoringOracle.LoanPurpose.Personal
        );
        
        assertEq(applicationId, 1);
        
        CreditScoringOracle.CreditApplication memory app = oracle.getApplication(1);
        assertEq(app.applicant, user1);
        assertEq(app.loanAmount, 50000);
        assertEq(uint256(app.purpose), uint256(CreditScoringOracle.LoanPurpose.Personal));
        assertEq(uint256(app.status), uint256(CreditScoringOracle.ApplicationStatus.Pending));
    }
    
    function testSubmitApplicationInsufficientFee() public {
        vm.prank(user1);
        
        vm.expectRevert("Insufficient oracle fee");
        oracle.submitApplication{value: 0.0005 ether}(
            50000,
            CreditScoringOracle.LoanPurpose.Personal
        );
    }
    
    function testSubmitApplicationZeroAmount() public {
        vm.prank(user1);
        
        vm.expectRevert("Loan amount must be greater than 0");
        oracle.submitApplication{value: ORACLE_FEE}(
            0,
            CreditScoringOracle.LoanPurpose.Personal
        );
    }
    
    function testProcessApplicationApproval() public {
        // Submit application first
        vm.prank(user1);
        uint256 applicationId = oracle.submitApplication{value: ORACLE_FEE}(
            50000,
            CreditScoringOracle.LoanPurpose.Personal
        );
        
        // Process application with good credit score
        vm.prank(oracleAddress);
        vm.expectEmit(true, false, false, true);
        emit ApplicationProcessed(
            applicationId,
            CreditScoringOracle.ApplicationStatus.Approved,
            720,
            30
        );
        
        oracle.processApplication(applicationId, 720, 30);
        
        CreditScoringOracle.CreditApplication memory app = oracle.getApplication(applicationId);
        assertEq(app.creditScore, 720);
        assertEq(app.riskScore, 30);
        assertEq(uint256(app.status), uint256(CreditScoringOracle.ApplicationStatus.Approved));
        assertTrue(app.interestRate > 0);
    }
    
    function testProcessApplicationRejection() public {
        // Submit application first
        vm.prank(user1);
        uint256 applicationId = oracle.submitApplication{value: ORACLE_FEE}(
            50000,
            CreditScoringOracle.LoanPurpose.Personal
        );
        
        // Process application with poor credit score
        vm.prank(oracleAddress);
        oracle.processApplication(applicationId, 550, 80);
        
        CreditScoringOracle.CreditApplication memory app = oracle.getApplication(applicationId);
        assertEq(app.creditScore, 550);
        assertEq(app.riskScore, 80);
        assertEq(uint256(app.status), uint256(CreditScoringOracle.ApplicationStatus.Rejected));
    }
    
    function testProcessApplicationOnlyOracle() public {
        // Submit application first
        vm.prank(user1);
        uint256 applicationId = oracle.submitApplication{value: ORACLE_FEE}(
            50000,
            CreditScoringOracle.LoanPurpose.Personal
        );
        
        // Try to process from non-oracle address
        vm.prank(user2);
        vm.expectRevert("Only oracle can call this function");
        oracle.processApplication(applicationId, 720, 30);
    }
    
    function testCalculateInterestRate() public {
        // Test excellent credit (750+)
        uint256 rate1 = oracle.calculateInterestRate(780, 20);
        assertEq(rate1, 700); // 5% base + 2% risk = 7%
        
        // Test good credit (700-749)
        uint256 rate2 = oracle.calculateInterestRate(720, 30);
        assertEq(rate2, 1100); // 8% base + 3% risk = 11%
        
        // Test fair credit (650-699)
        uint256 rate3 = oracle.calculateInterestRate(670, 50);
        assertEq(rate3, 1700); // 12% base + 5% risk = 17%
        
        // Test poor credit (<650)
        uint256 rate4 = oracle.calculateInterestRate(600, 70);
        assertEq(rate4, 2200); // 15% base + 7% risk = 22%
    }
    
    function testGetUserApplications() public {
        // Submit multiple applications
        vm.startPrank(user1);
        uint256 app1 = oracle.submitApplication{value: ORACLE_FEE}(
            30000,
            CreditScoringOracle.LoanPurpose.Auto
        );
        uint256 app2 = oracle.submitApplication{value: ORACLE_FEE}(
            100000,
            CreditScoringOracle.LoanPurpose.Home
        );
        vm.stopPrank();
        
        uint256[] memory userApps = oracle.getUserApplications(user1);
        assertEq(userApps.length, 2);
        assertEq(userApps[0], app1);
        assertEq(userApps[1], app2);
    }
    
    function testUpdateOracleAddress() public {
        address newOracle = address(0x5);
        
        vm.prank(owner);
        oracle.updateOracleAddress(newOracle);
        
        assertEq(oracle.oracleAddress(), newOracle);
    }
    
    function testUpdateOracleAddressOnlyOwner() public {
        address newOracle = address(0x5);
        
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, user1));
        oracle.updateOracleAddress(newOracle);
    }
    
    function testUpdateOracleFee() public {
        uint256 newFee = 0.002 ether;
        
        vm.prank(owner);
        oracle.updateOracleFee(newFee);
        
        assertEq(oracle.oracleFee(), newFee);
    }
    
    function testWithdraw() public {
        // Submit application to add funds to contract
        vm.prank(user1);
        oracle.submitApplication{value: ORACLE_FEE}(
            50000,
            CreditScoringOracle.LoanPurpose.Personal
        );
        
        uint256 contractBalance = address(oracle).balance;
        uint256 ownerBalanceBefore = owner.balance;
        
        vm.prank(owner);
        oracle.withdraw();
        
        assertEq(address(oracle).balance, 0);
        assertEq(owner.balance, ownerBalanceBefore + contractBalance);
    }
    
    function testBlacklistUser() public {
        vm.prank(owner);
        oracle.blacklistUser(user1);
        
        (, , , , bool isBlacklisted, ) = oracle.creditProfiles(user1);
        assertTrue(isBlacklisted);
    }
    
    function testRemoveBlacklist() public {
        // First blacklist
        vm.prank(owner);
        oracle.blacklistUser(user1);
        
        // Then remove blacklist
        vm.prank(owner);
        oracle.removeBlacklist(user1);
        
        (, , , , bool isBlacklisted, ) = oracle.creditProfiles(user1);
        assertFalse(isBlacklisted);
    }
    
    function testInvalidCreditScore() public {
        // Submit application first
        vm.prank(user1);
        uint256 applicationId = oracle.submitApplication{value: ORACLE_FEE}(
            50000,
            CreditScoringOracle.LoanPurpose.Personal
        );
        
        // Try to process with invalid credit score
        vm.prank(oracleAddress);
        vm.expectRevert("Invalid credit score range");
        oracle.processApplication(applicationId, 900, 30); // Score too high
        
        vm.prank(oracleAddress);
        vm.expectRevert("Invalid credit score range");
        oracle.processApplication(applicationId, 200, 30); // Score too low
    }
}