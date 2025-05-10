# Siloe Bible Study App

A modern, AI-powered Bible study companion inspired by the Pool of Siloam. Features SOAP study methodology, audio playback, and an AI mentor.

## Quick Start

1. **Setup Development Environment**

```bash
# Install dependencies
npm install -g aws-cdk expo-cli eas-cli

# Clone repository
git clone <your-repo-url>
cd bible-study-ai

# Install project dependencies
cd mobile && npm install
cd ../infrastructure && npm install
```

2. **Configure AWS**

```bash
# Configure AWS credentials
aws configure

# Deploy infrastructure
cd infrastructure
cdk deploy

# Note the outputs for:
# - API URL
# - User Pool ID
# - User Pool Client ID
# - Storage Bucket
```

3. **Configure Environment Variables**

Create a `.env` file in the `mobile` directory:

```env
AWS_REGION=us-east-1
API_URL=<from cdk output>
USER_POOL_ID=<from cdk output>
USER_POOL_CLIENT_ID=<from cdk output>
STORAGE_BUCKET=<from cdk output>
```

4. **Run the App**

```bash
cd mobile
npm start
```

## Features

- 📖 SOAP Bible Study methodology
- 🎧 Audio Bible playback
- 🤖 AI-powered study insights
- 📝 Personal study journal
- 📊 Progress tracking
- 📱 Offline support
- 🎨 Clean, minimalist design

## Development Workflow

1. **Running Tests**
```bash
npm test
npm run test:watch
npm run test:coverage
```

2. **Type Checking**
```bash
npm run type-check
```

3. **Linting**
```bash
npm run lint
```

4. **Building for Production**
```bash
# iOS
npm run build:ios

# Android
npm run build:android
```

5. **Submitting to App Stores**
```bash
# iOS
npm run submit:ios

# Android
npm run submit:android
```

## Project Structure

```
bible-study-ai/
├── mobile/               # React Native app
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── screens/    # Screen components
│   │   ├── navigation/ # Navigation setup
│   │   ├── theme/      # Theme configuration
│   │   ├── utils/      # Utility functions
│   │   └── types/      # TypeScript types
│   └── assets/         # Images, fonts, etc.
├── infrastructure/      # AWS CDK infrastructure
│   └── lib/           # Stack definitions
└── docs/              # Documentation
```

## Infrastructure

- **Authentication**: Amazon Cognito
- **API**: API Gateway + Lambda
- **Database**: DynamoDB
- **AI**: Amazon Bedrock
- **Storage**: S3
- **CDN**: CloudFront
- **Search**: OpenSearch

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Environment Setup

### Required Software

- Node.js 18+
- npm 8+
- AWS CLI
- Expo CLI
- EAS CLI
- Xcode (for iOS development)
- Android Studio (for Android development)

### Required Accounts

- AWS Account
- Apple Developer Account
- Google Play Developer Account
- Expo Account

## Deployment Checklist

- [ ] Configure AWS services
- [ ] Set up environment variables
- [ ] Create app store listings
- [ ] Prepare privacy policy
- [ ] Configure analytics
- [ ] Set up error monitoring
- [ ] Test all features
- [ ] Submit to app stores

## Support

For support, please:
1. Check the documentation
2. Open an issue
3. Contact the development team

## License

This project is licensed under the MIT License - see the LICENSE file for details
