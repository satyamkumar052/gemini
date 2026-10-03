import "./Sidebar.css";
import React, { useContext, useEffect } from 'react';
import {MyContext} from "./MyContext.jsx";
import {v1 as uuidv1} from "uuid";
import { clientServer } from "./clientServer.js";



function Sidebar() {


    const {allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats } = useContext(MyContext);

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

        getAllThreads();

    }, [currThreadId]);


    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
    };



    const changethread = async (newThreadId) => {

        setCurrThreadId(newThreadId);

        try {
            
            const response = await clientServer.get(`/api/thread/${newThreadId}`);

            const res = response.data;

            setPrevChats(res);
            setNewChat(false);

            setReply(null);
            
        } catch (err) {
            console.log(err);
        }

    }


    const deleteThread = async (threadId) => {
        try {

            const response = await clientServer.delete(`/api/thread/${threadId}`);

            const res = response.data;

            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));

            if(threadId === currThreadId) {
                createNewChat();
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


            <div className="sign">
                <p>Sign In</p>
            </div>
            
        </section>
    );
}

export default Sidebar;