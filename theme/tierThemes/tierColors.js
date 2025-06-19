export const tierColors = {
  bronze: {
    start: '#8B4513',
    middle: '#6B3410',
    end: '#4A2C0A',
    light: '#E6B366',
    dark: '#2D1B06',
    accent: '#D4AF37',
    contrast: '#FFFFFF',
    surface: '#F5E6D3',
    border: '#C8860D'
  },
  silver: {
    start: '#E8E8E8',
    middle: '#C0C0C0', 
    end: '#A9A9A9',
    light: '#F5F5F5',
    dark: '#808080',
    accent: '#B8B8B8',
    contrast: '#FFFFFF',
    surface: '#FAFAFA',
    border: '#D3D3D3'
  },
  gold: {
    start: '#FFD700',
    middle: '#FFC000',
    end: '#DAA520',
    light: '#FFF8DC',
    dark: '#B8860B',
    accent: '#FFDF00',
    contrast: '#FFFFFF',
    surface: '#FFFBF0',
    border: '#E6C200'
  },
  roseGold: {
    start: '#FFE4E1',
    middle: '#EE9A9A',
    end: '#B76E79',
    light: '#FFF0F0',
    dark: '#8B4A5C',
    accent: '#F4A460',
    contrast: '#FFFFFF',
    surface: '#FFF5F5',
    border: '#D4A574'
  },
  platinum: {
    start: '#2D3748',
    middle: '#4A5568',
    end: '#1A202C',
    light: '#718096',
    dark: '#171923',
    accent: '#A0AEC0',
    contrast: '#FFFFFF',
    surface: '#F7FAFC',
    border: '#CBD5E0'
  },
  sapphire: {
    start: '#0F3460',
    middle: '#16537e',
    end: '#1e6091',
    light: '#3b82f6',
    dark: '#1e3a8a',
    accent: '#2563eb',
    contrast: '#FFFFFF',
    surface: '#EFF6FF',
    border: '#3B82F6'
  },
  emerald: {
    start: '#064e3b',
    middle: '#059669', 
    end: '#047857',
    light: '#10b981',
    dark: '#065f46',
    accent: '#34d399',
    contrast: '#FFFFFF',
    surface: '#ECFDF5',
    border: '#10B981'
  },
  ruby: {
    start: '#7f1d1d',
    middle: '#dc2626',
    end: '#b91c1c',
    light: '#FFFFFF',
    dark: '#1E293B',
    accent: '#f87171',
    contrast: '#FFFFFF',
    surface: '#FEF2F2',
    border: '#EF4444'
  },    
  diamond: {
    start: '#F8FAFF',      // Very light blue-white for elegance
    middle: '#E8EEFF',     // Light lavender-blue for sophistication  
    end: '#D8E4FF',        // Soft blue for depth
    light: '#64748B',      // Gray for readable text on light backgrounds
    dark: '#1E293B',       // Dark slate for text
    accent: '#6366F1',     // Elegant indigo for accents
    contrast: '#1E293B',   // Dark text for contrast
    surface: '#FFFFFF',    // Pure white surface
    border: '#E2E8F0'      // Light border
  }
};

// Tier thresholds and information
export const tierThresholds = [
  { name: 'bronze', min: 1000, max: 4999, label: 'Bronze Member' },
  { name: 'silver', min: 5000, max: 9999, label: 'Silver Member' },
  { name: 'gold', min: 10000, max: 24999, label: 'Gold Member' },
  { name: 'roseGold', min: 25000, max: 49999, label: 'Rose Gold Member' },
  { name: 'platinum', min: 50000, max: 99999, label: 'Platinum Member' },
  { name: 'sapphire', min: 100000, max: 249999, label: 'Sapphire Member' },
  { name: 'emerald', min: 250000, max: 499999, label: 'Emerald Member' },
  { name: 'ruby', min: 500000, max: 999999, label: 'Ruby Member' },
  { name: 'diamond', min: 1000000, max: Infinity, label: 'Diamond Member' }
];

// Function to determine tier based on shares amount
export const getSharesTier = (sharesAmount) => {
  const amount = parseFloat(sharesAmount) || 0;
  
  if (amount >= 1000000) return 'diamond';
  if (amount >= 500000) return 'ruby';
  if (amount >= 250000) return 'emerald';
  if (amount >= 100000) return 'sapphire';
  if (amount >= 50000) return 'platinum';
  if (amount >= 25000) return 'roseGold';
  if (amount >= 10000) return 'gold';
  if (amount >= 5000) return 'silver';
  if (amount >= 1000) return 'bronze';
  return 'bronze'; // Default tier
};

// Helper functions for tier management
export const getTierInfo = (tierName) => {
  return tierThresholds.find(tier => tier.name === tierName) || tierThresholds[0];
};

export const getTierColors = (tierName) => {
  return tierColors[tierName] || tierColors.bronze;
};

export const getNextTier = (currentTier) => {
  const currentIndex = tierThresholds.findIndex(tier => tier.name === currentTier);
  if (currentIndex === -1 || currentIndex === tierThresholds.length - 1) {
    return null; // Already at highest tier or tier not found
  }
  return tierThresholds[currentIndex + 1];
};

export const getTierProgress = (sharesAmount, currentTier) => {
  const amount = parseFloat(sharesAmount) || 0;
  const tierInfo = getTierInfo(currentTier);
  const nextTier = getNextTier(currentTier);
  
  if (!nextTier) {
    return { progress: 100, remaining: 0, nextTierName: null };
  }
  
  const progress = ((amount - tierInfo.min) / (nextTier.min - tierInfo.min)) * 100;
  const remaining = nextTier.min - amount;
  
  return {
    progress: Math.min(Math.max(progress, 0), 100),
    remaining: Math.max(remaining, 0),
    nextTierName: nextTier.name,
    nextTierLabel: nextTier.label
  };
};

// Tier benefits system
export const tierBenefits = {
  bronze: [
    'Basic member benefits',
    'Standard transaction limits',
    'Email support'
  ],
  silver: [
    'Enhanced member benefits',
    'Increased transaction limits',
    'Priority email support',
    'Monthly statements'
  ],
  gold: [
    'Premium member benefits',
    'Higher transaction limits',
    'Phone support',
    'Quarterly reviews',
    'Special promotions'
  ],
  roseGold: [
    'VIP member benefits',
    'Premium transaction limits',
    'Dedicated support line',
    'Monthly reviews',
    'Exclusive offers',
    'Early access to new features'
  ],
  platinum: [
    'Elite member benefits',
    'Maximum transaction limits',
    '24/7 priority support',
    'Personal account manager',
    'Premium exclusive offers',
    'Beta feature access',
    'Annual financial consultation'
  ],
  sapphire: [
    'Sapphire elite benefits',
    'Unlimited transaction limits',
    'Concierge support service',
    'Dedicated relationship manager',
    'Luxury exclusive offers',
    'Private member events',
    'Quarterly financial planning',
    'Investment advisory services'
  ],
  emerald: [
    'Emerald premium benefits',
    'Enterprise transaction limits',
    'White-glove support service',
    'Senior relationship manager',
    'Ultra-premium exclusive offers',
    'VIP member events',
    'Monthly financial planning',
    'Advanced investment services',
    'Tax planning assistance'
  ],
  ruby: [
    'Ruby prestige benefits',
    'Corporate transaction limits',
    'Executive support service',
    'Executive relationship manager',
    'Prestige exclusive offers',
    'Executive member events',
    'Bi-weekly financial planning',
    'Premium investment services',
    'Comprehensive tax services',
    'Estate planning consultation'
  ],
  diamond: [
    'Diamond ultimate benefits',
    'Unlimited enterprise limits',
    'Presidential support service',
    'C-suite relationship manager',
    'Ultimate exclusive offers',
    'Presidential member events',
    'Weekly financial planning',
    'Institutional investment services',
    'Full tax and legal services',
    'Complete estate planning',
    'Private wealth management',
    'Global concierge services'
  ]
};

export const getTierBenefits = (tierName) => {
  return tierBenefits[tierName] || tierBenefits.bronze;
};

export default {
  tierColors,
  tierThresholds,
  getSharesTier,
  getTierInfo,
  getTierColors,
  getNextTier,
  getTierProgress,
  getTierBenefits
}; 