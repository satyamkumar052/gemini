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
        setCurrThreadId, user, sidebarOpen, setSidebarOpen
    } = useContext(MyContext);

    const navigation = useNavigate();

    useEffect(() => {
        if (user && getAllThreads) getAllThreads();
    }, [user]);

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        navigation("/");
        setSidebarOpen(false);
    };

    const changeThread = (newThreadId) => {
        setCurrThreadId(newThreadId);
        navigation(`/${newThreadId}`);
        setSidebarOpen(false);
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
        <>
            {/* Mobile overlay — tap to close */}
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            )}

            <section className={`sidebar${sidebarOpen ? " sidebar--open" : ""}`}>

                {/* ── Header ── */}
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <img className="logo" src={logo} alt="Gemini logo" />
                        <span className="brand-name">Gemini</span>
                    </div>

                    {/* Hamburger toggle */}
                    <button
                        className="new-chat-btn"
                        onClick={() => setSidebarOpen(o => !o)}
                        title="Toggle sidebar"
                    >
                        <i className="fa-solid fa-bars"></i>
                    </button>
                </div>

                {/* ── New Chat pill ── */}
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
        </>
    );
}

export default Sidebar;