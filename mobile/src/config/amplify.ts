import { Amplify } from 'aws-amplify';

const configureAmplify = () => {
  Amplify.configure({
    Auth: {
      mandatorySignIn: true,
      region: process.env.AWS_REGION,
      userPoolId: process.env.USER_POOL_ID,
      userPoolWebClientId: process.env.USER_POOL_CLIENT_ID,
    },
    API: {
      endpoints: [
        {
          name: 'SiloeAPI',
          endpoint: process.env.API_URL,
          region: process.env.AWS_REGION,
        },
      ],
    },
    Storage: {
      AWSS3: {
        bucket: process.env.STORAGE_BUCKET,
        region: process.env.AWS_REGION,
      },
    },
  });
};

export default configureAmplify;
