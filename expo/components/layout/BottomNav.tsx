import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { colors, radius } from '../../lib/tokens';

function HomeIcon({ active }: { active: boolean }) {
  return (
    <View style={styles.iconWrap}>
      <Text style={[styles.iconEmoji, { opacity: active ? 1 : 0.45 }]}>⌂</Text>
    </View>
  );
}

function AccountsIcon({ active }: { active: boolean }) {
  return (
    <View style={styles.iconWrap}>
      <Text style={[styles.iconEmoji, { opacity: active ? 1 : 0.45 }]}>◉</Text>
    </View>
  );
}

export default function BottomNav({ state, navigation }: BottomTabBarProps) {
  const isHome = state.index === 0;
  const isAccounts = state.index === 1;

  return (
    <View style={styles.wrapper}>
      <View style={styles.navOuter}>
        <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.border} />

        {/* Active pill */}
        <View
          style={[
            styles.pill,
            isHome ? styles.pillLeft : styles.pillRight,
          ]}
        />

        {/* Home tab */}
        <Pressable
          style={styles.tab}
          onPress={() => navigation.navigate(state.routes[0].name)}
        >
          <HomeIcon active={isHome} />
          <Text style={[styles.label, isHome ? styles.labelActive : styles.labelInactive]}>
            Home
          </Text>
        </Pressable>

        {/* Accounts tab */}
        <Pressable
          style={styles.tab}
          onPress={() => navigation.navigate(state.routes[1].name)}
        >
          <AccountsIcon active={isAccounts} />
          <Text style={[styles.label, isAccounts ? styles.labelActive : styles.labelInactive]}>
            Accounts
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    paddingBottom: 32,
    paddingTop: 4,
    backgroundColor: 'transparent',
  },
  navOuter: {
    width: 230,
    height: 66,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(139,146,255,0.08)',
    position: 'relative',
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  pill: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    width: '46%',
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  pillLeft: { left: 6 },
  pillRight: { right: 6 },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    height: '100%',
    zIndex: 1,
  },
  iconWrap: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  iconEmoji: { fontSize: 18, color: colors.textPrimary },
  label: { fontSize: 10, fontFamily: 'Georgia', letterSpacing: 0.2 },
  labelActive: { color: colors.textPrimary },
  labelInactive: { color: colors.textMuted },
});
