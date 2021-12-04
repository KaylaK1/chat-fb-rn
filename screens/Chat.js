import React, {
    useState,
    useEffect,
    useLayoutEffect,
    useCallback
} from 'react';
import { TouchableOpacity, Text } from 'react-native';
// @params GiftedChat component allows us to display chat messages that are going to be sent by different users
import { GiftedChat } from 'react-native-gifted-chat';
import {
    collection,
    addDoc,
    orderBy,
    query,
    onSnapshot,
    QuerySnapshot
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';

import { auth, database } from '../config/firebase';

import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Setting a timer']);

export default function Chat({ navigation }) {
    const [messages, setMessages] = useState([]);

    /**
     * Lines 27 -> 44 are to handle a user logging out.
     */
    const onSignOut = () => {
        signOut(auth).catch(error => console.log('Error logging out: ', error));
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    style={{
                        marginRight: 10
                    }}
                    onPress={onSignOut}
                >
                    <Text>Logout</Text>
                </TouchableOpacity>
            )
        });
    }, [navigation]);

    /**
     * Lines 49 -> will retrieve old messages from the firestore database.
     */
    useLayoutEffect(() => {
        const collectionRef = collection(database, 'chats');
        const q = query(collectionRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, QuerySnapshot => {
            setMessages(
                QuerySnapshot.docs.map(doc => ({
                    _id: doc.data()._id,
                    createdAt: doc.data().createdAt.toDate(),
                    text: doc.data().text,
                    user: doc.data().user
                }))
            );
        });

        return unsubscribe;
    });

    /**
     * Lines 71 -> will send a message. 
     */
    const onSend = useCallback((messages = []) => {
        setMessages(previousMessages =>
            GiftedChat.append(previousMessages, messages)
            );
            const { _id, createdAt, text, user } = messages[0];
            addDoc(collection(database, 'chats'), {
                _id,
                createdAt,
                text,
                user
            });
    }, []);

    return (
        <GiftedChat
        messages={messages}
        showAvatarForEveryMessage={true}
        onSend={messages => onSend(messages)}
        user={{
            _id: auth?.currentUser?.email,
            avatar: 'https://i.pravatar.cc/300'
        }}
        />
    );
}