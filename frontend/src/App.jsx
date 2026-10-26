import "./App.css";
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import {MyContext} from "./MyContext.jsx";
import { useEffect, useState } from "react";
import {v1 as uuidv1} from "uuid";
import { API_BASE_URL } from "./api.js";

function App() {

    const [backendStatus, setBackendStatus] = useState("connecting");

    const [prompt, setPrompt] = useState("");
    const [reply, setReply] = useState(null);

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
    
    const providerValue = {
        prompt, setPrompt,
        reply, setReply,
        currThreadId, setCurrThreadId,
        newChat, setNewChat,
        prevChats, setPrevChats,
        allThreads, setAllThreads,
        backendStatus, setBackendStatus
    };

    return (
        <div className="app">
            <MyContext.Provider value={providerValue}>
                <Sidebar></Sidebar>
                <ChatWindow></ChatWindow>
            </MyContext.Provider>
        </div>
    );
}

export default App;
