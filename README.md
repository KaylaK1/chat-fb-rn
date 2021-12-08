# Chat App with Firebase and React Native

This is from a tutorial at: https://blog.jscrambler.com/build-a-chat-app-with-firebase-and-react-native

Note: the tutorial and codebase uses useLayoutEffect. Although it seems Gifted Chat may only utilize useEffect. I am still learning and reading on the differences.

The chat is a component written in typescript: https://github.com/FaridSafi/react-native-gifted-chat

# Chat
## How a Global Chat works
In a global or all users chat, one collection in Firestore is used to store any messages added as documents. This collection is then watched by an event listening pair known as onSnapshot and QuerySnapshot. The event listener is enclosed in a useEffect ( or useLayoutEffect - need to research why - this effect watches for DOM manipulations) hook. 

When the event listener catches a document being added to the collection. It sets the localState with all the message documents inside the chat collection. The messages retrieved and set can be custom limited. Example: the last 100 messages. 

    useLayoutEffect(() => {
        const collectionRef = collection(database, 'chats');
        const q = query(collectionRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, QuerySnapshot => {
            setMessages(
                QuerySnapshot.docs.map(doc => ({ // these key:value pairs are in a required format for GiftedChat
                    _id: doc.data()._id,
                    createdAt: doc.data().createdAt.toDate(),
                    text: doc.data().text,
                    user: doc.data().user
                }))
            );
        });
        
        return unsubscribe;
    }, []); // empty array to prevent continuous calls of useLayoutEffect or useEffect. onSnapshot/QuerySnapshot
            // will still be listening

## Sending a Message
The GiftedChat Component accepts the localState messages as property - which is then displayed. It also has a property onSend which sends the messages to the onSend function.

The onSend() function utilizes the useCallback() hook. useCallback() accepts an array of dependencies and will only return a memoized version of the callback if one of the dependencies has changed. 

In this case: messages is an array from the chat that has an additional message that the local user has sent. Since useCallback() has detected a change in the dependency messages (localState). It calls setMessages. 

setMessages takes the previousMessages state and appends the new message to the GiftedChat component. 

Finally onSend constructs a proper message object of the message the local user typed. Then it adds that message as a document to the chats collection.

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
    }, []); // We only what the effect to fire when invoked. 
            // We don't need to list the messages as a dependency since the useCallback arg will check for changes.


## User to User Chat
Hold my box of wine. 

## Sources
https://reactjs.org/docs/hooks-reference.html

https://github.com/FaridSafi/react-native-gifted-chat

https://en.wikipedia.org/wiki/Memoization
