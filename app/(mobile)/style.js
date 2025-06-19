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

// Dashboard styles
export const dashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  headerSection: {
    width: '100%',
    alignItems: 'flex-start', // Left align for better hierarchy
    marginBottom: 5,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 1,
    backgroundColor: colors.secondary.light,
    borderTopEndRadius: 24,
    borderTopStartRadius: 24,
    padding: 2,
    flexWrap: 'wrap',
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
    minWidth: '18%',
    paddingVertical: 8,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopStartRadius: 24,
    borderTopEndRadius: 24,
    marginHorizontal: 1,
  },
  activeTab: {
    backgroundColor: colors.primary.main,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary.main,
    textAlign: 'center',
  },
  activeTabLabel: {
    color: colors.text.contrast,
    fontWeight: '700',
  },
  tabIcon: {
    width: 48,
    height: 48,
    marginBottom: 8,
  },
  tabIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#F0F4C3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  mainCard: {
    backgroundColor: colors.secondary.light,
    borderBottomEndRadius: 24,
    borderBottomStartRadius: 24,
    padding: 30,
    width: '100%',
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
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
    borderWidth: 4,
    borderColor: colors.primary.main,
    backgroundColor: colors.background.paper,
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
    borderRadius: 20,
    padding: 20,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  balanceLabel: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
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
    justifyContent: 'space-between',
    marginBottom: 3,
    paddingHorizontal: 4,
  },
  loanCategoryButton: {
    width: '31%',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  activeLoanCategory: {
    backgroundColor: '#303481',
    borderColor: '#303481',
  },
  loanCategoryIcon: {
    marginBottom: 4,
    color: '#0F172A',
  },
  activeLoanCategoryIcon: {
    color: '#FFFFFF',
  },
  loanCategoryText: {
    fontSize: 11,
    color: '#0F172A',
    fontWeight: '500',
    textAlign: 'center',
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
  // New styles for More tab
  moreContentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  accountStatsCard: {
    backgroundColor: colors.background.default,
    borderRadius: 16,
    padding: 18,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border.main,
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
  accountStatsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 14,
    textAlign: 'left',
  },
  accountStatsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  accountStatsIcon: {
    padding: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  statsRowSingle: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
  },
  lastStatsRow: {
    borderBottomWidth: 0,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statItemColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 4,
  },
  statIcon: {
    marginRight: 12,
  },
  statIconCenter: {
    marginBottom: 6,
  },
  statContent: {
    flex: 1,
  },
  statContentCenter: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  statLabelUnder: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 14,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 3,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  totalCard: {
    width: '48%',
    backgroundColor: colors.background.default,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border.main,
    alignItems: 'center',
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
  totalCardLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
    fontWeight: '500',
    textAlign: 'center',
  },
  totalCardAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
  },
  coopHealthCard: {
    backgroundColor: colors.primary.main,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.text.secondary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  coopHealthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.contrast,
    marginBottom: 4,
  },
  coopHealthSubtitle: {
    fontSize: 14,
    color: colors.text.contrast,
    opacity: 0.8,
    marginBottom: 16,
  },
  coopHealthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coopHealthLabel: {
    fontSize: 16,
    color: colors.text.contrast,
    fontWeight: '500',
  },
  coopHealthValue: {
    fontSize: 18,
    color: colors.text.contrast,
    fontWeight: '700',
  },
  digitalCertCard: {
    backgroundColor: colors.background.default,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border.main,
    alignItems: 'center',
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
  digitalCertTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  digitalCertStatus: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

// Settings styles
export const settingsStyles = StyleSheet.create({
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
export const layoutStyles = StyleSheet.create({
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
export const queryStyles = StyleSheet.create({
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

export const quickTermStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'white',
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
    }),
  },
  totalSection: {
    backgroundColor: '#303481',
    padding: 20,
    borderRadius: 16,
    width: '100%',
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
    }),
  },
  totalLabel: {
    fontSize: 16,
    color: '#E2E8F0',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  paymentCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
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
    }),
  },
  fullWidthCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paymentLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  paymentValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
  },
});

// Export all styles and helper functions
const styles = {
  getScaledSize,
  getResponsiveWidth
};

export default styles;
