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

    const [selectedImage, setSelectedImage] = useState(null);

    let [loading, setLoading] = useState(false);

    const { prompt, setPrompt, reply, setReply, currThreadId, setCurrThreadId, prevChats, setPrevChats, setNewChat, user, logout, totalTokensUsed, setTotalTokensUsed, countPrompts, setCountPrompt } = useContext(MyContext);

    const [isOpen, setIsOpen] = useState(false);
    const maxPrompts = user ? 10 : 5;

    const MODELS = [
        { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", badge: "Stable" },
        { id: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro Preview", badge: "Thinking" },
        { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash", badge: "Fast" },
        { id: "gemini-3.8-flash", label: "Gemini 3.8 Flash", badge: "Preview" },
    ];

    const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
    const [isModalDropDownOpen, setIsModalDropDownOpen] = useState(false);

    const GetReply = async () => {
        if(!prompt.trim()) return;

        if (countPrompts >= maxPrompts) {
            if(!user) {
                toast.error("Guest limit reached (5/5). Please sign in to continue.");
            } else {
                toast.error("Prompt limit reached (10/10). Please create a new chat.");
            }
            return;
        }

        setLoading(true);
        setNewChat(false);

        try {

            const response = await clientServer.post("/api/chat", {
                message: prompt,
                threadId: currThreadId,
                model: selectedModel,
                image: selectedImage ? { data: selectedImage.base64, mimeType: selectedImage.mimeType } : null
            });

            setSelectedImage(null);

            const res = response.data;

            setReply(res.reply);
            if (res.prompts !== undefined) {
                setCountPrompt(res.prompts);
            } else {
                setCountPrompt(prev => prev + 1);
            }
            if (res.totalTokensUsed !== undefined) {
                setTotalTokensUsed(res.totalTokensUsed);
            }

            if(!threadId) {
                navigation(`/${currThreadId}`, {replace:true});
            }
            
        } catch (err) {
            console.log(err);
            let errMsg = err.response?.data?.message || err.message || "Failed to get response";
            try {
                const parsed = JSON.parse(errMsg);
                if (parsed.error?.message) {
                    errMsg = parsed.error.message;
                } else if (parsed.message) {
                    errMsg = parsed.message;
                }
            } catch (e) {
                // Not JSON, keep errMsg as is
            }
            toast.error(errMsg);
        }
        setLoading(false);
    }

    const handlePaste = (e) => {
        const items = e.clipboardData?.items;
        if(!items) return;

        for(let i = 0; i < items.length; i++) {
            if(items[i].type.startsWith("image/")) {
                e.preventDefault();
                const file = items[i].getAsFile();
                const reader = new FileReader();
                
                reader.onloadend = () => {
                    setSelectedImage({
                        preview: URL.createObjectURL(file),
                        base64: reader.result.split(",")[1],
                        mimeType: file.type
                    });
                };

                reader.readAsDataURL(file);
                break;
                
            }
        }
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
                <span className="logoTitle">Gemini</span>
                <div className="userIconDiv" onClick={handleProfileClick}>
                    <span className="userIcon">
                        {user ? (
                            <strong style={{ fontSize: "14px", color: "#fff" }}>{user.name?.charAt(0).toUpperCase()}</strong>
                        ) : (
                            <i className="fa-solid fa-user"></i>
                        )}
                    </span>
                </div>
            </div>


            {
                isOpen && 
                <div className='dropDown' style={{userSelect:"none"}}>
                    {user ? (
                        <>
                            <div className='dropDownItem' style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "6px", cursor: "default" }}>
                                <span style={{ fontWeight: "600", color: "#fff", display: "block" }}>{user.name}</span>
                                <small style={{ color: "#9aa0a6", fontSize: "0.75rem" }}>{user.email}</small>
                            </div>
                            <div className='dropDownItem'><i className="fa-solid fa-cloud-arrow-up"></i> Upgrade plan</div>
                            <div className='dropDownItem'><i className="fa-solid fa-gear"></i> Settings</div>
                            <div className='dropDownItem' onClick={() => { setIsOpen(false); logout(); }}>
                                <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
                            </div>
                        </>
                    ) : (
                        <>
                            <div className='dropDownItem' onClick={() => { setIsOpen(false); navigation("/login"); }}>
                                <i className="fa-solid fa-arrow-right-to-bracket"></i> Sign In
                            </div>
                            <div className='dropDownItem' onClick={() => { setIsOpen(false); navigation("/signup"); }}>
                                <i className="fa-solid fa-user-plus"></i> Sign Up
                            </div>
                        </>
                    )}
                </div>
            }

            <Chat></Chat>

            <ScaleLoader color="white" loading={loading}></ScaleLoader>
            
            <div className="chatInput">
                {selectedImage && (
                    <div className='imagePreviewContainer'>
                        <img src={selectedImage.preview} alt="pasted" className='pastedThumbnail' />
                        <button className="removeImageBtn" onClick={() => setSelectedImage(null)}>
                            <i className='fa-solid fa-xmark'></i>
                        </button>
                    </div>
                )}
                <div className="inputBox">
                    <input 
                        value={prompt} 
                        onChange={(e) => setPrompt(e.target.value)} 
                        onKeyDown={(e) => e.key==="Enter" ? GetReply() : null } 
                        onPaste={handlePaste}
                        type="text" 
                        placeholder={
                            countPrompts >= maxPrompts 
                                ? (!user ? "Guest limit reached (5/5). Sign in to continue." : "Limit reached (10/10). Start new chat.")
                                : "Ask anything or paste image" }
                        disabled={countPrompts >= maxPrompts || loading}
                    />
                    
                    <div className="inputControls">
                        {/* Model Dropdown inside prompt box before submit */}
                        <div className="modelSelectorWrapper">
                            <button 
                                type="button"
                                onClick={() => setIsModalDropDownOpen(!isModalDropDownOpen)} 
                                className="modelSelectorBtn"
                            >
                                <span>{MODELS.find(m => m.id === selectedModel)?.label}</span>
                                <i className={`fa-solid fa-chevron-${isModalDropDownOpen ? "down" : "up"}`}></i>
                            </button>

                            {isModalDropDownOpen && (
                                <div className="modelDropdownMenu">
                                    {MODELS.map(model => (
                                        <div 
                                            key={model.id} 
                                            className={`modelOptionItem ${selectedModel === model.id ? "active" : ""}`} 
                                            onClick={() => {
                                                setSelectedModel(model.id); 
                                                setIsModalDropDownOpen(false); 
                                            }}
                                        >
                                            <div className="modelOptionInfo">
                                                <span className="modelOptionTitle">{model.label}</span>
                                                {model.badge && <span className="modelOptionBadge">{model.badge}</span>}
                                            </div>
                                            {selectedModel === model.id && (
                                                <i className="fa-solid fa-check modelCheckIcon"></i>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div 
                            id='submit' 
                            onClick={GetReply}
                            style={{ opacity: countPrompts >= maxPrompts ? 0.4 : 1, cursor: countPrompts >= maxPrompts ? "not-allowed" : "pointer" }}
                        >
                            <i className="fa-solid fa-paper-plane"></i>
                        </div>
                    </div>
                </div>
                <p className="info">
                    Gemini is AI and can make mistakes • Prompts: {countPrompts}/{maxPrompts} {!user && "(Guest mode)"}
                </p>
                <div className='gptDiv'>
                    <p>Tokens used: {totalTokensUsed}</p>
                </div>
            </div>

        </div>
    );
}

export default ChatWindow;