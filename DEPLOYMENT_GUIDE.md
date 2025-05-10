# Deployment Guide: Local to App Store Revenue

## Prerequisites

1. **Accounts Required**
- Apple Developer Account ($99/year) - https://developer.apple.com/programs/enroll/
- Google Play Developer Account ($25 one-time) - https://play.google.com/console/signup
- RevenueCat Account (Free to start) - https://www.revenuecat.com/
- AWS Account - https://aws.amazon.com/
- Expo Account (Free) - https://expo.dev/signup

2. **Local Development Setup**
```bash
# Install required tools
npm install -g expo-cli eas-cli aws-cdk

# Install Xcode (Mac only, required for iOS)
# Download from Mac App Store

# Install Android Studio (required for Android)
# Download from https://developer.android.com/studio
```

## Step-by-Step Deployment Guide

### 1. Backend Deployment

```bash
# Deploy AWS infrastructure
cd bible-study-ai/infrastructure
npm install
cdk deploy

# Save the output values for:
- API URL
- User Pool ID
- User Pool Client ID
- Storage Bucket
```

### 2. RevenueCat Setup

1. Create app in RevenueCat dashboard
2. Configure products:
```
Product ID: com.yourdomain.siloe.unlimited
Price: $4.99
Type: Auto-renewable subscription
Duration: Monthly
```

3. Get API keys and update `mobile/src/services/SubscriptionService.ts`:
```typescript
const REVENUECAT_API_KEY = {
  ios: 'YOUR_IOS_KEY',
  android: 'YOUR_ANDROID_KEY'
};
```

### 3. Mobile App Configuration

1. Update environment configuration:
```bash
# Create .env file in mobile directory
cd mobile
cat > .env << EOL
API_URL=<from cdk output>
USER_POOL_ID=<from cdk output>
USER_POOL_CLIENT_ID=<from cdk output>
STORAGE_BUCKET=<from cdk output>
EOL
```

2. Update app configuration in `app.json`:
```json
{
  "expo": {
    "name": "Siloe",
    "slug": "siloe-bible-study",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourdomain.siloe"
    },
    "android": {
      "package": "com.yourdomain.siloe"
    }
  }
}
```

### 4. App Store Preparation

1. **iOS App Store**
```bash
# Create app in App Store Connect
open https://appstoreconnect.apple.com
- Create New App
- Bundle ID: com.yourdomain.siloe
- Name: Siloe
- Primary Language: English
- Price: Free (with in-app purchases)

# Configure in-app purchase
- Type: Auto-Renewable Subscription
- Reference Name: Unlimited Bible Studies
- Product ID: com.yourdomain.siloe.unlimited
- Price: $4.99
```

2. **Google Play Store**
```bash
# Create app in Play Console
open https://play.google.com/console
- Create New App
- Name: Siloe
- Default language: English
- Free or paid: Free

# Configure in-app product
- Type: Subscription
- Product ID: com.yourdomain.siloe.unlimited
- Name: Unlimited Bible Studies
- Price: $4.99
```

### 5. Build and Submit

1. **Configure EAS Build**
```bash
# Login to Expo
eas login

# Configure EAS
eas build:configure

# Create development build for testing
eas build --profile development --platform ios
eas build --profile development --platform android

# Test thoroughly on both platforms
```

2. **Prepare Store Assets**
```bash
# Required assets in mobile/assets:
- App Icon (1024x1024)
- Screenshots for different devices
- Feature graphic (Android)
- App preview video (optional)
```

3. **Submit for Review**
```bash
# Create production builds
eas build --profile production --platform ios
eas build --profile production --platform android

# Submit to stores
eas submit -p ios
eas submit -p android
```

### 6. Post-Submission Checklist

1. **App Store Review Guidelines**
- Privacy Policy URL (required)
- Support URL (required)
- Marketing URL (optional)
- Terms of Service URL (required for subscriptions)

2. **Play Store Requirements**
- Privacy Policy URL
- Content rating questionnaire
- Data safety form
- Store listing questionnaire

### 7. Launch Preparation

1. **Testing**
```bash
# Final testing checklist
- Subscription flow
- Deep linking
- Push notifications
- Offline functionality
- Error handling
```

2. **Analytics Setup**
```bash
# RevenueCat dashboard
- Set up subscription tracking
- Configure customer analytics

# Optional: Set up additional analytics
- Firebase Analytics
- Mixpanel
- AppsFlyer
```

### 8. Post-Launch

1. **Monitor Performance**
```bash
# Daily checks
- RevenueCat dashboard for subscription metrics
- App Store Connect for iOS metrics
- Google Play Console for Android metrics
- AWS CloudWatch for backend metrics
```

2. **Support Setup**
```bash
# Prepare support channels
- Email support
- App store reviews responses
- Social media monitoring
```

## Quick Commands Reference

```bash
# Development
npm start                    # Start development server
npm test                    # Run tests
npm run lint                # Run linter

# Building
eas build -p ios           # Build for iOS
eas build -p android       # Build for Android

# Submitting
eas submit -p ios          # Submit to App Store
eas submit -p android      # Submit to Play Store

# Updating
eas update                 # Push updates to production
```

## Common Issues and Solutions

1. **App Store Rejection**
- Ensure subscription terms are clearly displayed
- Include privacy policy and terms of service
- Test restore purchases functionality
- Verify all URLs are working

2. **RevenueCat Integration**
- Verify API keys are correct
- Test sandbox purchases
- Implement restore purchases
- Handle offline scenarios

3. **Backend Issues**
- Check AWS CloudWatch logs
- Verify API endpoints
- Monitor error rates
- Check authentication flow

## Revenue Monitoring

1. **RevenueCat Dashboard**
- Active subscriptions
- Revenue metrics
- Churn rate
- Customer lifetime value

2. **App Store Connect**
- Proceeds
- Subscription retention
- App analytics

3. **Google Play Console**
- Revenue reports
- Subscription statistics
- User acquisition data

## Support Resources

- RevenueCat Documentation: https://docs.revenuecat.com/
- Expo Documentation: https://docs.expo.dev/
- AWS Documentation: https://docs.aws.amazon.com/
- Apple App Store Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Google Play Guidelines: https://play.google.com/console/about/guidelines/

## Next Steps After Launch

1. **Marketing**
- App Store Optimization (ASO)
- Social media presence
- Content marketing
- Paid advertising

2. **Monitoring**
- User feedback
- App performance
- Revenue metrics
- Customer support

3. **Updates**
- Feature requests
- Bug fixes
- Performance improvements
- Content updates

Need help with any specific step? Let me know!
