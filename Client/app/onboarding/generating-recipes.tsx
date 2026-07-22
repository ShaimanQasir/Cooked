import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface PipelineTask {
  id: string;
  label: string;
}

const PIPELINE_TASKS: PipelineTask[] = [
  { id: 'analyzing', label: 'Analyzing your ingredients' },
  { id: 'matching', label: 'Matching recipe database' },
  { id: 'generating', label: 'Generating recipe suggestions' },
  { id: 'optimizing', label: 'Optimizing cooking steps' },
  { id: 'finding', label: 'Finding the best recipes for you' }
];

export default function GeneratingRecipesScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        return next >= 100 ? 100 : next;
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(() => {
        router.replace('/(tabs)');
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [progress]);

  // Update checkmarks based on progress threshold
  useEffect(() => {
    const activeIds: string[] = [];
    if (progress >= 15) activeIds.push('analyzing');
    if (progress >= 35) activeIds.push('matching');
    if (progress >= 55) activeIds.push('generating');
    if (progress >= 75) activeIds.push('optimizing');
    if (progress >= 92) activeIds.push('finding');
    setCompletedTaskIds(activeIds);
  }, [progress]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        
        {/* Progress Text */}
        <Text style={styles.largePercentage}>{progress}%</Text>

        {/* Title */}
        <View style={styles.titleRow}>
          <Text style={styles.titleText}>Creating recipes from your ingredients</Text>
          <Ionicons name="search-outline" size={24} color={Colors.text} style={styles.searchIcon} />
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitleText}>
          Analyzing ingredients and generating personalized recipes...
        </Text>

        {/* Custom Progress Bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>

        {/* Recommendations list items */}
        <View style={styles.tasksList}>
          <Text style={styles.listHeader}>Today’s food recommendations</Text>
          
          {PIPELINE_TASKS.map((task) => {
            const isDone = completedTaskIds.includes(task.id);
            return (
              <View key={task.id} style={styles.taskRow}>
                <Text style={[styles.taskLabel, isDone ? styles.taskLabelDone : null]}>
                  {task.label}
                </Text>
                <View style={[styles.checkCircle, isDone ? styles.checkCircleActive : null]}>
                  {isDone && (
                    <Ionicons name="checkmark" size={14} color={Colors.white} />
                  )}
                </View>
              </View>
            );
          })}
        </View>

      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 28,
  },
  largePercentage: {
    fontSize: 56,
    fontWeight: '900',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 28,
  },
  searchIcon: {
    marginLeft: 8,
  },
  subtitleText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 18,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 40,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF9900', // Yellow-orange progress loader
    borderRadius: 4,
  },
  tasksList: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 20,
    ...Colors.shadowSubtle,
  },
  listHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.cardAlt,
    paddingBottom: 10,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  taskLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textLight,
  },
  taskLabelDone: {
    color: Colors.text,
    fontWeight: '600',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
});
