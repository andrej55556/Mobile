import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DatabaseProvider } from '../contexts/DatabaseContext';

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false, title: 'Карта' }} />
        <Stack.Screen 
          name="marker/[id]" 
          options={({ route }) => ({ 
            title: `Метка ${(route.params as { id: string }).id}` 
          })} 
        />
      </Stack>
      <StatusBar style="light" />
    </DatabaseProvider>
  );
}