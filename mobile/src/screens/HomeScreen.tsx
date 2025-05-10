import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { API, Auth } from 'aws-amplify';
import theme from '../theme';
import { SOAPStudy, StudyPlan } from '../types';
import { formatTimeRemaining } from '../utils/timeUtils';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dailyVerse, setDailyVerse] = useState<{
    text: string;
    reference: string;
  } | null>(null);
  const [currentPlan, setCurrentPlan] = useState<StudyPlan | null>(null);
  const [recentStudies, setRecentStudies] = useState<SOAPStudy[]>([]);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadData();
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      setUserName(user.attributes.given_name || user.username);
    } catch (err) {
      console.error('Failed to load user info:', err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [verseData, planData, studiesData] = await Promise.all([
        API.get('SiloeAPI', '/daily-verse', {}),
        API.get('SiloeAPI', '/plans/current', {}),
        API.get('SiloeAPI', '/studies/recent', {}),
      ]);

      setDailyVerse(verseData.verse);
      setCurrentPlan(planData.plan);
      setRecentStudies(studiesData.studies);
    } catch (err) {
      console.error('Failed to load home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good {getTimeOfDay()},</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <MaterialIcons
              name="settings"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Daily Verse */}
        {dailyVerse && (
          <View style={styles.verseCard}>
            <Text style={styles.verseLabel}>Daily Verse</Text>
            <Text style={styles.verseText}>{dailyVerse.text}</Text>
            <Text style={styles.verseReference}>{dailyVerse.reference}</Text>
          </View>
        )}

        {/* Current Plan */}
        {currentPlan && (
          <TouchableOpacity
            style={styles.planCard}
            onPress={() => navigation.navigate('Plan', {
              screen: 'PlanDetail',
              params: { planId: currentPlan.id }
            })}
          >
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>{currentPlan.title}</Text>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={theme.colors.text}
              />
            </View>
            <View style={styles.planProgress}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(currentPlan.progress.chaptersRead.length /
                        currentPlan.chapters.length) *
                        100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {currentPlan.progress.chaptersRead.length}/
                {currentPlan.chapters.length} chapters
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Study', {
              screen: 'Study',
              params: { mode: 'recommended' }
            })}
          >
            <MaterialIcons
              name="auto-stories"
              size={32}
              color={theme.colors.primary}
            />
            <Text style={styles.actionText}>Start Reading</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Plan', {
              screen: 'PlanMain'
            })}
          >
            <MaterialIcons
              name="calendar-today"
              size={32}
              color={theme.colors.primary}
            />
            <Text style={styles.actionText}>Study Plans</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Journal', {
              screen: 'JournalMain'
            })}
          >
            <MaterialIcons
              name="edit-note"
              size={32}
              color={theme.colors.primary}
            />
            <Text style={styles.actionText}>Journal</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Studies */}
        {recentStudies.length > 0 && (
          <View style={styles.recentContainer}>
            <Text style={styles.sectionTitle}>Recent Studies</Text>
            {recentStudies.map((study) => (
              <TouchableOpacity
                key={study.id}
                style={styles.recentStudy}
                onPress={() => navigation.navigate('Study', {
                  screen: 'Study',
                  params: { studyId: study.id }
                })}
              >
                <View style={styles.studyInfo}>
                  <Text style={styles.studyReference}>{study.reference}</Text>
                  <Text style={styles.studyDate}>
                    {new Date(study.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.medium,
  },
  greeting: {
    fontSize: theme.typography.sizes.regular,
    color: theme.colors.textLight,
    fontFamily: theme.typography.fontFamily.regular,
  },
  userName: {
    fontSize: theme.typography.sizes.xlarge,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.bold,
  },
  settingsButton: {
    padding: theme.spacing.small,
  },
  verseCard: {
    margin: theme.spacing.medium,
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    ...theme.shadows.medium,
  },
  verseLabel: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.background,
    fontFamily: theme.typography.fontFamily.medium,
    opacity: 0.8,
    marginBottom: theme.spacing.small,
  },
  verseText: {
    fontSize: theme.typography.sizes.medium,
    color: theme.colors.background,
    fontFamily: theme.typography.fontFamily.regular,
    lineHeight: theme.typography.lineHeights.relaxed,
    marginBottom: theme.spacing.small,
  },
  verseReference: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.background,
    fontFamily: theme.typography.fontFamily.medium,
    opacity: 0.8,
  },
  planCard: {
    margin: theme.spacing.medium,
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.medium,
    ...theme.shadows.small,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  planTitle: {
    fontSize: theme.typography.sizes.medium,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.medium,
  },
  planProgress: {
    marginTop: theme.spacing.small,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.separator,
    borderRadius: 2,
    marginBottom: theme.spacing.tiny,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textLight,
    fontFamily: theme.typography.fontFamily.regular,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
  },
  actionButton: {
    alignItems: 'center',
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.medium,
    ...theme.shadows.small,
    minWidth: 100,
  },
  actionText: {
    marginTop: theme.spacing.small,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.medium,
    textAlign: 'center',
  },
  recentContainer: {
    padding: theme.spacing.medium,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.large,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.bold,
    marginBottom: theme.spacing.medium,
  },
  recentStudy: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.small,
    ...theme.shadows.small,
  },
  studyInfo: {
    flex: 1,
  },
  studyReference: {
    fontSize: theme.typography.sizes.medium,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.medium,
    marginBottom: theme.spacing.tiny,
  },
  studyDate: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textLight,
    fontFamily: theme.typography.fontFamily.regular,
  },
});

export default HomeScreen;
