import "./Sidebar.css";
import React, { useCallback, useContext, useEffect } from 'react';
import {MyContext} from "./MyContext.jsx";
import {v1 as uuidv1} from "uuid";
import { API_BASE_URL } from "./api.js";



function Sidebar() {


    const {allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats, setBackendStatus } = useContext(MyContext);

    const getAllThreads = useCallback(async () => {
        let requestReachedBackend = false;
        setBackendStatus("connecting");
        try {
            const response = await fetch(`${API_BASE_URL}/api/thread`);
            requestReachedBackend = true;
            setBackendStatus("connected");

            const res = await response.json();

            const filteredData = res.map(thread => ({threadId : thread.threadId, title: thread.title}));


            setAllThreads(filteredData);
            
        } catch (err) {
            if (!requestReachedBackend) setBackendStatus("disconnected");
            console.error(err);
        }
    }, [setAllThreads, setBackendStatus]);

    useEffect(() => {

        getAllThreads();

    }, [currThreadId, getAllThreads]);


    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
    };



    const changethread = async (newThreadId) => {

        setCurrThreadId(newThreadId);
        let requestReachedBackend = false;
        setBackendStatus("connecting");

        try {
            
            const response = await fetch(`${API_BASE_URL}/api/thread/${newThreadId}`);
            requestReachedBackend = true;
            setBackendStatus("connected");

            const res = await response.json();

            setPrevChats(res);
            setNewChat(false);

            setReply(null);
            
        } catch (err) {
            if (!requestReachedBackend) setBackendStatus("disconnected");
            console.error(err);
        }

    }


    const deleteThread = async (threadId) => {
        let requestReachedBackend = false;
        setBackendStatus("connecting");
        try {

            const response = await fetch(`${API_BASE_URL}/api/thread/${threadId}`, {method:"DELETE"});
            requestReachedBackend = true;
            setBackendStatus("connected");

            const res = await response.json();

            console.log(res);

            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));

            if(threadId === currThreadId) {
                createNewChat();
            }
            
        } catch (err) {
            if (!requestReachedBackend) setBackendStatus("disconnected");
            console.error(err);
        }
    }


    return (
        <section className='sidebar'>

            <button onClick={createNewChat}>
                <img className="logo" src="src/assets/imag2.png" alt="logo" />
                <span><i className="fa-solid fa-pen-to-square"></i></span>
            </button>

            
            <ul className="history">

                {
                    allThreads?.map((thread, idx) => (
                        <li key={idx} 
                            onClick={() => changethread(thread.threadId)}
                            className={thread.threadId === currThreadId ? "highlited" : ""}
                        >
                            {thread.title}
                            <i className="fa-regular fa-trash-can" onClick={(e) => {
                                e.stopPropagation();
                                deleteThread(thread.threadId);
                            }}></i>
                        </li>
                    ))
                }

            </ul>


            <div className="sign">
                <p>Sign In</p>
            </div>
            
        </section>
    );
}

export default Sidebar;