import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases from 'react-native-purchases';
import { SubscriptionService } from '../services/SubscriptionService';

jest.mock('react-native-purchases');
jest.mock('@react-native-async-storage/async-storage');

describe('SubscriptionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentStudyCount', () => {
    it('returns 0 when no studies completed', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const count = await SubscriptionService.getCurrentStudyCount();
      expect(count).toBe(0);
    });

    it('returns stored count', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('2');
      const count = await SubscriptionService.getCurrentStudyCount();
      expect(count).toBe(2);
    });
  });

  describe('needsSubscription', () => {
    it('returns true when study count >= 3 and no active subscription', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('3');
      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue({
        activeSubscriptions: []
      });

      const needsSub = await SubscriptionService.needsSubscription();
      expect(needsSub).toBe(true);
    });

    it('returns false when study count < 3', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('2');
      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue({
        activeSubscriptions: []
      });

      const needsSub = await SubscriptionService.needsSubscription();
      expect(needsSub).toBe(false);
    });

    it('returns false when has active subscription', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('5');
      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue({
        activeSubscriptions: ['premium']
      });

      const needsSub = await SubscriptionService.needsSubscription();
      expect(needsSub).toBe(false);
    });
  });

  describe('purchasePackage', () => {
    it('returns successful true when purchase succeeds', async () => {
      const mockPackage = { identifier: 'test' };
      (Purchases.purchasePackage as jest.Mock).mockResolvedValue({
        customerInfo: { activeSubscriptions: ['premium'] }
      });

      const result = await SubscriptionService.purchasePackage(mockPackage);
      expect(result.successful).toBe(true);
    });

    it('returns successful false when purchase fails', async () => {
      const mockPackage = { identifier: 'test' };
      (Purchases.purchasePackage as jest.Mock).mockRejectedValue(new Error());
      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue({
        activeSubscriptions: []
      });

      const result = await SubscriptionService.purchasePackage(mockPackage);
      expect(result.successful).toBe(false);
    });
  });
});
