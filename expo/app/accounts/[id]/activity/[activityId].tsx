import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../../../components/ui/Icon';
import { mockAccountDetails } from '../../../../lib/mock-data/accounts';
import { formatActivityDate, formatDuration } from '../../../../lib/utils';
import { colors, radius } from '../../../../lib/tokens';

const TYPE_LABEL: Record<string, string> = {
  visit: 'Visit',
  call: 'Call',
  email: 'Email',
  task: 'Task',
};

export default function ActivityDetailScreen() {
  const { id, activityId } = useLocalSearchParams<{ id: string; activityId: string }>();
  const insets = useSafeAreaInsets();

  const detail = mockAccountDetails[id];
  const activity = detail?.recentActivity?.find((a) => a.id === activityId);

  if (!activity) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Icon name="chevron_left" size={24} color={colors.textMuted} />
        </Pressable>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Activity not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Icon name="chevron_left" size={24} color={colors.textMuted} />
      </Pressable>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.typeLabel}>{TYPE_LABEL[activity.type] ?? activity.type}</Text>
        <Text style={styles.title}>{activity.title}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{formatActivityDate(activity.date)}</Text>
          {activity.durationMinutes != null && (
            <>
              <Text style={styles.dot}> • </Text>
              <Text style={styles.metaText}>{formatDuration(activity.durationMinutes)}</Text>
            </>
          )}
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SUMMARY</Text>
          <Text style={styles.bodyText}>{activity.summary}</Text>
        </View>

        {/* AI Summary */}
        {activity.aiSummary && (
          <>
            <View style={styles.aiHeader}>
              <Text style={styles.aiHeaderText}>AI Summary</Text>
            </View>

            <View style={styles.aiCard}>
              <Text style={styles.aiTitle}>{activity.aiSummary.title}</Text>
              <Text style={styles.aiTldr}>{activity.aiSummary.tldr}</Text>

              <View style={styles.divider} />
              <Text style={styles.keyPointsLabel}>KEY POINTS</Text>
              {activity.aiSummary.keyPoints.map((point, i) => (
                <View key={i} style={styles.keyPointRow}>
                  <View style={styles.keyPointDot} />
                  <Text style={styles.keyPointText}>{point}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Transcript badge */}
        {activity.hasTranscript && (
          <View style={styles.transcriptBadge}>
            <Icon name="edit" size={14} color={colors.brandPurple} />
            <Text style={styles.transcriptText}>Transcript available</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  backBtn: { paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'flex-start' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.textDisabled, fontSize: 14 },
  typeLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1, color: colors.brandPurple, textTransform: 'uppercase', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Georgia', lineHeight: 32, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  metaText: { fontSize: 13, color: colors.textDisabled },
  dot: { fontSize: 13, color: colors.textDisabled },
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 8 },
  bodyText: { fontSize: 15, color: colors.textMuted, lineHeight: 24 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  aiHeaderText: { fontSize: 14, fontWeight: '600', color: colors.brandPurple, letterSpacing: 0.5, textTransform: 'uppercase' },
  aiCard: { backgroundColor: colors.darkSecondary, borderRadius: radius.xl, padding: 20, marginBottom: 24 },
  aiTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, lineHeight: 24, marginBottom: 12 },
  aiTldr: { fontSize: 14, color: colors.textMuted, lineHeight: 22, marginBottom: 16 },
  divider: { height: 1, backgroundColor: colors.darkTertiary, marginBottom: 16 },
  keyPointsLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 12 },
  keyPointRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  keyPointDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.brandPurple, marginTop: 8, flexShrink: 0 },
  keyPointText: { flex: 1, fontSize: 14, color: colors.textMuted, lineHeight: 22 },
  transcriptBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'rgba(139,146,255,0.10)', borderRadius: radius.md, alignSelf: 'flex-start' },
  transcriptText: { fontSize: 13, fontWeight: '600', color: colors.brandPurple },
});
