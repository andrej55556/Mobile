import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack>
      <Stack.Screen name="index" options={{ headerShown: false, title: 'Карта' }} />
      <Stack.Screen name="marker/[id]" options={({ route }) => ({ title: `Метка ${route.params?.id}` })} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}