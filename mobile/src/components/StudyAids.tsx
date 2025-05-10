import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '../theme';

interface StudyAidsProps {
  reference?: string;
  crossReferences?: Array<{
    reference: string;
    text: string;
    relevance: string;
  }>;
  culturalNotes?: Array<{
    term: string;
    explanation: string;
  }>;
  originalLanguage?: Array<{
    word: string;
    meaning: string;
    usage: string;
  }>;
}

export const StudyAids: React.FC<StudyAidsProps> = ({
  reference,
  crossReferences = [],
  culturalNotes = [],
  originalLanguage = [],
}) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [animation] = useState(new Animated.Value(0));

  const toggleSection = (section: string) => {
    if (activeSection === section) {
      // Close section
      Animated.timing(animation, {
        toValue: 0,
        duration: theme.animations.timing.normal,
        useNativeDriver: false,
      }).start(() => setActiveSection(null));
    } else {
      // Open section
      setActiveSection(section);
      Animated.timing(animation, {
        toValue: 1,
        duration: theme.animations.timing.normal,
        useNativeDriver: false,
      }).start();
    }
  };

  const renderCrossReferences = () => (
    <View style={styles.sectionContent}>
      {crossReferences.map((ref, index) => (
        <View key={index} style={styles.referenceItem}>
          <Text style={styles.referenceText}>{ref.reference}</Text>
          <Text style={styles.verseText}>{ref.text}</Text>
          <Text style={styles.relevanceText}>{ref.relevance}</Text>
        </View>
      ))}
    </View>
  );

  const renderCulturalNotes = () => (
    <View style={styles.sectionContent}>
      {culturalNotes.map((note, index) => (
        <View key={index} style={styles.noteItem}>
          <Text style={styles.termText}>{note.term}</Text>
          <Text style={styles.explanationText}>{note.explanation}</Text>
        </View>
      ))}
    </View>
  );

  const renderOriginalLanguage = () => (
    <View style={styles.sectionContent}>
      {originalLanguage.map((word, index) => (
        <View key={index} style={styles.wordItem}>
          <Text style={styles.originalWord}>{word.word}</Text>
          <Text style={styles.meaningText}>{word.meaning}</Text>
          <Text style={styles.usageText}>{word.usage}</Text>
        </View>
      ))}
    </View>
  );

  const sections = [
    {
      title: 'Cross References',
      icon: 'compare-arrows',
      content: renderCrossReferences,
      data: crossReferences,
    },
    {
      title: 'Cultural Context',
      icon: 'history-edu',
      content: renderCulturalNotes,
      data: culturalNotes,
    },
    {
      title: 'Original Language',
      icon: 'translate',
      content: renderOriginalLanguage,
      data: originalLanguage,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Study Aids</Text>
      {sections.map((section) => (
        section.data.length > 0 && (
          <View key={section.title} style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection(section.title)}
            >
              <View style={styles.headerContent}>
                <MaterialIcons
                  name={section.icon as any}
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <MaterialIcons
                name={activeSection === section.title ? 'expand-less' : 'expand-more'}
                size={24}
                color={theme.colors.text}
              />
            </TouchableOpacity>
            {activeSection === section.title && (
              <Animated.View
                style={[
                  styles.sectionContentContainer,
                  {
                    maxHeight: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1000],
                    }),
                  },
                ]}
              >
                {section.content()}
              </Animated.View>
            )}
          </View>
        )
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.large,
    paddingHorizontal: theme.spacing.medium,
  },
  title: {
    fontSize: theme.typography.sizes.large,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
  },
  section: {
    marginBottom: theme.spacing.medium,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.medium,
    ...theme.shadows.small,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.medium,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.medium,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text,
    marginLeft: theme.spacing.small,
  },
  sectionContentContainer: {
    overflow: 'hidden',
  },
  sectionContent: {
    padding: theme.spacing.medium,
    borderTopWidth: 1,
    borderTopColor: theme.colors.separator,
  },
  referenceItem: {
    marginBottom: theme.spacing.medium,
  },
  referenceText: {
    fontSize: theme.typography.sizes.medium,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.primary,
    marginBottom: theme.spacing.tiny,
  },
  verseText: {
    fontSize: theme.typography.sizes.regular,
    color: theme.colors.text,
    marginBottom: theme.spacing.tiny,
    lineHeight: theme.typography.lineHeights.relaxed,
  },
  relevanceText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textLight,
    fontFamily: theme.typography.fontFamily.italic,
  },
  noteItem: {
    marginBottom: theme.spacing.medium,
  },
  termText: {
    fontSize: theme.typography.sizes.medium,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.tiny,
  },
  explanationText: {
    fontSize: theme.typography.sizes.regular,
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeights.relaxed,
  },
  wordItem: {
    marginBottom: theme.spacing.medium,
  },
  originalWord: {
    fontSize: theme.typography.sizes.medium,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.tiny,
  },
  meaningText: {
    fontSize: theme.typography.sizes.regular,
    color: theme.colors.text,
    marginBottom: theme.spacing.tiny,
  },
  usageText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textLight,
    fontFamily: theme.typography.fontFamily.italic,
    lineHeight: theme.typography.lineHeights.normal,
  },
});

export default StudyAids;
