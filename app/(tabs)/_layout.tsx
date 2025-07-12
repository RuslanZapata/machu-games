import { Tabs } from 'expo-router';
import { Gamepad2, Zap, Grid3x3, CircleDot } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#333333',
        },
        tabBarActiveTintColor: '#00ff00',
        tabBarInactiveTintColor: '#666666',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Snake',
          tabBarIcon: ({ size, color }) => (
            <Gamepad2 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shooter"
        options={{
          title: 'Shooter',
          tabBarIcon: ({ size, color }) => (
            <Zap size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="puzzle"
        options={{
          title: 'Puzzle',
          tabBarIcon: ({ size, color }) => (
            <Grid3x3 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bounce"
        options={{
          title: 'Bounce',
          tabBarIcon: ({ size, color }) => (
            <CircleDot size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}