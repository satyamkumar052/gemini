import "./Sidebar.css";
import React, { useContext, useEffect } from 'react';
import {MyContext} from "./MyContext.jsx";
import {v1 as uuidv1} from "uuid";
import { clientServer } from "./clientServer.js";
import { useNavigate } from "react-router-dom";



function Sidebar() {


    const {allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats, user } = useContext(MyContext);

    const navigation = useNavigate();

    const getAllThreads = async () => {

        try {

            const response = await clientServer.get("/api/thread");

            const res = await response.data;

            const filteredData = res.map(thread => ({threadId : thread.threadId, title: thread.title}));

            setAllThreads(filteredData);
            
        } catch (err) {
            console.log(err);          
        }
    }

    useEffect(() => {

        if(user) {
            getAllThreads();
        } else {
            setAllThreads([]);
        }
    }, [currThreadId, user]);


    const createNewChat = () => {
        setNewChat(true)
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        navigation("/");
    };



    const changethread = async (newThreadId) => {
        navigation(`/${newThreadId}`);
    }


    const deleteThread = async (threadId) => {
        try {

            const response = await clientServer.delete(`/api/thread/${threadId}`);

            const res = response.data;

            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));

            if(threadId === currThreadId) {
                navigation("/");
            }
            
        } catch (err) {
            console.log(err);
        }
    }


    return (
        <section className='sidebar'>

            <button onClick={() => createNewChat()}>
                <img className="logo" src="src/assets/imag2.png" alt="logo" />
                <span><i className="fa-solid fa-pen-to-square"></i></span>
            </button>

            
            <ul className="history">

                {
                    allThreads?.map((thread, idx) => (
                        <li key={idx} 
                            onClick={(e) => changethread(thread.threadId)}
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
            </div>
            
        </section>
    );
}

export default Sidebar;