// App.js
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './Screens/homescreen'; // Adjust the path as necessary
import LoginScreen from './Screens/login'; // Adjust the path as necessary
import SignupScreen from './Screens/signup';
import DashboardScreen from './Screens/Dashboard';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" options={{headerShown:false}} component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="signup" component={SignupScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{headerShown:false}} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;