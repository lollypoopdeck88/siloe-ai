import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { API } from 'aws-amplify';
import theme from '../theme';
import { StudyPlan } from '../types';

interface PlanScreenProps {
  navigation: any;
}

interface PlanCategory {
  id: string;
  title: string;
  description: string;
  plans: StudyPlan[];
}

export const PlanScreen: React.FC<PlanScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<PlanCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await API.get('SiloeAPI', '/plans/categories', {});
      setCategories(response.categories);
      if (response.categories.length > 0) {
        setSelectedCategory(response.categories[0].id);
      }
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPlans();
    setRefreshing(false);
  };

  const renderPlanCard = ({ item }: { item: StudyPlan }) => {
    const progress = item.progress.chaptersRead.length / item.chapters.length;

    return (
      <TouchableOpacity
        style={styles.planCard}
        onPress={() => navigation.navigate('PlanDetail', { planId: item.id })}
      >
        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>{item.title}</Text>
          <Text style={styles.planDuration}>{item.duration} days</Text>
        </View>

        {item.description && (
          <Text style={styles.planDescription}>{item.description}</Text>
        )}

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(progress * 100)}% Complete
          </Text>
        </View>

        <View style={styles.planFooter}>
          <Text style={styles.chaptersCount}>
            {item.chapters.length} chapters
          </Text>
          <MaterialIcons
            name="chevron-right"
            size={24}
            color={theme.colors.text}
          />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item.id && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item.id && styles.categoryTextActive,
                ]}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Plans List */}
      <FlatList
        data={categories.find((c) => c.id === selectedCategory)?.plans || []}
        keyExtractor={(item) => item.id}
        renderItem={renderPlanCard}
        contentContainerStyle={styles.plansList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No study plans available</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    backgroundColor: theme.colors.card,
    ...theme.shadows.small,
  },
  categoriesList: {
    padding: theme.spacing.medium,
  },
  categoryButton: {
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.borderRadius.round,
    marginRight: theme.spacing.small,
    backgroundColor: theme.colors.background,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: theme.typography.sizes.regular,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text,
  },
  categoryTextActive: {
    color: theme.colors.background,
  },
  plansList: {
    padding: theme.spacing.medium,
  },
  planCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    ...theme.shadows.small,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  planTitle: {
    fontSize: theme.typography.sizes.medium,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text,
    flex: 1,
  },
  planDuration: {
    fontSize: theme.typography.sizes.small,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.primary,
  },
  planDescription: {
    fontSize: theme.typography.sizes.regular,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.medium,
  },
  progressContainer: {
    marginBottom: theme.spacing.medium,
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
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textLight,
  },
  planFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chaptersCount: {
    fontSize: theme.typography.sizes.small,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textLight,
  },
  emptyContainer: {
    padding: theme.spacing.xlarge,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.typography.sizes.medium,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});

export default PlanScreen;
