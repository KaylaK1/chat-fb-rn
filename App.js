/**
 * Chat app tutorial from: https://blog.jscrambler.com/build-a-chat-app-with-firebase-and-react-native
 * 
 * @param createContext @param useContext The Context API is designed to share data that is considered global for a tree of React components. 
 * You must pass a default value - used when a component does not have a matching Provider.
 * The Provider allows the React components to subscribe to the context changes. These context changes
 * can help us determine a users logged in state in the chat app.
 */

import React, { useState, createContext, useContext, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';


import Login from './screens/Login';
import Signup from './screens/Signup';
import Chat from './screens/Chat';

const Stack= createStackNavigator();

function ChatStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name='Chat' component={Chat} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='Login' component={Login} />
      <Stack.Screen name='Signup' component={Signup} />
    </Stack.Navigator>
  );
}

/**
 * @function AuthenticatedUserProvider creates an auth provider: This provider allows the screen components to access
 * current user in the application. 
 */
const AuthenticatedUserContext = createContext({});
const AuthenticatedUserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  return (
    <AuthenticatedUserContext.Provider value={{ user, setUser }}>
      {children}
    </AuthenticatedUserContext.Provider>
  );
};

function RootNavigator() {
  const { user, setUser } = useContext(AuthenticatedUserContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged returns an unsubscriber
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async authenticatedUser => {
        authenticatedUser ? setUser(authenticatedUser) : setUser(null);
        setIsLoading(false);
      }
    );

    // unsubscribe auth listener on unmount
    return unsubscribeAuth;
  }, [user]);

  if(isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <ChatStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
  <AuthenticatedUserProvider>
    <RootNavigator />
  </AuthenticatedUserProvider>
  );
}