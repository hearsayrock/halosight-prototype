import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/ui/Icon';
import { colors, radius } from '../lib/tokens';

const MENU_ITEMS = [
  'My Accounts',
  'Notifications',
  'Integrations',
  'Help & Support',
  'Privacy Policy',
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.closeBtn} onPress={() => router.back()}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
          <Pressable>
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>N</Text>
          </View>
          <Text style={styles.name}>Nate Smith</Text>
          <Text style={styles.email}>nsmith@halosight.com</Text>
          <Text style={styles.company}>Halosight - Area51</Text>
        </View>

        {/* Menu items */}
        <View style={styles.menuList}>
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item}
              style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.menuItemText}>{item}</Text>
              <Icon name="chevron_right" size={18} color={colors.textDisabled} />
            </Pressable>
          ))}
        </View>

        <Text style={styles.version}>App Version 1.3.5+163</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  closeBtn: {},
  closeText: { fontSize: 16, fontWeight: '600', color: colors.textMuted },
  logoutText: { fontSize: 16, fontWeight: '600', color: colors.brandCoral },
  avatarSection: { alignItems: 'center', paddingHorizontal: 16, marginBottom: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#607D8B', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarInitial: { fontSize: 32, fontWeight: '700', color: '#fff' },
  name: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Georgia', marginBottom: 4 },
  email: { fontSize: 14, color: colors.textMuted, marginBottom: 2 },
  company: { fontSize: 14, color: colors.textMuted },
  menuList: { gap: 8, paddingHorizontal: 16, marginBottom: 24 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: colors.darkSecondary, borderRadius: radius.md },
  menuItemText: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  version: { textAlign: 'center', fontSize: 12, color: colors.textDisabled },
});
