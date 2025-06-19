import { StyleSheet, Platform, Dimensions } from 'react-native';
import { colors } from '../../theme/colors';

// Responsive sizing helper functions
const getScaledSize = (baseSize) => {
  const { width } = Dimensions.get('window');
  const baseWidth = 375; // Base width for iPhone
  const scaleFactor = Math.min(width / baseWidth, 1.5); // Cap scale factor
  return Math.round(baseSize * scaleFactor);
};

const getResponsiveWidth = (percentage) => {
  const { width } = Dimensions.get('window');
  return width * (percentage / 100);
};

// Platform-specific styles
const getPlatformStyles = (deviceType) => {
  switch (deviceType) {
    case 'mobile':
      return {
        container: {
          paddingHorizontal: 8,
          maxWidth: '100%',
        },
        mainCard: {
          width: '100%',
          padding: 8,
          marginHorizontal: 0,
        },
        tabsContainer: {
          width: '100%',
          padding: 4,
        },
        loanCategoryButton: {
          width: '32%',
          minHeight: 50,
          marginBottom: 6,
          paddingHorizontal: 4,
          paddingVertical: 8,
        },
        loanCategoriesContainer: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          paddingHorizontal: 4,
          gap: 6,
          width: '100%',
        },
      };
    case 'tablet':
      return {
        container: {
          paddingHorizontal: 16,
          maxWidth: '100%',
        },
        mainCard: {
          width: '80%',
          padding: 16,
        },
        tabsContainer: {
          width: '80%',
          padding: 8,
        },
        loanCategoryButton: {
          width: '31%',
          minHeight: 40,
        },
        loanCategoriesContainer: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
          paddingHorizontal: 12,
          gap: 12,
          width: '100%',
        },
      };
    case 'windows':
    default:
      return {
        container: {
          paddingHorizontal: 24,
          marginHorizontal: 'auto',
        },
        mainCard: {
          width: '50%',
          padding: 24,
        },
        tabsContainer: {
          width: '50%',
          padding: 12,
        },
        loanCategoryButton: {
          width: '31%',
          minHeight: 45,
        },
        loanCategoriesContainer: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
          paddingHorizontal: 16,
          gap: 16,
          width: '100%',
        },
      };
  }
};

// Dashboard styles
const dashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
    width: '100%',
    ...(Platform.OS === 'web' && {
      '@media (max-width: 425px)': getPlatformStyles('mobile').container,
      '@media (min-width: 426px) and (max-width: 768px)': getPlatformStyles('tablet').container,
      '@media (min-width: 769px)': getPlatformStyles('windows').container,
      height: '100vh',
      overflow: 'hidden',
    }),
    minHeight: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    paddingHorizontal: getScaledSize(8),
    paddingTop: getScaledSize(10),
    ...(Platform.OS === 'web' && {
      '@media (max-width: 425px)': {
        paddingHorizontal: getScaledSize(4),
        alignItems: 'center',
      },
      height: '100%',
      overflow: 'auto',
    }),
  },
  headerSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: getScaledSize(5),
    ...(Platform.OS === 'web' && {
      '@media (max-width: 425px)': {
        paddingHorizontal: getScaledSize(4),
        marginBottom: getScaledSize(3),
      }
    }),
  },
  welcomeText: {
    fontSize: getScaledSize(24),
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: getScaledSize(4),
  },
  dateText: {
    fontSize: getScaledSize(12),
    color: colors.text.secondary,
    marginBottom: getScaledSize(8),
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 1,
    backgroundColor: colors.secondary.light,
    borderTopEndRadius: getScaledSize(16),
    borderTopStartRadius: getScaledSize(16),
    flexWrap: 'wrap',
    alignSelf: 'center',
    ...(Platform.OS === 'web' && {
      '@media (max-width: 425px)': getPlatformStyles('mobile').tabsContainer,
      '@media (min-width: 426px) and (max-width: 768px)': getPlatformStyles('tablet').tabsContainer,
      '@media (min-width: 769px)': getPlatformStyles('windows').tabsContainer,
    }),
    ...Platform.select({
      ios: {
        shadowColor: colors.text.secondary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  tabButton: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? (getResponsiveWidth(100) < 768 ? '23%' : '23%') : '23%',
    paddingVertical: getScaledSize(8),
    paddingHorizontal: getScaledSize(4),
    alignItems: 'center',
    justifyContent: 'center',
    borderTopStartRadius: getScaledSize(16),
    borderTopEndRadius: getScaledSize(16),
    marginHorizontal: getScaledSize(1),
    ...(Platform.OS === 'web' && {
      '@media (max-width: 425px)': {
        minWidth: '22%',
        paddingVertical: getScaledSize(6),
        paddingHorizontal: getScaledSize(2),
      }
    }),
  },
  activeTab: {
    backgroundColor: colors.primary.main,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.main,
    textAlign: 'center',
  },
  activeTabLabel: {
    color: colors.text.contrast,
    fontWeight: '700',
  },
  tabIcon: {
    display: 'none',
  },
  tabIconContainer: {
    display: 'none',
  },
  mainCard: {
    backgroundColor: colors.secondary.light,
    borderBottomEndRadius: getScaledSize(16),
    borderBottomStartRadius: getScaledSize(16),
    alignSelf: 'center',
    ...(Platform.OS === 'web' && {
      '@media (max-width: 425px)': getPlatformStyles('mobile').mainCard,
      '@media (min-width: 426px) and (max-width: 768px)': getPlatformStyles('tablet').mainCard,
      '@media (min-width: 769px)': getPlatformStyles('windows').mainCard,
    }),
    ...Platform.select({
      ios: {
        shadowColor: colors.text.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  profileSection: {
    width: '100%',
    alignItems: 'center',
  },
  profileImage: {
    width: getScaledSize(100),
    height: getScaledSize(100),
    borderRadius: getScaledSize(50),
    marginBottom: getScaledSize(16),
    borderWidth: 4,
    borderColor: colors.primary.main,
    backgroundColor: colors.background.paper,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 425px)': {
        width: getScaledSize(80),
        height: getScaledSize(80),
        borderRadius: getScaledSize(40),
        marginBottom: getScaledSize(12),
      }
    }),
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.main,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  infoRow: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.black,
  },
  infoLabel: {
    width: '35%',
    fontSize: 14,
    color: colors.black,
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '600',
  },
  balanceCard: {
    backgroundColor: colors.background.default,
    borderRadius: getScaledSize(16),
    padding: getScaledSize(16),
    width: '100%',
    marginBottom: getScaledSize(12),
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  gridContainer: {
    width: '100%',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom:2,
    paddingHorizontal: 2,
  },
  balanceLabel: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 4,
    minWidth: 100,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 4,
    minWidth: 120,
  },
  chartButton: {
    padding: 4,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceInfo: {
    flex: 1,
  },
  paymentInfo: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  paymentText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  paymentValue: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
  },
  statusDescription: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  remarksContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    alignItems: 'flex-end',
  },
  remarksText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontStyle: 'italic',
    textAlign: 'right',
  },
  savingsStatus: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
  actionButton: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    flexDirection: 'row',
    width: '100%',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  transactionSection: {
    width: '100%',
    backgroundColor: '#F0F4C3',
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    backgroundColor: '#F0F4C3',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.primary.main,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  emptyStateText: {
    fontSize: 15,
    color: colors.text.contrast,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
  loanCategoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: getScaledSize(16),
    width: '100%',
    ...(Platform.OS === 'web' && {
      '@media (max-width: 425px)': {
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        gap: 8,
      },
      '@media (min-width: 426px) and (max-width: 768px)': {
        justifyContent: 'flex-start',
        paddingHorizontal: 12,
        gap: 12,
      },
      '@media (min-width: 769px)': {
        justifyContent: 'flex-start',
        paddingHorizontal: 16,
        gap: 16,
      },
    }),
  },
  loanCategoryButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: getScaledSize(12),
    padding: getScaledSize(8),
    marginBottom: getScaledSize(8),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: getScaledSize(4),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  loanCategoryIcon: {
    fontSize: getScaledSize(24),
    color: '#64748B',
    marginBottom: 4,
    display: 'flex',
  },
  activeLoanCategory: {
    backgroundColor: '#303481',
    borderColor: '#303481',
  },
  activeLoanCategoryIcon: {
    color: '#FFFFFF',
  },
  loanCategoryText: {
    fontSize: getScaledSize(13),
    color: '#0F172A',
    fontWeight: '600',
    textAlign: 'center',
    ...(Platform.OS === 'web' && {
      '@media (max-width: 425px)': {
        fontSize: getScaledSize(11),
      },
    }),
  },
  activeLoanCategoryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loanDetailsCard: {
    backgroundColor: colors.primary.main,
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  loanDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  loanDetailLabel: {
    fontSize: 14,
    color: colors.text.contrast,
    fontWeight: '500',
  },
  loanDetailValue: {
    fontSize: 14,
    color: colors.text.contrast,
    fontWeight: '600',
  },
  loanDate: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
  loanMarks: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
    marginTop: 4,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
  },
  visibilityButton: {
    marginRight: 8,
  },
});

// Settings styles
const settingsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA',
    padding: getScaledSize(16)
  },
  aboutContent: {
    padding: getScaledSize(16)
  },
  modalTitle: {
    fontSize: getScaledSize(20),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: getScaledSize(8),
    marginTop: getScaledSize(16)
  },
  modalText: {
    fontSize: getScaledSize(16),
    color: '#666',
    lineHeight: getScaledSize(24),
    marginBottom: getScaledSize(12)
  }
});

// Layout styles
const layoutStyles = StyleSheet.create({
  drawerContentContainer: {
    flex: 1,
    backgroundColor: '#E0F7FA',
  },
  headerContainer: {
    padding: getScaledSize(20),
    borderBottomWidth: 4,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff',
  },
  profileImage: {
    width: getScaledSize(80),
    height: getScaledSize(80),
    borderRadius: getScaledSize(40),
    alignSelf: 'center',
    marginBottom: getScaledSize(12)
  },
  username: {
    fontSize: getScaledSize(18),
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333'
  },
  menuContainer: {
    flex: 1,
    paddingTop: getScaledSize(20),

  },
  drawerItem: {
    borderRadius: getScaledSize(8),
    marginHorizontal: getScaledSize(8),
    marginVertical: getScaledSize(2),
    overflow: 'hidden',
  },
  selectedItem: {
    backgroundColor: '#B2EBF2',
  },
  drawerItemLabel: {
    fontSize: getScaledSize(14),
    color: '#333',
    fontWeight: '500',
  },
  selectedItemLabel: {
    color: '#006064',
    fontWeight: '600',
  },
  drawerStyle: {
    backgroundColor: '#E0F7FA',
    width: getScaledSize(250)
  }
});

// Query styles
const queryStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA',
    padding: getScaledSize(8),
    paddingBottom: getScaledSize(60),
  },
  scrollContent: {
    paddingVertical: getScaledSize(8),
    alignItems: 'center',
    width: '100%'
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: getScaledSize(12),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: getScaledSize(12),
    paddingHorizontal: getScaledSize(8)
  },
  card: {
    padding: getScaledSize(12),
    borderRadius: getScaledSize(12),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginHorizontal: getScaledSize(4),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }
    }),
  },
  cardContent: {
    width: '100%',
    alignItems: 'center'
  },
  label: {
    fontSize: getScaledSize(16),
    color: '#00796B',
    fontWeight: '600',
    marginBottom: getScaledSize(2),
    textAlign: 'center'
  },
  value: {
    fontSize: getScaledSize(18),
    color: '#004D40',
    fontWeight: '700',
    marginVertical: getScaledSize(2),
    textAlign: 'center'
  },
  remarks: {
    fontSize: getScaledSize(14),
    color: '#004D40',
    fontStyle: 'italic',
    textAlign: 'center'
  },
  dateText: {
    fontSize: getScaledSize(11),
    color: '#00796B',
    fontStyle: 'italic',
    marginTop: getScaledSize(2),
    textAlign: 'center'
  },
  historyButton: {
    marginTop: getScaledSize(6),
    paddingVertical: getScaledSize(3),
    paddingHorizontal: getScaledSize(10),
    backgroundColor: 'transparent',
    borderRadius: getScaledSize(10),
    borderBottomWidth: 1,
    borderBottomColor: '#004D40',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
      },
      android: {
        elevation: 2,
        boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
      },
      web: {
        boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
      }
    }),
  },
  historyButtonText: {
    color: '#004D40',
    fontWeight: '600',
    fontSize: getScaledSize(13),
    textAlign: 'center'
  },
  horizontalScroll: {
    paddingVertical: getScaledSize(8),
    alignItems: 'center',
    justifyContent: 'center'
  },
});

const quickTermStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 425px)': {
        paddingTop: 20,
        paddingHorizontal: 8,
      },
      '@media (min-width: 426px) and (max-width: 768px)': {
        paddingTop: 30,
        paddingHorizontal: 16,
      },
      '@media (min-width: 769px)': {
        paddingTop: 40,
        paddingHorizontal: 24,
      },
    }),
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 425px)': {
        paddingTop: 40,
        paddingHorizontal: 8,
      },
      '@media (min-width: 426px) and (max-width: 768px)': {
        paddingTop: 50,
        paddingHorizontal: 12,
      },
      '@media (min-width: 769px)': {
        paddingTop: 60,
        paddingHorizontal: 16,
      },
    }),
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    ...(Platform.OS === 'web' && {
      '@media (max-width: 425px)': {
        top: 20,
        left: 8,
      },
      '@media (min-width: 426px) and (max-width: 768px)': {
        top: 30,
        left: 12,
      },
      '@media (min-width: 769px)': {
        top: 40,
        left: 16,
      },
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  totalSection: {
    backgroundColor: '#303481',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    ...(Platform.OS === 'web' && {
      '@media (max-width: 425px)': {
        padding: 16,
      },
      '@media (min-width: 426px) and (max-width: 768px)': {
        padding: 18,
      },
      '@media (min-width: 769px)': {
        padding: 20,
      },
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
      },
    }),
  },
  totalLabel: {
    color: '#E2E8F0',
    marginBottom: 8,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 425px)': {
        fontSize: getScaledSize(12),
        marginBottom: 6,
      },
      '@media (min-width: 426px) and (max-width: 768px)': {
        fontSize: getScaledSize(14),
        marginBottom: 7,
      },
      '@media (min-width: 769px)': {
        fontSize: getScaledSize(16),
        marginBottom: 8,
      },
    }),
  },
  totalAmount: {
    fontWeight: '700',
    color: 'white',
    ...(Platform.OS === 'web' && {
      '@media (max-width: 425px)': {
        fontSize: getScaledSize(20),
      },
      '@media (min-width: 426px) and (max-width: 768px)': {
        fontSize: getScaledSize(24),
      },
      '@media (min-width: 769px)': {
        fontSize: getScaledSize(32),
      },
    }),
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 425px)': {
        gap: 8,
        marginBottom: 8,
      },
      '@media (min-width: 426px) and (max-width: 768px)': {
        gap: 10,
        marginBottom: 10,
      },
      '@media (min-width: 769px)': {
        gap: 12,
        marginBottom: 12,
      },
    }),
  },
  paymentCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 425px)': {
        width: '48%',
        padding: 12,
        borderRadius: 8,
      },
      '@media (min-width: 426px) and (max-width: 768px)': {
        width: '48%',
        padding: 14,
        borderRadius: 10,
      },
      '@media (min-width: 769px)': {
        width: '48%',
        padding: 16,
        borderRadius: 12,
      },
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  fullWidthCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...(Platform.OS === 'web' && {
      '@media (max-width: 425px)': {
        marginTop: 8,
      },
      '@media (min-width: 426px) and (max-width: 768px)': {
        marginTop: 10,
      },
      '@media (min-width: 769px)': {
        marginTop: 12,
      },
    }),
  },
  paymentLabel: {
    color: '#64748B',
    marginBottom: 4,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 425px)': {
        fontSize: getScaledSize(11),
        marginBottom: 2,
      },
      '@media (min-width: 426px) and (max-width: 768px)': {
        fontSize: getScaledSize(12),
        marginBottom: 3,
      },
      '@media (min-width: 769px)': {
        fontSize: getScaledSize(14),
        marginBottom: 4,
      },
    }),
  },
  paymentValue: {
    fontWeight: '600',
    color: '#0F172A',
    ...(Platform.OS === 'web' && {
      '@media (max-width: 425px)': {
        fontSize: getScaledSize(14),
      },
      '@media (min-width: 426px) and (max-width: 768px)': {
        fontSize: getScaledSize(16),
      },
      '@media (min-width: 769px)': {
        fontSize: getScaledSize(20),
      },
    }),
  },
});

// Helper functions and styles object
const styles = {
  getScaledSize,
  getResponsiveWidth
};

// Single export statement for all named exports
export {
  dashboardStyles,
  settingsStyles,
  layoutStyles,
  queryStyles,
  quickTermStyles,
  getScaledSize,
  getResponsiveWidth,
  getPlatformStyles
};

export default styles;
