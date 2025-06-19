/**
 * Example: How to use the User Data Schema in components
 * 
 * This file shows how to refactor existing code to use the schema
 */

import { getUserData, transformUserData, validateUserData } from './userDataSchema';

// Example: Refactored MobileDashboard helper functions
export const exampleUsage = {
  
  // OLD WAY (directly accessing user properties)
  oldGetLoanAmount: (user, category) => {
    switch (category.toLowerCase()) {
      case 'regular':
        return parseFloat(user?.RegularLoan || "0.00");
      case 'additional':
        return parseFloat(user?.AdditionalLoan || "0.00");
      // ... more cases
      default:
        return 0.00;
    }
  },

  // NEW WAY (using schema)
  newGetLoanAmount: (user, category) => {
    return parseFloat(getUserData.getLoanAmount(user, category)) || 0.00;
  },

  // OLD WAY (manual user info mapping)
  oldUserInfoMapping: (user, isPhoneVisible) => ({
    Fullname: user?.Username || user?.username || "No Data",
    Phone: isPhoneVisible 
      ? `+${user?.PhoneNumber || user?.phoneNumber || "No Data"}`
      : "• • • • • • • • • •",
    ...(user?.Empstatus !== 'n/a' && user?.empStatus !== 'n/a' && {
      EmpStatus: user?.Empstatus || user?.empStatus || "No Data"
    }),
  }),

  // NEW WAY (using schema)
  newUserInfoMapping: (user, isPhoneVisible) => {
    return transformUserData.getUserInfoMapping(user, isPhoneVisible);
  },

  // OLD WAY (manual total calculations)
  oldGetTotalAssets: (user) => {
    const savings = parseFloat(user?.Savings || "0.00");
    const shares = parseFloat(user?.Shares || "0.00");
    return (savings + shares).toFixed(2);
  },

  // NEW WAY (using schema)
  newGetTotalAssets: (user) => {
    return transformUserData.calculateTotalAssets(user).toFixed(2);
  },

  // Example of validation
  validateUserProfile: (user) => {
    const username = getUserData.getUsername(user);
    const phone = getUserData.getPhoneNumber(user);
    const savings = getUserData.getSavings(user);

    return {
      hasValidUsername: validateUserData.isValidString(username),
      hasValidPhone: validateUserData.isValidPhoneNumber(phone),
      hasValidSavings: validateUserData.isValidAmount(savings),
    };
  },

  // Example of using all loan categories
  getAllLoanData: (user) => {
    const categories = ['regular', 'additional', 'appliances', 'grocery', 'quick', 'other'];
    
    return categories.map(category => ({
      category,
      amount: getUserData.getLoanAmount(user, category),
      payment: getUserData.getLoanPayment(user, category),
      deduction: getUserData.getLoanDeduction(user, category),
      isActive: parseFloat(getUserData.getLoanAmount(user, category)) > 0,
    }));
  },
};

// Example: How to update MobileDashboard.js to use schema
export const migrationExample = `
// BEFORE (in MobileDashboard.js):
const userInfoMapping = {
  Fullname: user?.Username || user?.username || "No Data",
  Phone: isPhoneVisible 
    ? \`+\${user?.PhoneNumber || user?.phoneNumber || "No Data"}\`
    : "• • • • • • • • • •",
  ...(user?.Empstatus !== 'n/a' && user?.empStatus !== 'n/a' && {
    EmpStatus: user?.Empstatus || user?.empStatus || "No Data"
  }),
};

// AFTER (in MobileDashboard.js):
import { transformUserData } from '../utils/userDataSchema';

const userInfoMapping = transformUserData.getUserInfoMapping(user, isPhoneVisible);

// BEFORE:
const getLoanAmount = (category) => {
  const loanData = user;
  switch (category.toLowerCase()) {
    case 'regular':
      return parseFloat(loanData?.RegularLoan || "0.00");
    // ... more cases
  }
};

// AFTER:
import { getUserData } from '../utils/userDataSchema';

const getLoanAmount = (category) => {
  return parseFloat(getUserData.getLoanAmount(user, category)) || 0.00;
};
`;

export default exampleUsage; 