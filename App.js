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
/**
 * React Navigation allows for routing and navigation for Expo and React Native Apps.
 * @param NavigationContainer - manages app state and links the top level navigator to the app environment
 *        The container takes care of platform specific integration and provides functionality for:
 *        deep link integration (linking prop), Notifying state changes for screen tracking, state, persistence, etc,
 *        Handle system back button on android (BackHandler)
 */
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, database } from './config/firebase';


import Login from './screens/Login';
import Signup from './screens/Signup';
import Chat from './screens/Chat';


//playing around 
import {
  collection,
  setDoc,
  addDoc,
  orderBy,
  query,
  onSnapshot,
  QuerySnapshot,
  doc
} from 'firebase/firestore';

const Stack = createStackNavigator();

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

  let user1 = "test@site.com";
  let user2 = "testy@gmail.com";

  let roomName = 'chat_' + (user1 < user2 ? user1 +'_'+ user2 : user2 +'_'+ user1);

  console.log('First way');
  console.log(user1+', '+user2+' => '+ roomName);

  user1 = "testy@gmail.com";
  user2 = "test@site.com";

  roomName = 'chat_'+(user1<user2 ? user1+'_'+user2 : user2+'_'+user1);
  console.log("usernames switched");
  console.log(user1+', '+user2+' => '+ roomName);

  // create a list of chat rooms for each user
  setDoc(doc(database, "userChatrooms", `${user1}`), {
    [`${user2}`]: true
  });
  setDoc(doc(database, "userChatrooms", `${user2}`), {
    [`${user1}`]: true
  });

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
/**
 * The default Render. Once the User is authenticated it:
 * @returns <RootNavigator />
 */
export default function App() {
  return (
  <AuthenticatedUserProvider>
    <RootNavigator />
  </AuthenticatedUserProvider>
  );
}