import React, { useContext, useEffect, useState } from 'react';
import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from './MyContext.jsx';
import { ScaleLoader } from "react-spinners";
import { clientServer } from './clientServer.js';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';


function ChatWindow() {

    const { threadId} = useParams();
    const navigation = useNavigate();


    let [loading, setLoading] = useState(false);

    const { prompt, setPrompt, reply, setReply, currThreadId, setCurrThreadId, prevChats, setPrevChats, setNewChat} = useContext(MyContext);

    const [isOpen, setIsOpen] = useState(false);
    

    const GetReply = async () => {
        if(!prompt.trim()) return;

        setLoading(true);
        setNewChat(false);

        try {

            const response = await clientServer.post("/api/chat", {
                message: prompt,
                threadId: currThreadId
            });

            const res = response.data;

            setReply(res.reply);

            if(!threadId) {
                navigation(`/${currThreadId}`, {replace:true});
            }
            
        } catch (err) {
            console.log(err);
            const errMsg = err.response?.data?.message || err.message || "Failed to get response";
            toast.error(errMsg);
        }
        setLoading(false);
    }


    // append new chats 
    useEffect(() => {
        if(prompt && reply) {
            setPrevChats(prevChats => (
                [...prevChats, 
                {
                    role:"user",
                    content: prompt
                },{
                    role:"assistent",
                    content: reply
                }]
            ));
        }

        setPrompt("")
    }, [reply]);


    const handleProfileClick = () => {
        setIsOpen(!isOpen);
    }


    return (
        <div className="chatWindow">
            <div className="navbar">

                <span>Gemini </span>
                <div className="userIconDiv" onClick={handleProfileClick}>
                    <span className="userIcon"><i className="fa-solid fa-user"></i></span>
                </div>

            </div>


            {
                isOpen && 
                <div className='dropDown'>
                    <div className='dropDownItem'><i class="fa-solid fa-cloud-arrow-up"></i> Upgrade plan</div>
                    <div className='dropDownItem'><i class="fa-solid fa-gear"></i> Settings</div>
                    <div className='dropDownItem'><i class="fa-solid fa-arrow-right-from-bracket"></i> Log out</div>
                </div>
            }

            <Chat></Chat>

            <ScaleLoader color="white" loading={loading}></ScaleLoader>
            
            <div className="chatInput">
                <div className="inputBox">
                    <input value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => e.key==="Enter" ? GetReply() : null } type="text" placeholder="Ask anything" />
                    <div id='submit' onClick={GetReply}><i className="fa-solid fa-paper-plane"></i></div>
                </div>
                <p className="info">Gemini is AI and can make mistakes</p>
            </div>

        </div>
    );
}

export default ChatWindow;