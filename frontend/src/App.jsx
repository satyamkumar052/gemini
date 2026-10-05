import "./App.css";
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import {MyContext} from "./MyContext.jsx";
import { useEffect, useState } from "react";
import {v1 as uuidv1} from "uuid";
import {Routes, Route, useParams, useNavigate} from "react-router-dom";
import { clientServer } from "./clientServer.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ChatLayout() {

    const { threadId } = useParams();
    const navigation = useNavigate();

    const [prompt, setPrompt] = useState("");
    const [reply, setReply] = useState(null);

    const [currThreadId, setCurrThreadId] = useState(threadId || uuidv1());

    const [prevChats, setPrevChats] = useState([]); // stores all chats of curr thread

    const [newChat, setNewChat] = useState(true); // to trigger new chat creation

    const [allThreads, setAllThreads] = useState([]);
    
    const providerValue = {
        prompt, setPrompt,
        reply, setReply,
        currThreadId, setCurrThreadId,
        newChat, setNewChat,
        prevChats, setPrevChats,
        allThreads, setAllThreads
    };

    useEffect(() => {
        if(threadId) {
            setCurrThreadId(threadId);
            setNewChat(false);
            setReply(null);

            clientServer.get(`/api/thread/${threadId}`)
            .then(res => setPrevChats(res.data))
            .catch(err => {
                console.log(err);
                navigation("/");
            });
        } else {
            setCurrThreadId(uuidv1());
            setPrevChats([]);
            setNewChat(true);
            setReply(null);
        }
    }, [threadId, navigation]);

    return (
        <MyContext.Provider value={providerValue}>
            <div className='app'>
                <Sidebar></Sidebar>
                <ChatWindow></ChatWindow>
            </div>
            <ToastContainer position="top-right" autoClose={3000} theme='dark' />
        </MyContext.Provider>
    );
}

function App() {    

    return (
        <Routes>
            <Route path='/' element={<ChatLayout />} />

            <Route path='/:threadId' element={<ChatLayout />} />
        </Routes>
    );
}

export default App;
