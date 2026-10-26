import "./Sidebar.css";
import React, { useContext, useEffect } from 'react';
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";
import { clientServer } from "./clientServer.js";
import { useNavigate } from "react-router-dom";
import logo from "./assets/imag2.png";

function Sidebar() {
    const {
        allThreads, setAllThreads, getAllThreads,
        currThreadId, setNewChat, setPrompt, setReply,
        setCurrThreadId, setPrevChats, user
    } = useContext(MyContext);

    const navigation = useNavigate();

    useEffect(() => {
        if (user && getAllThreads) {
            getAllThreads();
        }
    }, [user]);

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        navigation("/");
    };

    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);
        navigation(`/${newThreadId}`);
    };

    const deleteThread = async (threadId) => {
        try {
            await clientServer.delete(`/api/thread/${threadId}`);
            setAllThreads(prev => prev.filter(t => t.threadId !== threadId));
            if (threadId === currThreadId) navigation("/");
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <section className="sidebar">

            {/* ── Header ── */}
            <div className="sidebar-header">
                <div className="sidebar-brand">
                    <img className="logo" src={logo} alt="Gemini logo" />
                    <span className="brand-name">Gemini</span>
                </div>

                {/* New Chat button */}
                <button className="new-chat-btn" onClick={createNewChat} title="New chat">
                    <i className="fa-regular fa-pen-to-square"></i>
                </button>
            </div>

            {/* ── New Chat pill (prominent) ── */}
            <div className="new-chat-pill" onClick={createNewChat}>
                <i className="fa-solid fa-plus"></i>
                <span>New chat</span>
            </div>

            {/* ── All Chats Section ── */}
            <div className="chats-section">
                <div className="section-label">
                    <span>All chats</span>
                </div>

                <ul className="history">
                    {allThreads && allThreads.length > 0 ? (
                        allThreads.map((thread, idx) => (
                            <li
                                key={idx}
                                onClick={() => changeThread(thread.threadId)}
                                className={thread.threadId === currThreadId ? "highlighted" : ""}
                            >
                                <span className="thread-title">{thread.title}</span>
                                <i
                                    className="fa-regular fa-trash-can thread-delete"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteThread(thread.threadId);
                                    }}
                                />
                            </li>
                        ))
                    ) : (
                        <li className="no-chats">No chats yet</li>
                    )}
                </ul>
            </div>

            {/* ── Footer / User ── */}
            <div
                className="sign"
                onClick={() => !user && navigation("/login")}
                style={{ cursor: !user ? "pointer" : "default" }}
            >
                {user ? (
                    <div className="user-info">
                        <span className="user-avatar">
                            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </span>
                        <span className="user-name">{user.name}</span>
                    </div>
                ) : (
                    <p className="sign-in-text">Sign In</p>
                )}
            </div>

        </section>
    );
}

export default Sidebar;