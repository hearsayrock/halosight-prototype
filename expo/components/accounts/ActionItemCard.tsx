import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '../ui/Icon';
import type { ActionItem } from '../../lib/types';
import { colors, radius } from '../../lib/tokens';

function formatDueDate(date: Date | null): string {
  if (!date) return 'TBD';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

interface Props {
  item: ActionItem;
}

export default function ActionItemCard({ item }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.checkbox} />
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.dueDateRow}>
          <Icon name="calendar_today" size={11} color={colors.brandPurpleDark} />
          <Text style={styles.dueDate}>{formatDueDate(item.dueDate)}</Text>
        </View>
      </View>
      <Icon name="chevron_right" size={18} color={colors.textDisabled} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(61,68,81,0.8)',
    borderRadius: radius.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.textDisabled,
    flexShrink: 0,
  },
  content: { flex: 1, minWidth: 0 },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  dueDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  dueDate: { fontSize: 12, color: colors.textSecondary },
});
