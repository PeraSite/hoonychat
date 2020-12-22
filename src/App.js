import React, {useRef, useState} from 'react';
import './App.css';

import 'firebase/firestore';
import 'firebase/auth'
import firebase from "firebase/app";
import {useAuthState} from "react-firebase-hooks/auth";
import {useCollectionData} from "react-firebase-hooks/firestore";

if (!firebase.apps.length) {
    firebase.initializeApp({
        apiKey: "AIzaSyBviFv72bK241Fw3lCRQlYRICIqyCxHC7w",
        authDomain: "hoony-chat.firebaseapp.com",
        projectId: "hoony-chat",
        storageBucket: "hoony-chat.appspot.com",
        messagingSenderId: "116338568918",
        appId: "1:116338568918:web:923e2db28e19a8c3366377",
        measurementId: "G-1XVBGY7W6Z"
    })
}

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
    const [user] = useAuthState(auth);

    return (
        <div className="App">
            {user != null && <header>
                <SignOut/>
            </header>}
            <section>
                {user ? <ChatRoom/> : <SignIn/>}
            </section>
        </div>
    );
}

function SignIn() {
    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider()
        auth.signInWithRedirect(provider)
    }
    return (
        <button className="loginButton" onClick={signInWithGoogle}>여기를 눌러 구글에 로그인하세요.</button>
    )
}

function SignOut() {
    return auth.currentUser && (
        <button className="logoutButton" onClick={() => {
            auth.signOut()
        }}>로그아웃</button>
    )
}

function ChatRoom() {
    const dummy = useRef();
    const messagesRef = firestore.collection('messages')
    const query = messagesRef.orderBy('createdAt').limit(25)

    const [messages] = useCollectionData(query, {idField: 'id'});

    const [formValue, setFormValue] = useState('')

    const sendMessage = async (e) => {
        e.preventDefault()
        const {uid, photoURL, displayName} = auth.currentUser;

        // SendNotification(formValue, photoURL)
        setFormValue('')
        await messagesRef.add({
            text: formValue,
            displayName,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            photoURL
        })
        dummy.current.scrollIntoView({behavior: 'smooth'});
    }

    return (<>
        <main>
            {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}
            <span ref={dummy}/>

        </main>
        <form onSubmit={sendMessage}>
            <input value={formValue} onChange={event => setFormValue(event.target.value)}
                   placeholder="보낼 메세지를 적어주세요."/>
            <button type="submit" disabled={!formValue}>보내기</button>
        </form>
    </>)
}

function ChatMessage(props) {
    const {text, uid, photoURL, displayName} = props.message

    const messageClass = uid === auth.currentUser.uid ? "sent" : "received"

    return (
        <div className={`message ${messageClass}`}>
            <div className="nameBox">
                <p className="displayName">{displayName}</p>
            </div>

            <div className="chatBox">
                <img src={photoURL}/>
                <p className="textMessage">{text}</p>
            </div>
        </div>
    )
}

function SendNotification(msg, photoURL) {
    new Notification('후니채팅 알림', {
        body: msg,
        image: photoURL,
        dir: "ltr"
    })
}

export default App;
