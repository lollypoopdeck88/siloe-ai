import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const theme = {
  colors: {
    // Primary colors inspired by the Pool of Siloam
    primary: '#2B7C85', // Healing waters blue
    secondary: '#E5F2F3', // Soft water ripple
    background: '#FFFFFF', // Clean white
    text: '#2C3E50', // Deep readable text
    textLight: '#7F8C8D', // Subtle text
    accent: '#34495E', // Deep accent for emphasis
    success: '#27AE60',
    error: '#E74C3C',
    warning: '#F1C40F',

    // Additional semantic colors
    ripple: 'rgba(43, 124, 133, 0.1)', // Touch feedback
    separator: '#ECF0F1',
    card: '#FFFFFF',
    shadow: 'rgba(44, 62, 80, 0.1)',
  },

  typography: {
    // Font families
    fontFamily: {
      regular: 'Noto Serif',
      medium: 'Noto Serif Medium',
      bold: 'Noto Serif Bold',
      italic: 'Noto Serif Italic',
    },

    // Font sizes
    sizes: {
      tiny: 12,
      small: 14,
      regular: 16,
      medium: 18,
      large: 20,
      xlarge: 24,
      xxlarge: 32,
    },

    // Line heights
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8,
    },
  },

  spacing: {
    tiny: 4,
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
    xxlarge: 48,
  },

  layout: {
    width,
    height,
    screenPadding: 16,
    maxContentWidth: 800,
  },

  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    round: 9999,
  },

  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
  },

  animations: {
    timing: {
      quick: 150,
      normal: 300,
      slow: 450,
    },
  },

  // Component-specific styles
  components: {
    scripture: {
      fontSize: 18,
      lineHeight: 1.8,
      letterSpacing: 0.3,
      paragraphSpacing: 24,
    },

    verseNumber: {
      fontSize: 12,
      color: '#2B7C85',
      marginRight: 4,
    },

    chapterTitle: {
      fontSize: 24,
      fontFamily: 'Noto Serif Bold',
      marginBottom: 16,
      color: '#2C3E50',
    },

    soapSection: {
      marginVertical: 16,
      padding: 16,
      borderRadius: 8,
      backgroundColor: '#FFFFFF',
    },

    progressBar: {
      height: 4,
      borderRadius: 2,
      backgroundColor: '#ECF0F1',
      fillColor: '#2B7C85',
    },

    button: {
      primary: {
        backgroundColor: '#2B7C85',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
      },
      secondary: {
        backgroundColor: '#E5F2F3',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
      },
    },

    input: {
      backgroundColor: '#F8FAFC',
      borderWidth: 1,
      borderColor: '#ECF0F1',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
    },
  },
};

// Helper functions
export const getResponsiveSize = (size: number): number => {
  const standardScreenWidth = 375;
  return (width / standardScreenWidth) * size;
};

export const getStyleByVariant = (
  baseStyle: object,
  variant: 'primary' | 'secondary' | 'success' | 'error' | 'warning'
): object => {
  const variantColors = {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    success: theme.colors.success,
    error: theme.colors.error,
    warning: theme.colors.warning,
  };

  return {
    ...baseStyle,
    backgroundColor: variantColors[variant],
  };
};

export default theme;
