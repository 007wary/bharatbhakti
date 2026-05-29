import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';

const RC_API_KEY = 'goog_qmidOMXAkNyxyWDHapIEjsKfmxy';
const ENTITLEMENT_ID = 'pro';

// ─── Initialize ───────────────────────────────────────────────────────────────
export const initializePurchases = async (userId) => {
  try {
    if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    await Purchases.configure({ apiKey: RC_API_KEY, appUserID: userId });
  } catch (e) {
    console.error('[purchaseService] init error:', e);
  }
};

// ─── Check Pro Status ─────────────────────────────────────────────────────────
export const checkProStatus = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch (e) {
    console.error('[purchaseService] checkProStatus error:', e);
    return false;
  }
};

// ─── Get Offerings ────────────────────────────────────────────────────────────
export const getOfferings = async () => {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch (e) {
    console.error('[purchaseService] getOfferings error:', e);
    return null;
  }
};

// ─── Purchase Monthly ─────────────────────────────────────────────────────────
export const purchaseMonthly = async () => {
  try {
    const offerings = await Purchases.getOfferings();
    const monthly = offerings.current?.monthly;
    if (!monthly) throw new Error('Monthly package not found');

    const { customerInfo } = await Purchases.purchasePackage(monthly);
    const isPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    return { success: isPro, customerInfo };
  } catch (e) {
    if (!e.userCancelled) {
      console.error('[purchaseService] purchaseMonthly error:', e);
    }
    return { success: false, userCancelled: e.userCancelled };
  }
};

// ─── Restore Purchases ────────────────────────────────────────────────────────
export const restorePurchases = async () => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    return { success: isPro };
  } catch (e) {
    console.error('[purchaseService] restorePurchases error:', e);
    return { success: false };
  }
};