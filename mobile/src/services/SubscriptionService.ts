import Purchases, { PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REVENUECAT_API_KEY = {
  ios: 'YOUR_IOS_KEY',
  android: 'YOUR_ANDROID_KEY'
};

const FREE_STUDY_LIMIT = 3;
const STORAGE_KEY = '@study_count';

export class SubscriptionService {
  static async initialize(): Promise<void> {
    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

    const apiKey = Platform.select({
      ios: REVENUECAT_API_KEY.ios,
      android: REVENUECAT_API_KEY.android,
      default: REVENUECAT_API_KEY.ios,
    });

    await Purchases.configure({ apiKey });
  }

  static async getCurrentStudyCount(): Promise<number> {
    try {
      const count = await AsyncStorage.getItem(STORAGE_KEY);
      return count ? parseInt(count, 10) : 0;
    } catch {
      return 0;
    }
  }

  static async incrementStudyCount(): Promise<number> {
    try {
      const currentCount = await this.getCurrentStudyCount();
      const newCount = currentCount + 1;
      await AsyncStorage.setItem(STORAGE_KEY, newCount.toString());
      return newCount;
    } catch (error) {
      console.error('Error incrementing study count:', error);
      throw error;
    }
  }

  static async needsSubscription(): Promise<boolean> {
    try {
      const [studyCount, customerInfo] = await Promise.all([
        this.getCurrentStudyCount(),
        Purchases.getCustomerInfo()
      ]);

      return studyCount >= FREE_STUDY_LIMIT && !customerInfo.activeSubscriptions.length;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  static async getOfferings(): Promise<PurchasesPackage[]> {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current?.availablePackages || [];
    } catch (error) {
      console.error('Error getting offerings:', error);
      return [];
    }
  }

  static async purchasePackage(
    pack: PurchasesPackage
  ): Promise<{ customerInfo: CustomerInfo; successful: boolean }> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pack);
      return {
        customerInfo,
        successful: customerInfo.activeSubscriptions.length > 0
      };
    } catch (error) {
      console.error('Error purchasing package:', error);
      return {
        customerInfo: await Purchases.getCustomerInfo(),
        successful: false
      };
    }
  }

  static async restorePurchases(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo.activeSubscriptions.length > 0;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return false;
    }
  }

  static async isSubscribed(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo.activeSubscriptions.length > 0;
    } catch {
      return false;
    }
  }
}
