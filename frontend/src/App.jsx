import "./App.css";
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import {MyContext} from "./MyContext.jsx";
<<<<<<< HEAD
import { useEffect, useState } from "react";
import {v1 as uuidv1} from "uuid";
import { API_BASE_URL } from "./api.js";

function App() {

    const [backendStatus, setBackendStatus] = useState("connecting");
=======
import { useEffect, useState, useContext, useRef } from "react";
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
>>>>>>> origin/main

    const [prompt, setPrompt] = useState("");
    const [reply, setReply] = useState(null);

<<<<<<< HEAD
    const [currThreadId, setCurrThreadId] = useState(uuidv1());

    const [prevChats, setPrevChats] = useState([]); // stores all chats of curr thread

    const [newChat, setNewChat] = useState(true); // to trigger new chat creation

    const [allThreads, setAllThreads] = useState([]);

    useEffect(() => {
        let isActive = true;
        let retryTimeout;
        let requestController;

        const checkBackend = async () => {
            requestController = new AbortController();

            try {
                const response = await fetch(`${API_BASE_URL}/health`, {
                    signal: requestController.signal,
                });

                if (!response.ok) {
                    throw new Error(`Backend health check failed (${response.status})`);
                }

                if (isActive) setBackendStatus("connected");
            } catch {
                if (!isActive) return;

                setBackendStatus("disconnected");
                retryTimeout = setTimeout(checkBackend, 10000);
            }
        };

        checkBackend();

        return () => {
            isActive = false;
            clearTimeout(retryTimeout);
            requestController?.abort();
        };
    }, []);
    
=======
    const [currThreadId, setCurrThreadId] = useState(threadId || uuidv1());

    const [prevChats, setPrevChats] = useState([]); // stores all chats of curr thread

    const [newChat, setNewChat] = useState(!threadId); // to trigger new chat creation

    const [allThreads, setAllThreads] = useState([]);

    const [countPrompts, setCountPrompt] = useState(0);
    const [totalTokensUsed, setTotalTokensUsed] = useState(0);

    const skipNextFetchRef = useRef(false);
    
    const getAllThreads = async () => {
        if (!user) {
            return;
        }
        try {
            const response = await clientServer.get("/api/thread");
            const res = response.data;
            const filteredData = res.map(thread => ({
                threadId: thread.threadId,
                title: thread.title
            }));
            setAllThreads(filteredData);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        if (user) {
            getAllThreads();
        } else {
            setAllThreads([]);
        }
    }, [user]);

>>>>>>> origin/main
    const providerValue = {
        prompt, setPrompt,
        reply, setReply,
        currThreadId, setCurrThreadId,
        newChat, setNewChat,
        prevChats, setPrevChats,
        allThreads, setAllThreads,
<<<<<<< HEAD
        backendStatus, setBackendStatus
    };

    return (
        <div className="app">
            <MyContext.Provider value={providerValue}>
                <Sidebar></Sidebar>
                <ChatWindow></ChatWindow>
            </MyContext.Provider>
        </div>
=======
        getAllThreads,
        user, setUser, logout,
        countPrompts, setCountPrompt,
        totalTokensUsed, setTotalTokensUsed,
        skipNextFetchRef
    };

    useEffect(() => {
        if(threadId) {
            setCurrThreadId(threadId);
            setNewChat(false);

            if (skipNextFetchRef.current) {
                skipNextFetchRef.current = false;
                return;
            }

            setReply(null);

            clientServer.get(`/api/thread/${threadId}`)
            .then(res => {
                const messages = Array.isArray(res.data) ? res.data : (res.data?.messages || []);
                const tokens = res.data?.totalTokensUsed || 0;
                setPrevChats(messages);
                const userPrompts = res.data?.prompts !== undefined ? res.data.prompts : messages.filter(msg => msg.role === "user").length;
                setCountPrompt(userPrompts);
                setTotalTokensUsed(tokens);
            })
            .catch(err => {
                console.log(err);
                navigation("/");
            });
        } else {
            setCurrThreadId(uuidv1());
            setPrevChats([]);
            setNewChat(true);
            setReply(null);
            setCountPrompt(0);
            setTotalTokensUsed(0);
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

    const navigation = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigation("/")
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
>>>>>>> origin/main
    );
}

export default App;
