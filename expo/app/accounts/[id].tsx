import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal, TextInput, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../components/ui/Icon';
import ActionItemCard from '../../components/accounts/ActionItemCard';
import { mockAccounts, mockAccountDetails } from '../../lib/mock-data/accounts';
import { useActionItems } from '../../lib/context/ActionItemsContext';
import { useCapture } from '../../lib/context/CaptureContext';
import { formatActivityDate, formatDuration } from '../../lib/utils';
import type { ActivityItem, ActionItem } from '../../lib/types';
import { colors, radius, space } from '../../lib/tokens';

function ActivityCard({ item, accountId }: { item: ActivityItem; accountId: string }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.actCard, pressed && { opacity: 0.7 }]}
      onPress={() => router.push(`/accounts/${accountId}/activity/${item.id}` as any)}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.actTitle}>{item.title}</Text>
        <Text style={styles.actSummary} numberOfLines={2}>{item.summary}</Text>
        <View style={styles.actMeta}>
          <Text style={styles.actDate}>{formatActivityDate(item.date)}</Text>
          {item.durationMinutes != null && (
            <>
              <Text style={styles.actDot}> • </Text>
              <Text style={styles.actDate}>{formatDuration(item.durationMinutes)}</Text>
            </>
          )}
        </View>
      </View>
      <Icon name="chevron_right" size={18} color={colors.textDisabled} />
    </Pressable>
  );
}

function AddItemSheet({ accountId, onClose }: { accountId: string; onClose: () => void }) {
  const { addItem } = useActionItems();
  const [title, setTitle] = useState('');

  function handleAdd() {
    if (!title.trim()) return;
    addItem(accountId, {
      id: `item-${Date.now()}`,
      title: title.trim(),
      dueDate: null,
      status: 'open',
    });
    onClose();
  }

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>Add an item</Text>
        <TextInput
          style={styles.sheetInput}
          placeholder="What needs to be done?"
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
          autoFocus
          multiline
        />
        <Pressable
          style={[styles.addBtn, !title.trim() && { opacity: 0.4 }]}
          onPress={handleAdd}
          disabled={!title.trim()}
        >
          <Text style={styles.addBtnText}>Add action item</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'overview' | 'activity'>('overview');
  const [showAddSheet, setShowAddSheet] = useState(false);

  const { getItems } = useActionItems();
  const { status: captureStatus, accountId: capturingId, startCapture } = useCapture();
  const isCapturing = captureStatus !== 'idle' && capturingId === id;

  const actionItems = getItems(id);
  const detail = mockAccountDetails[id];
  const account = detail ?? mockAccounts.find((a) => a.id === id);

  if (!account) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <Icon name="close" size={22} color={colors.textMuted} />
        </Pressable>
        <View style={styles.errorCenter}>
          <Text style={styles.errorText}>Account not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <Icon name="close" size={22} color={colors.textMuted} />
        </Pressable>
        <Text style={styles.accountName}>{account.name}</Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['overview', 'activity'] as const).map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Tab content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 96 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'overview' && (
          <>
            {detail ? (
              <>
                <View style={styles.contentSection}>
                  <Text style={styles.sectionHeading}>Last Time</Text>
                  <Text style={styles.bodyText}>{detail.lastVisitSummary}</Text>
                </View>
                <View style={styles.contentSection}>
                  <Text style={styles.sectionHeading}>Ideas for this Time</Text>
                  {detail.ideasForThisTime.map((idea, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <View style={styles.bullet} />
                      <Text style={styles.bulletText}>{idea}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.emptySection}>
                <Text style={styles.emptyText}>
                  No overview available yet.{'\n'}Capture your first meeting to generate insights.
                </Text>
              </View>
            )}

            {/* Action Items */}
            <View style={styles.contentSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeading}>Action Items</Text>
                {actionItems.length > 0 && (
                  <Pressable onPress={() => setShowAddSheet(true)}>
                    <Icon name="add" size={20} color={colors.textPrimary} />
                  </Pressable>
                )}
              </View>

              {actionItems.length > 0 ? (
                <View style={styles.itemList}>
                  {actionItems.map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => router.push(`/accounts/${id}/action-items/${item.id}` as any)}
                    >
                      <ActionItemCard item={item} />
                    </Pressable>
                  ))}
                </View>
              ) : (
                <Pressable style={styles.emptyItems} onPress={() => setShowAddSheet(true)}>
                  <View style={styles.emptyItemsIcon}>
                    <Icon name="add" size={18} color={colors.brandPurple} />
                  </View>
                  <View>
                    <Text style={styles.emptyItemsTitle}>Add your first action item</Text>
                    <Text style={styles.emptyItemsSub}>Track follow-ups from this visit</Text>
                  </View>
                </Pressable>
              )}
            </View>
          </>
        )}

        {activeTab === 'activity' && (
          <View style={{ gap: 12, paddingTop: 4 }}>
            {detail?.recentActivity?.length ? (
              detail.recentActivity.map((item) => (
                <ActivityCard key={item.id} item={item} accountId={id} />
              ))
            ) : (
              <View style={styles.emptySection}>
                <Text style={styles.emptyText}>No activity recorded yet.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Capture CTA */}
      {!isCapturing && (
        <View style={[styles.captureCTA, { bottom: insets.bottom + 32 }]}>
          <Pressable
            style={({ pressed }) => [styles.captureBtn, pressed && { opacity: 0.8 }]}
            onPress={() => startCapture(id, account.name)}
          >
            <Icon name="edit" size={16} color={colors.textPrimary} />
            <Text style={styles.captureBtnText}>Capture Meeting</Text>
          </Pressable>
        </View>
      )}

      {showAddSheet && (
        <AddItemSheet accountId={id} onClose={() => setShowAddSheet(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  closeBtn: { padding: 4, marginBottom: 12, alignSelf: 'flex-start' },
  accountName: { fontSize: 26, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Georgia', textAlign: 'center', paddingHorizontal: 40, marginBottom: 16 },
  tabs: { flexDirection: 'row', padding: 4, gap: 4, backgroundColor: colors.darkPrimary, borderRadius: radius.full, alignSelf: 'center', width: 260 },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: radius.full, alignItems: 'center' },
  tabBtnActive: { backgroundColor: colors.darkSecondary },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textMuted, textTransform: 'capitalize' },
  tabTextActive: { color: colors.textPrimary },
  contentSection: { marginBottom: 24 },
  sectionHeading: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Georgia', marginBottom: 8 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  bodyText: { fontSize: 15, color: colors.textMuted, lineHeight: 22 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.textMuted, marginTop: 7, flexShrink: 0 },
  bulletText: { flex: 1, fontSize: 15, color: colors.textMuted, lineHeight: 22 },
  itemList: { gap: 8 },
  emptySection: { paddingVertical: 32, alignItems: 'center' },
  emptyText: { fontSize: 14, color: colors.textDisabled, textAlign: 'center', lineHeight: 22 },
  emptyItems: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: colors.darkSecondary, borderRadius: radius.xl },
  emptyItemsIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(139,146,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  emptyItemsTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  emptyItemsSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  actCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, backgroundColor: colors.darkSecondary, borderRadius: radius.md, gap: 12, marginBottom: 0 },
  actTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 },
  actSummary: { fontSize: 14, color: colors.textMuted, lineHeight: 20, marginBottom: 6 },
  actMeta: { flexDirection: 'row', alignItems: 'center' },
  actDate: { fontSize: 12, color: colors.textDisabled },
  actDot: { fontSize: 12, color: colors.textDisabled },
  captureCTA: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  captureBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 44, paddingHorizontal: 24, backgroundColor: colors.brandCoral, borderRadius: radius.full },
  captureBtnText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  errorCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 16, color: colors.textDisabled },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.background, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: 24, paddingBottom: 40 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.darkTertiary, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 22, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Georgia', marginBottom: 20 },
  sheetInput: { backgroundColor: colors.darkSecondary, borderRadius: radius.xl, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.textPrimary, minHeight: 48, marginBottom: 20 },
  addBtn: { height: 48, backgroundColor: colors.brandCoral, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
});
