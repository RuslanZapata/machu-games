import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

import '../global.css';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className='flex-1 items-center justify-center p-5'>
        <Text className='text-lg font-semibold'>This screen doesn't exist.</Text>
        <Link href="/" className='mt-4 px-4'>
          <Text>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
