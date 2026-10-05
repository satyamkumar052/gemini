import "./App.css";
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import {MyContext} from "./MyContext.jsx";
import { useEffect, useState, useContext } from "react";
import {v1 as uuidv1} from "uuid";
import { Routes, Route, useParams, useNavigate } from "react-router-dom";
import { clientServer } from "./clientServer.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";

function ChatLayout() {

    const { threadId } = useParams();
    const navigation = useNavigate();
    const { user, setUser, logout } = useContext(MyContext);

    const [prompt, setPrompt] = useState("");
    const [reply, setReply] = useState(null);

    const [currThreadId, setCurrThreadId] = useState(threadId || uuidv1());

    const [prevChats, setPrevChats] = useState([]); // stores all chats of curr thread

    const [newChat, setNewChat] = useState(!threadId); // to trigger new chat creation

    const [allThreads, setAllThreads] = useState([]);

    const [countPrompts, setCountPrompt] = useState(0);
    const [totalTokensUsed, setTotalTokensUsed] = useState(0);
    
    const providerValue = {
        prompt, setPrompt,
        reply, setReply,
        currThreadId, setCurrThreadId,
        newChat, setNewChat,
        prevChats, setPrevChats,
        allThreads, setAllThreads,
        user, setUser, logout,
        countPrompts, setCountPrompt,
        totalTokensUsed, setTotalTokensUsed
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
        </MyContext.Provider>
    );
}

function App() {    
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem("user");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        toast.info("Signed out successfully");
    };

    return (
        <MyContext.Provider value={{ user, setUser, logout }}>
            <Routes>
                <Route path='/' element={<ChatLayout />} />
                <Route path='/:threadId' element={<ChatLayout />} />
                <Route path='/login' element={<Login />} />
                <Route path='/signup' element={<Signup />} />
            </Routes>
            <ToastContainer position="top-right" autoClose={3000} theme='dark' />
        </MyContext.Provider>
    );
}

export default App;
