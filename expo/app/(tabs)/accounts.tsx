import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AccountListItem from '../../components/accounts/AccountListItem';
import Icon from '../../components/ui/Icon';
import { mockAccounts } from '../../lib/mock-data/accounts';
import type { SortOption } from '../../lib/types';
import { colors, radius, space } from '../../lib/tokens';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'alphabetical', label: 'Alphabetical' },
  { value: 'distance', label: 'Distance' },
  { value: 'lastVisited', label: 'Last Visited' },
  { value: 'company', label: 'Company' },
];

function sortAccounts(accounts: typeof mockAccounts, sort: SortOption) {
  return [...accounts].sort((a, b) => {
    switch (sort) {
      case 'alphabetical': return a.name.localeCompare(b.name);
      case 'distance': return a.distanceMiles - b.distanceMiles;
      case 'lastVisited': return b.lastVisited.getTime() - a.lastVisited.getTime();
      case 'company': return (a.parentId ?? a.id).localeCompare(b.parentId ?? b.id);
      default: return 0;
    }
  });
}

export default function AccountsScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('alphabetical');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const source = q
      ? mockAccounts.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.city?.toLowerCase().includes(q) ||
            a.state?.toLowerCase().includes(q)
        )
      : mockAccounts;
    return sortAccounts(source, sort);
  }, [query, sort]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.menuIcon}>
          <Text style={styles.menuLines}>{'\u2630'}</Text>
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

      {/* Search + sort */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <Icon name="cancel" size={16} color={colors.textDisabled} />
            </Pressable>
          )}
        </View>
        <Pressable
          style={styles.sortBtn}
          onPress={() => setShowSortMenu((v) => !v)}
        >
          <Icon name="more_vert" size={20} color={colors.textMuted} />
        </Pressable>
      </View>

      {/* Sort menu */}
      {showSortMenu && (
        <>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setShowSortMenu(false)} />
          <View style={styles.sortMenu}>
            {SORT_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={styles.sortOption}
                onPress={() => { setSort(opt.value); setShowSortMenu(false); }}
              >
                <Text style={[styles.sortOptionText, sort === opt.value && { color: colors.textPrimary }]}>
                  {opt.label}
                </Text>
                {sort === opt.value && (
                  <Icon name="check" size={16} color={colors.textPrimary} />
                )}
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* Account list */}
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No accounts match "{query}"</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <AccountListItem account={item} isLast={index === filtered.length - 1} />
          )}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: insets.bottom + 112 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 32, paddingRight: 16, paddingBottom: 12 },
  menuIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  menuLines: { fontSize: 20, color: colors.textMuted },
  avatarBtn: {},
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.darkSecondary, alignItems: 'center', justifyContent: 'center' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, height: 44, paddingHorizontal: 12, backgroundColor: colors.darkSecondary, borderRadius: radius.lg },
  searchInput: { flex: 1, fontSize: 14, color: colors.textPrimary },
  sortBtn: { width: 40, height: 40, backgroundColor: colors.darkSecondary, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  sortMenu: {
    position: 'absolute',
    top: 100,
    right: 16,
    width: 200,
    backgroundColor: colors.darkTertiary,
    borderRadius: radius.xl,
    paddingVertical: 12,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  sortOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  sortOptionText: { fontSize: 15, color: colors.textMuted },
  empty: { flex: 1, alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 14, color: colors.textDisabled },
});
