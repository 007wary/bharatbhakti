import {
  InterstitialAd,
  AdEventType,
  TestIds,
  BannerAdSize,
} from 'react-native-google-mobile-ads';

// ─── Ad Unit IDs ──────────────────────────────────────────────────────────────
// Replace with real IDs when AdMob account is approved
const AD_UNITS = {
  BANNER: __DEV__
    ? TestIds.BANNER
    : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // TODO: replace with real banner ID
  INTERSTITIAL: __DEV__
    ? TestIds.INTERSTITIAL
    : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // TODO: replace with real interstitial ID
};

export { AD_UNITS, BannerAdSize };

// ─── Interstitial ─────────────────────────────────────────────────────────────
let interstitial = null;
let isInterstitialLoaded = false;
let sessionInterstitialShown = false;

export const loadInterstitial = () => {
  try {
    interstitial = InterstitialAd.createForAdRequest(AD_UNITS.INTERSTITIAL, {
      requestNonPersonalizedAdsOnly: true,
    });

    interstitial.addAdEventListener(AdEventType.LOADED, () => {
      isInterstitialLoaded = true;
    });

    interstitial.addAdEventListener(AdEventType.ERROR, (e) => {
      console.log('[adService] Interstitial load error:', e);
      isInterstitialLoaded = false;
    });

    interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      isInterstitialLoaded = false;
      sessionInterstitialShown = true;
      // Preload next one
      loadInterstitial();
    });

    interstitial.load();
  } catch (e) {
    console.error('[adService] loadInterstitial error:', e);
  }
};

export const showInterstitial = async (isPro) => {
  try {
    // Never show ads to Pro users or if already shown this session
    if (isPro || sessionInterstitialShown) return false;
    if (!isInterstitialLoaded || !interstitial) return false;

    await interstitial.show();
    return true;
  } catch (e) {
    console.error('[adService] showInterstitial error:', e);
    return false;
  }
};