import React from 'react';
import { Tabs } from 'expo-router';
import BottomNav from '../../components/layout/BottomNav';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomNav {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="accounts" options={{ title: 'Accounts' }} />
    </Tabs>
  );
}
