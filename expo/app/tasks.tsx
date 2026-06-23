import React, { useState, useRef, useCallback, useMemo } from 'react';
import { View, Text, Pressable, SectionList, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/ui/Icon';
import { useActionItems } from '../lib/context/ActionItemsContext';
import { mockAccounts } from '../lib/mock-data/accounts';
import type { ActionItem } from '../lib/types';
import { colors, radius } from '../lib/tokens';

type StatusFilter = 'open' | 'done';
type SortMode = 'dueDate' | 'account';
type FlatItem = ActionItem & { accountId: string };

const ACCOUNT_NAME: Record<string, string> = Object.fromEntries(
  mockAccounts.map((a) => [a.id, a.name])
);

function dueSortKey(date: Date | null): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date ? date.getTime() : today.getTime();
}

function isToday(date: Date | null): boolean {
  if (!date) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime() === today.getTime();
}

function formatDate(date: Date | null): string {
  if (!date) return 'Due Today';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function FilterPill({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.pill, pressed && { opacity: 0.7 }]} onPress={onPress}>
      <Text style={styles.pillText}>{label}</Text>
      <Icon name="keyboard_arrow_down" size={16} color={colors.textMuted} />
    </Pressable>
  );
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
      <Animated.View style={{ transform: [{ scale }] }}>
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

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const { getAllItems, getItems, updateItem } = useActionItems();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('open');
  const [sortMode, setSortMode] = useState<SortMode>('dueDate');
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [pendingAccountId, setPendingAccountId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commitCompletion = useCallback((itemId: string, accountId: string) => {
    const item = getItems(accountId).find((i) => i.id === itemId);
    if (item) updateItem(accountId, { ...item, status: 'done' });
    setPendingItemId(null);
    setPendingAccountId(null);
    timerRef.current = null;
  }, [getItems, updateItem]);

  function handleCheck(itemId: string, accountId: string) {
    if (pendingItemId) return;
    setPendingItemId(itemId);
    setPendingAccountId(accountId);
    timerRef.current = setTimeout(() => commitCompletion(itemId, accountId), 5000);
  }

  const sections = useMemo(() => {
    const all = getAllItems();
    const filtered = all.filter((item) =>
      statusFilter === 'open' ? item.status === 'open' : item.status === 'done' || item.status === 'canceled'
    );
    const map = new Map<string, FlatItem[]>();
    for (const item of filtered) {
      const list = map.get(item.accountId) ?? [];
      list.push(item);
      map.set(item.accountId, list);
    }
    const result: { title: string; accountId: string; data: FlatItem[] }[] = [];
    for (const [accountId, items] of map.entries()) {
      const sorted = [...items].sort((a, b) => dueSortKey(a.dueDate) - dueSortKey(b.dueDate));
      result.push({ title: ACCOUNT_NAME[accountId] ?? accountId, accountId, data: sorted });
    }
    if (sortMode === 'account') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      result.sort((a, b) => {
        const aMin = Math.min(...a.data.map((i) => dueSortKey(i.dueDate)));
        const bMin = Math.min(...b.data.map((i) => dueSortKey(i.dueDate)));
        return aMin - bMin;
      });
    }
    return result;
  }, [getAllItems, statusFilter, sortMode]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Icon name="chevron_left" size={24} color={colors.textMuted} />
        </Pressable>
        <View style={styles.titleRow}>
          <Text style={styles.heading}>All Items</Text>
          <View style={styles.filters}>
            <FilterPill
              label={statusFilter === 'open' ? 'Open' : 'Done'}
              onPress={() => setStatusFilter((s) => (s === 'open' ? 'done' : 'open'))}
            />
            <FilterPill
              label={sortMode === 'dueDate' ? 'Due Date' : 'Account'}
              onPress={() => setSortMode((s) => (s === 'dueDate' ? 'account' : 'dueDate'))}
            />
          </View>
        </View>
      </View>

      {sections.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No {statusFilter} items</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title.toUpperCase()}</Text>
              <Text style={styles.sectionCount}>{section.data.length}</Text>
            </View>
          )}
          renderItem={({ item, index, section }) => {
            const dueToday = isToday(item.dueDate);
            const isLast = index === section.data.length - 1;
            return (
              <View style={styles.taskRow}>
                {!isLast && <View style={styles.separator} />}
                <View style={styles.taskCircleWrap}>
                  <CheckCircle
                    checked={item.id === pendingItemId}
                    onCheck={() => handleCheck(item.id, item.accountId)}
                  />
                </View>
                <Pressable
                  style={({ pressed }) => [styles.taskContent, pressed && { opacity: 0.7 }]}
                  onPress={() => router.push(`/accounts/${item.accountId}/action-items/${item.id}` as any)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.taskTitle}>{item.title}</Text>
                    <View style={styles.taskMeta}>
                      <Icon name="calendar_today" size={12} color={colors.brandPurpleDark} />
                      <Text style={[styles.taskDue, dueToday && { color: colors.brandCoral }]}>
                        {formatDate(item.dueDate)}
                      </Text>
                    </View>
                  </View>
                  <Icon name="chevron_right" size={18} color={colors.textDisabled} />
                </Pressable>
              </View>
            );
          }}
        />
      )}

      {pendingItemId && (
        <View style={[styles.toast, { bottom: insets.bottom + 24 }]}>
          <Text style={styles.toastText}>Task completed</Text>
          <Pressable
            onPress={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
              timerRef.current = null;
              setPendingItemId(null);
              setPendingAccountId(null);
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
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { padding: 4, marginBottom: 12, alignSelf: 'flex-start' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  heading: { fontSize: 30, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Georgia' },
  filters: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  pill: { flexDirection: 'row', alignItems: 'center', height: 32, paddingHorizontal: 12, backgroundColor: colors.darkSecondary, borderRadius: radius.full, gap: 2 },
  pillText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 14, color: colors.textDisabled },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  sectionTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 1, color: colors.textDisabled },
  sectionCount: { fontSize: 12, fontWeight: '700', color: colors.brandPurple },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12, position: 'relative' },
  separator: { position: 'absolute', bottom: 0, left: 12, right: 12, height: 1, backgroundColor: colors.darkTertiary },
  taskCircleWrap: { paddingVertical: 14 },
  taskContent: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  taskTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 2 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  taskDue: { fontSize: 12, fontWeight: '500', color: colors.textDisabled },
  circleEmpty: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.textDisabled },
  circleFilled: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.semanticSuccess, alignItems: 'center', justifyContent: 'center' },
  toast: { position: 'absolute', left: 16, right: 16, backgroundColor: colors.darkTertiary, borderRadius: radius.xl, paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  toastText: { fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  undoText: { fontSize: 14, fontWeight: '700', color: colors.brandPurple },
});
