import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './src/navigation/TabNavigator';
import { CycleProvider, useCycle } from './src/context/CycleContext';
import { FirebaseCycleProvider } from './src/context/FirebaseCycleContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';

import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import { View, ActivityIndicator, Text, ScrollView, TouchableOpacity } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LogDetailsScreen from './src/screens/LogDetailsScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import AuthScreen from './src/screens/AuthScreen';
import TestAuthScreen from './src/screens/TestAuthScreen';
import AdminScreen from './src/screens/AdminScreen';
import CreateAdminScreen from './src/screens/CreateAdminScreen';
import MainTabNavigator from './src/components/MainTabNavigator';

const Stack = createNativeStackNavigator();

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || this.state.error?.toString() || 'Unknown error';
      const errorStack = this.state.error?.stack || '';
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#FF3B30' }}>
            App Error caught!
          </Text>
          <View style={{ backgroundColor: '#F2F2F7', padding: 15, borderRadius: 10, width: '100%' }}>
            <Text style={{ fontSize: 14, color: '#1C1C1E', fontFamily: 'monospace' }}>
              {errorMessage}
            </Text>
          </View>
          {errorStack && (
            <ScrollView style={{ marginTop: 20, maxHeight: 300, width: '100%' }}>
              <Text style={{ fontSize: 10, color: '#8E8E93' }}>
                {errorStack}
              </Text>
            </ScrollView>
          )}
          <TouchableOpacity
            style={{ marginTop: 20, padding: 12, backgroundColor: '#008080', borderRadius: 8 }}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const AppContent = () => {
  const { isLoaded, isOnboarded } = useCycle();
  const { user } = useAuth();

  console.log('AppContent render:', { user: user ? `User ${user.uid}` : 'No user', isLoaded, isOnboarded });

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#008080" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user && (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
        {user && !isOnboarded && (
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
        )}
        {user && isOnboarded && (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        )}
        <Stack.Screen
          name="Admin"
          component={AdminScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="CreateAdmin"
          component={CreateAdminScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="LogDetails"
          component={LogDetailsScreen}
          options={{ presentation: 'modal' }}
          initialParams={{ category: 'Flow' }}
        />
        <Stack.Screen name="TestAuth" component={TestAuthScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  let [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // ... (Font loading logic remains)
  const [fontTimeout, setFontTimeout] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFontTimeout(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!fontsLoaded && !fontTimeout && !fontError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#008080" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <CycleProvider>
            <AppContent />
          </CycleProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
