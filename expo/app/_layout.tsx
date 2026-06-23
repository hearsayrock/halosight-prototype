import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActionItemsProvider } from '../lib/context/ActionItemsContext';
import { CaptureProvider } from '../lib/context/CaptureContext';

export default function RootLayout() {
  return (
    <ActionItemsProvider>
      <CaptureProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#111420' } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="accounts/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="accounts/[id]/action-items/[itemId]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="accounts/[id]/activity/[activityId]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="tasks" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="profile" options={{ animation: 'slide_from_bottom' }} />
        </Stack>
      </CaptureProvider>
    </ActionItemsProvider>
  );
}
