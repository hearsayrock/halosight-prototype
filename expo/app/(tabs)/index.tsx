import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, Animated, StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../components/ui/Icon';
import { mockTasks, mockActivities, HomeTask } from '../../lib/mock-data/home';
import { useActionItems } from '../../lib/context/ActionItemsContext';
import { formatActivityDate, formatDuration } from '../../lib/utils';
import { colors, radius, space } from '../../lib/tokens';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatTaskDue(dueDate: Date | null): string {
  if (!dueDate) return 'Due Today';
  return dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function CheckCircle({ checked, onCheck }: { checked: boolean; onCheck: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  function press() {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    onCheck();
  }

  return (
    <Pressable onPress={press} hitSlop={8}>
      <Animated.View style={[styles.circleOuter, { transform: [{ scale }] }]}>
        {checked ? (
          <View style={styles.circleFilled}>
            <Icon name="check" size={12} color="#fff" />
          </View>
        ) : (
          <View style={styles.circleEmpty} />
        )}
      </Animated.View>
    </Pressable>
  );
}

function TaskRow({ task, isPending, onCheck }: { task: HomeTask; isPending: boolean; onCheck: () => void }) {
  const isToday = task.dueDate === null;
  return (
    <View style={styles.taskRow}>
      <View style={styles.taskCircleWrap}>
        <CheckCircle checked={isPending} onCheck={onCheck} />
      </View>
      <Pressable
        style={({ pressed }) => [styles.taskContent, pressed && { opacity: 0.7 }]}
        onPress={() => router.push(`/accounts/${task.accountId}/action-items/${task.itemId}` as any)}
      >
        <View style={styles.taskMain}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <View style={styles.taskMeta}>
            <Icon name="calendar_today" size={12} color={colors.brandPurpleDark} />
            <Text style={[styles.taskDue, isToday && { color: colors.brandCoral }]}>
              {formatTaskDue(task.dueDate)}
            </Text>
            <Text style={styles.taskAccount}>{task.accountName}</Text>
          </View>
        </View>
        <Icon name="chevron_right" size={18} color={colors.textDisabled} />
      </Pressable>
    </View>
  );
}

function ActivityCard({ activity }: { activity: typeof mockActivities[0] }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.activityCard, pressed && { opacity: 0.7 }]}
      onPress={() => router.push(`/accounts/${activity.accountId}/activity/${activity.activityId}` as any)}
    >
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{activity.title}</Text>
        <Text style={styles.activityDesc} numberOfLines={2}>{activity.description}</Text>
        <View style={styles.activityMeta}>
          <Text style={styles.activityAccount}>{activity.accountName}</Text>
          <Text style={styles.activityDot}>  </Text>
          <Text style={styles.activityDate}>{formatActivityDate(activity.date)}</Text>
          <Text style={styles.activityDot}> • </Text>
          <Text style={styles.activityDuration}>{formatDuration(activity.durationMinutes)}</Text>
        </View>
      </View>
      <Icon name="chevron_right" size={18} color={colors.textDisabled} />
    </Pressable>
  );
}

export default function HomeScreen() {
  const { getItems, updateItem } = useActionItems();
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const availableTasks = mockTasks.filter((t) => !completedTaskIds.includes(t.id));
  const visibleTasks = availableTasks.slice(0, 3);

  const commitCompletion = useCallback((task: HomeTask) => {
    const item = getItems(task.accountId).find((i) => i.id === task.itemId);
    if (item) updateItem(task.accountId, { ...item, status: 'done' });
    setCompletedTaskIds((prev) => [...prev, task.id]);
    setPendingTaskId(null);
    timerRef.current = null;
  }, [getItems, updateItem]);

  function handleCheck(task: HomeTask) {
    if (pendingTaskId) return;
    setPendingTaskId(task.id);
    timerRef.current = setTimeout(() => commitCompletion(task), 5000);
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>{greeting()}, Nate!</Text>
          <Text style={styles.heading}>Today</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.avatarBtn, pressed && { opacity: 0.6 }]}
          onPress={() => router.push('/profile')}
        >
          <View style={styles.avatar}>
            <Icon name="person" size={16} color={colors.textMuted} />
          </View>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 112 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Upcoming tasks */}
        {availableTasks.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>UPCOMING</Text>
              <Pressable onPress={() => router.push('/tasks')}>
                <Text style={styles.viewAll}>View All</Text>
              </Pressable>
            </View>
            {visibleTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                isPending={task.id === pendingTaskId}
                onCheck={() => handleCheck(task)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.allCaughtUp}>
              <View style={styles.checkCircleGreen}>
                <Text style={{ fontSize: 16 }}>✓</Text>
              </View>
              <Text style={styles.allCaughtUpText}>All caught up!</Text>
              <Pressable onPress={() => router.push('/tasks')} style={styles.viewAllBtn}>
                <Text style={styles.viewAll}>View All</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Recently logged */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>RECENTLY LOGGED</Text>
          </View>
          <View style={styles.activityList}>
            {mockActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Undo toast */}
      {pendingTaskId && (
        <View style={[styles.toast, { bottom: insets.bottom + 106 }]}>
          <Text style={styles.toastText}>Task completed</Text>
          <Pressable
            onPress={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
              timerRef.current = null;
              setPendingTaskId(null);
            }}
          >
            <Text style={styles.undoText}>Undo</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16 },
  eyebrow: { fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', color: colors.textDisabled, marginBottom: 4 },
  heading: { fontSize: 30, fontWeight: '500', color: colors.textPrimary, fontFamily: 'Georgia' },
  avatarBtn: { marginTop: 4 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.darkSecondary, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 0 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 4 },
  sectionLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1, color: colors.textMuted },
  viewAll: { fontSize: 14, fontWeight: '600', color: colors.brandPurple },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
  taskCircleWrap: { paddingVertical: 14 },
  taskContent: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  taskMain: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 2 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  taskDue: { fontSize: 12, fontWeight: '500', color: colors.textDisabled },
  taskAccount: { fontSize: 12, color: colors.textDisabled, marginLeft: 8 },
  circleOuter: { width: 20, height: 20 },
  circleEmpty: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.textDisabled },
  circleFilled: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.semanticSuccess, alignItems: 'center', justifyContent: 'center' },
  activityList: { gap: 8, paddingHorizontal: 16 },
  activityCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, backgroundColor: colors.darkSecondary, borderRadius: radius.md, gap: 12 },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 },
  activityDesc: { fontSize: 14, color: colors.textMuted, lineHeight: 20, marginBottom: 8 },
  activityMeta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  activityAccount: { fontSize: 12, color: colors.textSecondary },
  activityDot: { fontSize: 12, color: colors.textDisabled },
  activityDate: { fontSize: 12, color: colors.textDisabled },
  activityDuration: { fontSize: 12, color: colors.textDisabled },
  allCaughtUp: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: colors.darkSecondary, borderRadius: radius.xl, marginHorizontal: 16 },
  checkCircleGreen: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(46,204,113,0.15)', alignItems: 'center', justifyContent: 'center' },
  allCaughtUpText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, flex: 1 },
  viewAllBtn: { marginLeft: 'auto' },
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: colors.darkTertiary,
    borderRadius: radius.xl,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  toastText: { fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  undoText: { fontSize: 14, fontWeight: '700', color: colors.brandPurple },
});
