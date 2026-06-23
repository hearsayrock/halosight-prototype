import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import type { Account, CrmAccountType } from '../../lib/types';
import { formatLastVisited, formatDistance } from '../../lib/utils';
import { colors, radius, space } from '../../lib/tokens';

const CRM_LABEL: Record<CrmAccountType, string> = {
  'sold-to': 'Sold-To',
  'shipped-to': 'Shipped-To',
  distributor: 'Distributor',
  prospect: 'Prospect',
};

function AccountTypeBadge({ type }: { type: CrmAccountType }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{CRM_LABEL[type]}</Text>
    </View>
  );
}

function TaskIndicator({ count }: { count: number }) {
  if (count === 0) {
    return (
      <View style={styles.taskIconEmpty}>
        <Text style={styles.taskIconEmptyText}>☐</Text>
      </View>
    );
  }
  return (
    <View style={styles.taskBadge}>
      <Text style={styles.taskBadgeText}>{count}</Text>
    </View>
  );
}

function AssigneeCircle({ initial }: { initial: string }) {
  return (
    <View style={styles.assignee}>
      <Text style={styles.assigneeText}>{initial}</Text>
    </View>
  );
}

interface Props {
  account: Account;
  isLast?: boolean;
}

export default function AccountListItem({ account, isLast = false }: Props) {
  const { label, isToday } = formatLastVisited(account.lastVisited);

  return (
    <Pressable
      onPress={() => router.push(`/accounts/${account.id}` as any)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      {!isLast && <View style={styles.separator} />}

      <View style={styles.left}>
        <Text style={styles.name} numberOfLines={1}>{account.name}</Text>

        <View style={styles.meta}>
          <Text style={styles.metaText}>{formatDistance(account.distanceMiles)}</Text>
          {account.city && account.state && (
            <>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.metaText}>{account.city}, {account.state}</Text>
            </>
          )}
        </View>

        <Text style={styles.visited}>
          <Text style={styles.visitedLabel}>Visited </Text>
          <Text style={[styles.visitedDate, isToday && styles.visitedToday]}>{label}</Text>
        </Text>
      </View>

      <View style={styles.right}>
        {account.crmAccountType && <AccountTypeBadge type={account.crmAccountType} />}
        <View style={styles.taskRow}>
          {account.taskCount !== undefined && <TaskIndicator count={account.taskCount} />}
          {account.assignedInitial && <AssigneeCircle initial={account.assignedInitial} />}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: space[4],
    paddingVertical: 14,
    gap: space[3],
  },
  pressed: { opacity: 0.7 },
  separator: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: colors.darkTertiary,
  },
  left: { flex: 1, minWidth: 0 },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  metaText: { fontSize: 14, color: colors.textMuted },
  dot: { fontSize: 14, color: colors.textDisabled },
  visited: { marginTop: 2 },
  visitedLabel: { fontSize: 14, color: colors.textDisabled },
  visitedDate: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  visitedToday: { color: colors.brandCoral },
  right: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
    flexShrink: 0,
    minHeight: 60,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.darkTertiary,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  taskIconEmpty: { opacity: 0.4 },
  taskIconEmptyText: { fontSize: 14, color: colors.textDisabled },
  taskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 143, 130, 0.20)',
    height: 20,
  },
  taskBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.brandCoralLight,
  },
  assignee: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: colors.darkTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assigneeText: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
});
