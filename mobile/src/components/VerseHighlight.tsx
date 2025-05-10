import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../theme';

interface VerseHighlightProps {
  verses: {
    text: string;
    verseNumbers: number[];
    reason?: string;
  };
  fullText?: string;
}

export const VerseHighlight: React.FC<VerseHighlightProps> = ({ verses, fullText }) => {
  return (
    <View style={styles.container}>
      <View style={styles.versesContainer}>
        <Text style={styles.verseText}>{verses.text}</Text>
        <View style={styles.verseNumbersContainer}>
          {verses.verseNumbers.map((num) => (
            <Text key={num} style={styles.verseNumber}>v{num}</Text>
          ))}
        </View>
      </View>
      {verses.reason && (
        <Text style={styles.reasonText}>
          Why these verses? {verses.reason}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    marginVertical: theme.spacing.small,
  },
  versesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  verseText: {
    flex: 1,
    fontSize: theme.typography.sizes.medium,
    lineHeight: theme.typography.lineHeights.relaxed,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.regular,
  },
  verseNumbersContainer: {
    marginLeft: theme.spacing.small,
    alignItems: 'flex-end',
  },
  verseNumber: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.medium,
    marginBottom: theme.spacing.tiny,
  },
  reasonText: {
    marginTop: theme.spacing.medium,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textLight,
    fontFamily: theme.typography.fontFamily.italic,
    lineHeight: theme.typography.lineHeights.normal,
  },
});

export default VerseHighlight;
