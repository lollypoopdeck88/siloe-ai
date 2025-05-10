import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Amplify } from 'aws-amplify';
import App from '../App';

// Mock Amplify configuration
jest.mock('aws-amplify');

describe('App', () => {
  beforeEach(() => {
    // Reset Amplify mocks
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <NavigationContainer>
        <App />
      </NavigationContainer>
    );
  });

  // Add more app-level tests
});
