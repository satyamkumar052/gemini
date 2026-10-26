import "./Sidebar.css";
<<<<<<< HEAD
import React, { useCallback, useContext, useEffect } from 'react';
import {MyContext} from "./MyContext.jsx";
import {v1 as uuidv1} from "uuid";
import { API_BASE_URL } from "./api.js";
=======
import React, { useContext, useEffect } from 'react';
import {MyContext} from "./MyContext.jsx";
import {v1 as uuidv1} from "uuid";
import { clientServer } from "./clientServer.js";
import { useNavigate } from "react-router-dom";
>>>>>>> origin/main



function Sidebar() {


<<<<<<< HEAD
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
=======
    const {allThreads, setAllThreads, getAllThreads, currThreadId, setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats, user } = useContext(MyContext);

    const navigation = useNavigate();

    useEffect(() => {
        if(user && getAllThreads) {
            getAllThreads();
        }
    }, [user]);
>>>>>>> origin/main


    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
<<<<<<< HEAD
        setPrevChats([]);
=======
        navigation("/");
>>>>>>> origin/main
    };



    const changethread = async (newThreadId) => {
<<<<<<< HEAD

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

=======
        setCurrThreadId(newThreadId);
        navigation(`/${newThreadId}`);
>>>>>>> origin/main
    }


    const deleteThread = async (threadId) => {
<<<<<<< HEAD
        let requestReachedBackend = false;
        setBackendStatus("connecting");
        try {

            const response = await fetch(`${API_BASE_URL}/api/thread/${threadId}`, {method:"DELETE"});
            requestReachedBackend = true;
            setBackendStatus("connected");

            const res = await response.json();

            console.log(res);
=======
        try {

            const response = await clientServer.delete(`/api/thread/${threadId}`);

            const res = response.data;
>>>>>>> origin/main

            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));

            if(threadId === currThreadId) {
<<<<<<< HEAD
                createNewChat();
            }
            
        } catch (err) {
            if (!requestReachedBackend) setBackendStatus("disconnected");
            console.error(err);
=======
                navigation("/");
            }
            
        } catch (err) {
            console.log(err);
>>>>>>> origin/main
        }
    }


    return (
        <section className='sidebar'>

<<<<<<< HEAD
            <button onClick={createNewChat}>
=======
            <button onClick={() => createNewChat()}>
>>>>>>> origin/main
                <img className="logo" src="src/assets/imag2.png" alt="logo" />
                <span><i className="fa-solid fa-pen-to-square"></i></span>
            </button>

            
            <ul className="history">

                {
                    allThreads?.map((thread, idx) => (
                        <li key={idx} 
<<<<<<< HEAD
                            onClick={() => changethread(thread.threadId)}
=======
                            onClick={(e) => changethread(thread.threadId)}
>>>>>>> origin/main
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


<<<<<<< HEAD
            <div className="sign">
                <p>Sign In</p>
=======
            <div className="sign" onClick={() => !user && navigation("/login")} style={{ cursor: !user ? "pointer" : "default" }}>
                {user ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                        <span style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            backgroundColor: "#339cff",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            fontSize: "13px",
                            userSelect:"none",
                        }}>
                            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </span>
                        <span style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.95rem" }}>
                            {user.name}
                        </span>
                    </div>
                ) : (
                    <p style={{ margin: 0 }}>Sign In</p>
                )}
>>>>>>> origin/main
            </div>
            
        </section>
    );
}

export default Sidebar;