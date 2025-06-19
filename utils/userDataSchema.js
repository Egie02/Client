export const USER_DATA_SCHEMA = {
  profile: {
    username: 'Username',
    fullname: 'Username',
    phoneNumber: 'PhoneNumber',
    empStatus: 'Empstatus',
    changePassword: 'change_pass',
  },

  // Financial Balances
  balances: {
    savings: 'Savings',
    shares: 'Shares',
  },

  // Loan Amounts
  loans: {
    regular: 'RegularLoan',
    additional: 'AdditionalLoan',
    appliances: 'AppliancesLoan',
    grocery: 'GroceryLoan',
    quick: 'QuickLoan',
    other: 'OthLoan',
  },

  // Loan Payments/Status
  loanPayments: {
    regular: 'RegPayment',
    additional: 'AddPayment',
    appliances: 'AppPayment',
    grocery: 'GroPayment',
    quick: 'Quistatus',
    other: 'OthPayment',
  },

  // Loan Deductions
  loanDeductions: {
    regular: 'RegDeduct',
    additional: 'AddDeduct',
    appliances: 'AppDeduct',
    grocery: 'GroDeduct',
    quick: 'Quimark',
    other: 'OthDeduct',
  },

  // Savings & Shares
  deposits: {
    savingsPayments: 'SVRemark',
    savingsDeposit: 'SVDeposit',
    sharesPayments: 'SHRemark',
    sharesDeposit: 'SHDeposit',
  },

  // Health & Other Deductions
  deductions: {
    healthDeduction: 'CoopHealth',
  },

  // Digital Services
  digital: {
    certificate: 'DigiCert', // VARCHAR field - always returns string in JavaScript
  },

  // Quick Loan Specific Fields
  quickLoan: {
    status: 'Quistatus',
    remarks: 'Quimark',
    // Quick loan payment terms
    firstTerm: 'QFirst',
    secondTerm: 'QSecond',
    thirdTerm: 'QThird',
    fourthTerm: 'QFourth',
    fifthTerm: 'QFifth',
  },
};

/**
 * Helper function to safely get user data with fallbacks
 */
const safeGetUserData = (user, field, defaultValue = "0.00") => {
  if (!user || !field) return defaultValue;
  
  // Try exact field name first
  if (user.hasOwnProperty(field)) {
    const value = user[field];
    if (value !== null && value !== undefined && value !== '') {
      return String(value).trim();
    }
  }
  
  // Try lowercase field name as fallback
  const lowerField = field.toLowerCase();
  if (user.hasOwnProperty(lowerField)) {
    const value = user[lowerField];
    if (value !== null && value !== undefined && value !== '') {
      return String(value).trim();
    }
  }
  
  return defaultValue;
};

/**
 * Helper function to safely parse numeric values
 */
const safeParseFloat = (value, defaultValue = 0.00) => {
  if (value === null || value === undefined || value === '' || value === 'No Data') {
    return defaultValue;
  }
  
  const parsed = parseFloat(String(value).replace(/[^\d.-]/g, ''));
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Helper functions to get user data using schema mappings
 */
export const getUserData = {
  // Profile getters
  getUsername: (user) => {
    const value = safeGetUserData(user, USER_DATA_SCHEMA.profile.username, "No Data");
    return value === "0.00" ? "No Data" : value;
  },
  
  getPhoneNumber: (user) => {
    const value = safeGetUserData(user, USER_DATA_SCHEMA.profile.phoneNumber, "No Data");
    return value === "0.00" ? "No Data" : value;
  },
  
  getEmpStatus: (user) => {
    const value = safeGetUserData(user, USER_DATA_SCHEMA.profile.empStatus, "No Data");
    return value === "0.00" ? "No Data" : value;
  },
  
  getChangePassword: (user) => {
    const value = safeGetUserData(user, USER_DATA_SCHEMA.profile.changePassword, "0");
    return parseInt(value) || 0;
  },

  // Balance getters with improved number handling
  getSavings: (user) => {
    const value = safeGetUserData(user, USER_DATA_SCHEMA.balances.savings, "0.00");
    return safeParseFloat(value).toFixed(2);
  },
  
  getShares: (user) => {
    const value = safeGetUserData(user, USER_DATA_SCHEMA.balances.shares, "0.00");
    return safeParseFloat(value).toFixed(2);
  },

  // Loan amount getters with validation
  getLoanAmount: (user, category) => {
    if (!category || !USER_DATA_SCHEMA.loans[category.toLowerCase()]) {
      return "0.00";
    }
    const field = USER_DATA_SCHEMA.loans[category.toLowerCase()];
    const value = safeGetUserData(user, field, "0.00");
    return safeParseFloat(value).toFixed(2);
  },

  // Loan payment getters
  getLoanPayment: (user, category) => {
    if (!category || !USER_DATA_SCHEMA.loanPayments[category.toLowerCase()]) {
      return "0";
    }
    const field = USER_DATA_SCHEMA.loanPayments[category.toLowerCase()];
    const value = safeGetUserData(user, field, "0");
    return value === "0.00" ? "0" : value;
  },

  // Loan deduction getters
  getLoanDeduction: (user, category) => {
    if (!category || !USER_DATA_SCHEMA.loanDeductions[category.toLowerCase()]) {
      return "0.00";
    }
    const field = USER_DATA_SCHEMA.loanDeductions[category.toLowerCase()];
    const value = safeGetUserData(user, field, "0.00");
    return safeParseFloat(value).toFixed(2);
  },

  // Deposit getters
  getSavingsPayments: (user) => {
    const value = safeGetUserData(user, USER_DATA_SCHEMA.deposits.savingsPayments, "No Data");
    return value === "0.00" ? "No Data" : value;
  },
  
  getSavingsDeposit: (user) => {
    const value = safeGetUserData(user, USER_DATA_SCHEMA.deposits.savingsDeposit, "0.00");
    return safeParseFloat(value).toFixed(2);
  },
  
  getSharesPayments: (user) => {
    const value = safeGetUserData(user, USER_DATA_SCHEMA.deposits.sharesPayments, "No Data");
    return value === "0.00" ? "No Data" : value;
  },
  
  getSharesDeposit: (user) => {
    const value = safeGetUserData(user, USER_DATA_SCHEMA.deposits.sharesDeposit, "0.00");
    return safeParseFloat(value).toFixed(2);
  },

  // Deduction getters
  getHealthDeduction: (user) => {
    const value = safeGetUserData(user, USER_DATA_SCHEMA.deductions.healthDeduction, "0.00");
    return safeParseFloat(value).toFixed(2);
  },

  // Digital service getters with better validation
  getDigitalCertificate: (user) => {
    const certValue = safeGetUserData(user, USER_DATA_SCHEMA.digital.certificate, "");
    
    // Handle both string and number values from VARCHAR field
    if (!certValue || certValue === "0.00" || certValue === "No Data") {
      return "No Data";
    }
    
    // Convert to string and trim whitespace
    const cleaned = String(certValue).trim();
    return cleaned || "No Data";
  },

  // Quick loan specific getters with improved handling
  getQuickLoanTermsCount: (user) => {
    if (!user) return 0;
    
    const terms = [
      safeGetUserData(user, USER_DATA_SCHEMA.quickLoan.firstTerm, "0.00"),
      safeGetUserData(user, USER_DATA_SCHEMA.quickLoan.secondTerm, "0.00"),
      safeGetUserData(user, USER_DATA_SCHEMA.quickLoan.thirdTerm, "0.00"),
      safeGetUserData(user, USER_DATA_SCHEMA.quickLoan.fourthTerm, "0.00"),
      safeGetUserData(user, USER_DATA_SCHEMA.quickLoan.fifthTerm, "0.00"),
    ];
    
    return terms.filter(term => safeParseFloat(term) > 0).length;
  },

  getQuickLoanStatus: (user) => {
    const value = safeGetUserData(user, USER_DATA_SCHEMA.quickLoan.status, "N/A");
    return value === "0.00" || value === "Default" ? "N/A" : value;
  },

  getQuickLoanRemarks: (user) => {
    const value = safeGetUserData(user, USER_DATA_SCHEMA.quickLoan.remarks, "N/A");
    return value === "0.00" ? "N/A" : value;
  },

  // Quick loan individual term getters
  getQuickLoanTerm: (user, termNumber) => {
    const termFields = {
      1: USER_DATA_SCHEMA.quickLoan.firstTerm,
      2: USER_DATA_SCHEMA.quickLoan.secondTerm,
      3: USER_DATA_SCHEMA.quickLoan.thirdTerm,
      4: USER_DATA_SCHEMA.quickLoan.fourthTerm,
      5: USER_DATA_SCHEMA.quickLoan.fifthTerm,
    };
    
    const field = termFields[termNumber];
    if (!field) return "0.00";
    
    const value = safeGetUserData(user, field, "0.00");
    return safeParseFloat(value).toFixed(2);
  },
};

export const validateUserData = {
  isValidAmount: (amount) => {
    const parsed = safeParseFloat(amount);
    return !isNaN(parsed) && parsed >= 0;
  },
  
  isValidString: (str) => {
    return str && str !== "No Data" && str !== "N/A" && String(str).trim() !== "" && str !== "0.00";
  },
  
  isValidPhoneNumber: (phone) => {
    if (!phone || phone === "No Data" || phone === "N/A") return false;
    const cleaned = String(phone).replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  },
  
  isValidUser: (user) => {
    return user && typeof user === 'object' && Object.keys(user).length > 0;
  },
  
  hasValidLoan: (user, category) => {
    const amount = getUserData.getLoanAmount(user, category);
    return validateUserData.isValidAmount(amount) && safeParseFloat(amount) > 0;
  },
};

export const transformUserData = {
  // Format phone number with country code
  formatPhoneNumber: (phone) => {
    if (!validateUserData.isValidString(phone)) return "No Data";
    
    const cleaned = String(phone).replace(/\D/g, '');
    if (cleaned.length < 10) return "No Data";
    
    return cleaned.startsWith('63') ? `+${cleaned}` : `+63${cleaned}`;
  },

  // Calculate total assets with validation
  calculateTotalAssets: (user) => {
    if (!validateUserData.isValidUser(user)) return 0;
    
    const savings = safeParseFloat(getUserData.getSavings(user));
    const shares = safeParseFloat(getUserData.getShares(user));
    return savings + shares;
  },

  // Calculate total loans with validation
  calculateTotalLoans: (user) => {
    if (!validateUserData.isValidUser(user)) return 0;
    
    const categories = ['regular', 'additional', 'appliances', 'grocery', 'quick', 'other'];
    return categories.reduce((total, category) => {
      const amount = safeParseFloat(getUserData.getLoanAmount(user, category));
      return total + amount;
    }, 0);
  },

  // Get user info mapping for profile display with better validation
  getUserInfoMapping: (user, isPhoneVisible = false) => {
    if (!validateUserData.isValidUser(user)) {
      return {
        Fullname: "No Data",
        Phone: "No Data",
      };
    }

    const mapping = {
      Fullname: getUserData.getUsername(user),
      Phone: isPhoneVisible 
        ? transformUserData.formatPhoneNumber(getUserData.getPhoneNumber(user))
        : "• • • • • • • • • •",
    };

    // Only add EmpStatus if it's valid and not default values
    const empStatus = getUserData.getEmpStatus(user);
    if (validateUserData.isValidString(empStatus) && empStatus.toLowerCase() !== 'n/a') {
      mapping.EmpStatus = empStatus;
    }

    return mapping;
  },

  // Format currency amounts consistently
  formatCurrency: (amount, currency = '₱') => {
    const value = safeParseFloat(amount);
    return `${currency}${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  },

  // Get loan summary for a category
  getLoanSummary: (user, category) => {
    if (!validateUserData.isValidUser(user) || !category) {
      return {
        amount: "0.00",
        payment: "0",
        deduction: "0.00",
        isActive: false,
      };
    }

    const amount = getUserData.getLoanAmount(user, category);
    const payment = getUserData.getLoanPayment(user, category);
    const deduction = getUserData.getLoanDeduction(user, category);

    return {
      amount,
      payment,
      deduction,
      isActive: safeParseFloat(amount) > 0,
    };
  },

  // Enhanced loan renderer helper
  getLoanDisplayInfo: (user, category) => {
    if (!validateUserData.isValidUser(user) || !category) {
      return {
        isEmpty: true,
        title: "No Data",
        amount: "0.00",
        displayType: "empty"
      };
    }

    const loanSummary = transformUserData.getLoanSummary(user, category);
    const loanAmount = safeParseFloat(loanSummary.amount);

    if (loanAmount === 0) {
      return {
        isEmpty: true,
        title: `No active ${category.toLowerCase()} loans`,
        amount: "0.00",
        displayType: "empty"
      };
    }

    // Determine display info based on loan category
    switch (category.toLowerCase()) {
      case 'quick':
        return {
          isEmpty: false,
          title: "Quick Loan Remarks",
          amount: loanSummary.amount,
          displayValue: getUserData.getQuickLoanRemarks(user),
          displayType: "remarks",
          showTermsCount: true,
          termsCount: getUserData.getQuickLoanTermsCount(user),
          status: getUserData.getQuickLoanStatus(user)
        };

      case 'grocery':
      case 'other':
        return {
          isEmpty: false,
          title: `${category} Loan Deduction`,
          amount: loanSummary.amount,
          displayValue: loanSummary.deduction,
          displayType: "deduction"
        };

      default: // regular, additional, appliances
        return {
          isEmpty: false,
          title: `${category} Loan Deduction`,
          amount: loanSummary.amount,
          displayValue: loanSummary.deduction,
          displayType: "deduction",
          payment: loanSummary.payment
        };
    }
  },

  // Get loan category display configuration
  getLoanCategoryConfig: (category) => {
    const configs = {
      regular: {
        label: 'Regular Loan',
        icon: 'cash-multiple',
        showPayment: true,
        showDeduction: true,
        balanceLabel: 'Loan Balance'
      },
      additional: {
        label: 'Additional Loan',
        icon: 'cash-plus',
        showPayment: true,
        showDeduction: true,
        balanceLabel: 'Loan Balance'
      },
      appliances: {
        label: 'Appliances Loan',
        icon: 'television',
        showPayment: true,
        showDeduction: true,
        balanceLabel: 'Loan Balance'
      },
      grocery: {
        label: 'Grocery Loan',
        icon: 'cart',
        showPayment: false,
        showDeduction: true,
        balanceLabel: 'Total Deduction'
      },
      quick: {
        label: 'Quick Loan',
        icon: 'flash',
        showPayment: false,
        showDeduction: false,
        showTerms: true,
        showStatus: true,
        balanceLabel: 'Total Deduction'
      },
      other: {
        label: 'Other Loan',
        icon: 'dots-horizontal',
        showPayment: false,
        showDeduction: true,
        balanceLabel: 'Total Deduction'
      }
    };

    return configs[category.toLowerCase()] || configs.regular;
  },
};

// /**
//  * API field mapping for easy updates
//  * Update these when API response structure changes
//  */
// export const API_FIELD_MAPPINGS = {
//   // If API changes field names, update here instead of throughout the app
//   ALTERNATIVE_MAPPINGS: {
//     // Example: if API changes from 'Username' to 'user_name'
//     // username: 'user_name',
//     // phoneNumber: 'phone_number',
//     // etc.
//   },
// };

// Default export
export default {
  USER_DATA_SCHEMA,
  getUserData,
  validateUserData,
  transformUserData,
//   API_FIELD_MAPPINGS,
}; 