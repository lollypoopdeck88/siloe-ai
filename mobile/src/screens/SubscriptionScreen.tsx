import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { PurchasesPackage } from 'react-native-purchases';
import { SubscriptionService } from '../services/SubscriptionService';
import { useNavigation } from '@react-navigation/native';

export const SubscriptionScreen: React.FC = () => {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      const offerings = await SubscriptionService.getOfferings();
      setPackages(offerings);
    } catch (error) {
      Alert.alert('Error', 'Failed to load subscription options');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pack: PurchasesPackage) => {
    setPurchasing(true);
    try {
      const { successful } = await SubscriptionService.purchasePackage(pack);
      if (successful) {
        Alert.alert('Success', 'Thank you for subscribing!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const restored = await SubscriptionService.restorePurchases();
      if (restored) {
        Alert.alert('Success', 'Purchases restored!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('No Purchases', 'No previous purchases found.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to restore purchases');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Unlock Unlimited Bible Studies</Text>
      <Text style={styles.description}>
        Continue your spiritual journey with unlimited AI-powered Bible studies
      </Text>

      <View style={styles.featuresContainer}>
        <Text style={styles.featureText}>✓ Unlimited AI-powered studies</Text>
        <Text style={styles.featureText}>✓ Advanced study insights</Text>
        <Text style={styles.featureText}>✓ Personal study journal</Text>
        <Text style={styles.featureText}>✓ Progress tracking</Text>
      </View>

      {packages.map((pack) => (
        <TouchableOpacity
          key={pack.identifier}
          style={styles.packageButton}
          onPress={() => handlePurchase(pack)}
          disabled={purchasing}
        >
          <Text style={styles.packageTitle}>{pack.product.title}</Text>
          <Text style={styles.packagePrice}>{pack.product.priceString}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.restoreButton}
        onPress={handleRestore}
        disabled={loading}
      >
        <Text style={styles.restoreText}>Restore Purchases</Text>
      </TouchableOpacity>

      <Text style={styles.terms}>
        Payment will be charged to your {Platform.OS === 'ios' ? 'iTunes' : 'Google Play'} account at confirmation of purchase. Subscription automatically renews unless auto-renew is turned off at least 24-hours before the end of the current period.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  featuresContainer: {
    alignSelf: 'stretch',
    marginBottom: 30,
  },
  featureText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  packageButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginBottom: 10,
    alignItems: 'center',
  },
  packageTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  packagePrice: {
    color: '#fff',
    fontSize: 16,
  },
  restoreButton: {
    padding: 15,
    marginTop: 10,
  },
  restoreText: {
    color: '#007AFF',
    fontSize: 16,
  },
  terms: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
});

export default SubscriptionScreen;
