import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SubscriptionService } from '../services/SubscriptionService';

export const StudyScreen: React.FC = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const needsSubscription = await SubscriptionService.needsSubscription();

      if (needsSubscription) {
        Alert.alert(
          'Subscription Required',
          'You\'ve completed your 3 free Bible studies. Subscribe to continue your spiritual journey.',
          [
            {
              text: 'Subscribe',
              onPress: () => navigation.navigate('Subscription')
            },
            {
              text: 'Maybe Later',
              onPress: () => navigation.goBack(),
              style: 'cancel'
            }
          ]
        );
        return;
      }

      // Increment study count if user has access
      await SubscriptionService.incrementStudyCount();
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking subscription:', error);
      Alert.alert('Error', 'Failed to check subscription status');
      navigation.goBack();
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View>
      {/* Your existing study screen content */}
    </View>
  );
};
