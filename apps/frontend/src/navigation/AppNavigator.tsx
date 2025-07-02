// src/navigation/AppNavigator.tsx
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SplashScreen from '../features/core/screens/SplashScreen';
import PhoneNumberScreen from '../features/auth/screens/PhoneNumberScreen';
// import other screens here

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="PhoneNumber" component={PhoneNumberScreen} />
    </Stack.Navigator>
  );
}
