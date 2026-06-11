import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../../../components/ui/Icon';
import { mockAccountDetails } from '../../../../lib/mock-data/accounts';
import { useActionItems } from '../../../../lib/context/ActionItemsContext';
import { colors, radius } from '../../../../lib/tokens';

function formatDueDate(date: Date | null): string {
  if (!date) return 'TBD';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function ActionItemDetailScreen() {
  const { id, itemId } = useLocalSearchParams<{ id: string; itemId: string }>();
  const insets = useSafeAreaInsets();
  const { getItems, updateItem } = useActionItems();

  const items = getItems(id);
  const item = items.find((i) => i.id === itemId);
  const detail = mockAccountDetails[id];

  if (!item) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Icon name="chevron_left" size={24} color={colors.textMuted} />
        </Pressable>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Item not found</Text>
        </View>
      </View>
    );
  }

  const isDone = item.status === 'done';

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Icon name="chevron_left" size={24} color={colors.textMuted} />
      </Pressable>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.checkRow}>
            <Pressable
              style={[styles.checkbox, isDone && styles.checkboxDone]}
              onPress={() => updateItem(id, { ...item, status: isDone ? 'open' : 'done' })}
            >
              {isDone && <Icon name="check" size={14} color="#fff" />}
            </Pressable>
            <Text style={[styles.title, isDone && styles.titleDone]}>{item.title}</Text>
          </View>

          <View style={styles.metaRow}>
            <Icon name="calendar_today" size={14} color={colors.brandPurpleDark} />
            <Text style={styles.metaLabel}>Due Date</Text>
            <Text style={styles.metaValue}>{formatDueDate(item.dueDate)}</Text>
          </View>

          {detail && (
            <View style={styles.metaRow}>
              <Icon name="business" size={14} color={colors.textMuted} />
              <Text style={styles.metaLabel}>Account</Text>
              <Text style={styles.metaValue}>{detail.name}</Text>
            </View>
          )}

          <View style={[styles.metaRow, { marginTop: 4 }]}>
            <View style={[styles.statusBadge, isDone && styles.statusBadgeDone]}>
              <Text style={[styles.statusText, isDone && styles.statusTextDone]}>
                {isDone ? 'Done' : 'Open'}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          style={[styles.actionBtn, isDone && styles.actionBtnDone]}
          onPress={() => updateItem(id, { ...item, status: isDone ? 'open' : 'done' })}
        >
          <Text style={styles.actionBtnText}>
            {isDone ? 'Mark as Open' : 'Mark as Done'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  backBtn: { paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'flex-start' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.textDisabled, fontSize: 14 },
  card: { backgroundColor: colors.darkSecondary, borderRadius: radius.xl, padding: 20, marginBottom: 16 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 20 },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: colors.textDisabled, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  checkboxDone: { backgroundColor: colors.semanticSuccess, borderColor: colors.semanticSuccess },
  title: { flex: 1, fontSize: 20, fontWeight: '600', color: colors.textPrimary, lineHeight: 28 },
  titleDone: { color: colors.textMuted, textDecorationLine: 'line-through' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.darkTertiary },
  metaLabel: { fontSize: 13, color: colors.textMuted, width: 80 },
  metaValue: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full, backgroundColor: 'rgba(139,146,255,0.15)' },
  statusBadgeDone: { backgroundColor: 'rgba(46,204,113,0.15)' },
  statusText: { fontSize: 13, fontWeight: '600', color: colors.brandPurple },
  statusTextDone: { color: colors.semanticSuccess },
  actionBtn: { height: 48, backgroundColor: colors.brandCoral, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  actionBtnDone: { backgroundColor: colors.darkSecondary },
  actionBtnText: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
});
