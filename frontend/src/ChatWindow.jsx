import React, { useContext, useEffect, useState } from 'react';
import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from './MyContext.jsx';
import { ScaleLoader } from "react-spinners";
<<<<<<< HEAD
import { API_BASE_URL } from "./api.js";
=======
import { clientServer } from './clientServer.js';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
>>>>>>> origin/main


function ChatWindow() {

<<<<<<< HEAD

    let [loading, setLoading] = useState(false);

    const { prompt, setPrompt, reply, setReply, currThreadId, setPrevChats, setNewChat, backendStatus, setBackendStatus} = useContext(MyContext);

    const [isOpen, setIsOpen] = useState(false);
    

    const GetReply = async () => {
        if (!prompt.trim() || loading) return;

        setLoading(true);
        setNewChat(false);
        setBackendStatus("connecting");
        const Options = {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify({
                message: prompt,
                threadId: currThreadId
            }),
        };

        let requestReachedBackend = false;

        try {
            const response = await fetch(`${API_BASE_URL}/api/chat`, Options);
            requestReachedBackend = true;
            setBackendStatus("connected");

            if (!response.ok) {
                throw new Error(`Chat request failed (${response.status})`);
            }

            const data = await response.json();
            setReply(data.reply);
        } catch (err) {
            if (!requestReachedBackend) setBackendStatus("disconnected");
            console.error(err);
        } finally {
            setLoading(false);
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
=======
    const { threadId} = useParams();
    const navigation = useNavigate();

    const [selectedImage, setSelectedImage] = useState(null);

    let [loading, setLoading] = useState(false);

    const { prompt, setPrompt, reply, setReply, currThreadId, setCurrThreadId, prevChats, setPrevChats, setNewChat, user, logout, totalTokensUsed, setTotalTokensUsed, countPrompts, setCountPrompt, allThreads, setAllThreads, getAllThreads, skipNextFetchRef } = useContext(MyContext);

    const [isOpen, setIsOpen] = useState(false);
    const maxPrompts = user ? 10 : 5;

    const MODELS = [
        { id: "gemini-4-argon", label: "Gemini 4 Argon", badge: "Pro", lockedForGuests: true },
        { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", badge: "Stable" },
        { id: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro Preview", badge: "Thinking" },
        { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash", badge: "Fast" },
        { id: "gemini-3.8-flash", label: "Gemini 3.8 Flash", badge: "Preview", lockedForGuests: true },
        { id: "gemini-nano-banana-2.1", label: "Gemini Nano Banana 2.1", badge: "Nano", lockedForGuests: true },
    ];

    const [selectedModel, setSelectedModel] = useState(MODELS[1].id);
    const [isModalDropDownOpen, setIsModalDropDownOpen] = useState(false);

    const selectedModelObj = MODELS.find(m => m.id === selectedModel);

    useEffect(() => {
        if (!user && selectedModelObj?.lockedForGuests) {
            setSelectedModel("gemini-2.5-flash");
        }
    }, [user, selectedModel]);

    const handleSelectModel = (model) => {
        if (model.lockedForGuests && !user) {
            toast.info(`${model.label} is exclusively for signed-in users. Please sign in to unlock Pro models.`);
            return;
        }
        setSelectedModel(model.id);
        setIsModalDropDownOpen(false);
    };

    const GetReply = async () => {
        if(!prompt.trim() && !selectedImage) return;

        if (selectedModelObj?.lockedForGuests && !user) {
            toast.error(`${selectedModelObj.label} is only available for signed-in users. Please sign in.`);
            return;
        }

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

        const sentPrompt = prompt.trim() || (selectedImage ? "Describe this image" : "");
        const sentImage = selectedImage;

        const isFirstChat = !threadId || prevChats.length === 0;

        // Immediately update sidebar so the user sees the new active thread highlighted
        if (isFirstChat) {
            setAllThreads(prev => [
                { threadId: currThreadId, title: sentPrompt },
                ...prev.filter(t => t.threadId !== currThreadId)
            ]);
            setCurrThreadId(currThreadId);
        }

        setPrompt("");
        setSelectedImage(null);

        try {

            const response = await clientServer.post("/api/chat", {
                message: sentPrompt,
                threadId: currThreadId,
                model: selectedModel,
                image: sentImage ? { data: sentImage.base64, mimeType: sentImage.mimeType } : null
            });

            const res = response.data;

            setReply(res.reply);
            setPrevChats(prevChats => [
                ...prevChats,
                {
                    role: "user",
                    content: sentPrompt,
                    image: sentImage ? { data: sentImage.base64, mimeType: sentImage.mimeType } : null
                },
                {
                    role: "assistent",
                    content: res.reply,
                    image: res.image || null
                }
            ]);

            if (res.prompts !== undefined) {
                setCountPrompt(res.prompts);
            } else {
                setCountPrompt(prev => prev + 1);
            }
            if (res.totalTokensUsed !== undefined) {
                setTotalTokensUsed(res.totalTokensUsed);
            }

            if(!threadId) {
                if (skipNextFetchRef) {
                    skipNextFetchRef.current = true;
                }
                navigation(`/${currThreadId}`, {replace:true});
            }

            if (user && getAllThreads) {
                getAllThreads();
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

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage({
                preview: URL.createObjectURL(file),
                base64: reader.result.split(",")[1],
                mimeType: file.type
            });
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };
>>>>>>> origin/main


    const handleProfileClick = () => {
        setIsOpen(!isOpen);
    }


    return (
        <div className="chatWindow">
            <div className="navbar">
<<<<<<< HEAD

                <span>Gemini </span>
                <div className="userIconDiv" onClick={handleProfileClick}>
                    <span className="userIcon"><i className="fa-solid fa-user"></i></span>
                </div>

            </div>

            {backendStatus !== "connected" && (
                <div className={`backendStatus ${backendStatus}`} role="status" aria-live="polite">
                    <span className="backendStatusDot" aria-hidden="true"></span>
                    {backendStatus === "connecting"
                        ? "Connecting to backend. Free Render services can take up to a minute to wake after inactivity."
                        : "Backend is unavailable. Retrying connection…"}
                </div>
            )}

            {
                isOpen && 
                <div className='dropDown'>
                    <div className='dropDownItem'><i class="fa-solid fa-cloud-arrow-up"></i> Upgrade plan</div>
                    <div className='dropDownItem'><i class="fa-solid fa-gear"></i> Settings</div>
                    <div className='dropDownItem'><i class="fa-solid fa-arrow-right-from-bracket"></i> Log out</div>
=======
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
>>>>>>> origin/main
                </div>
            }

            <Chat></Chat>

            <ScaleLoader color="white" loading={loading}></ScaleLoader>
            
            <div className="chatInput">
<<<<<<< HEAD
                <div className="inputBox">
                    <input value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => e.key==="Enter" ? GetReply() : null } type="text" placeholder="Ask anything" />
                    <div id='submit' onClick={GetReply}><i className="fa-solid fa-paper-plane"></i></div>
                </div>
                <p className="info">Gemini is AI and can make mistakes</p>
            </div>




=======
                {selectedImage && (
                    <div className='imagePreviewContainer'>
                        <img src={selectedImage.preview} alt="pasted" className='pastedThumbnail' />
                        <button className="removeImageBtn" onClick={() => setSelectedImage(null)}>
                            <i className='fa-solid fa-xmark'></i>
                        </button>
                    </div>
                )}
                <div className="inputBox">
                    {/* Attach Image Button */}
                        <label className="imageUploadBtn" title="Attach image">
                            <i className="fa-regular fa-image"></i>
                            <input 
                                type="file" 
                                accept="image/*" 
                                style={{ display: "none" }} 
                                onChange={handleImageSelect}
                                disabled={countPrompts >= maxPrompts || loading}
                            />
                        </label>
                        
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
                                    {MODELS.map(model => {
                                        const isLocked = model.lockedForGuests && !user;
                                        return (
                                            <div 
                                                key={model.id} 
                                                className={`modelOptionItem ${selectedModel === model.id ? "active" : ""} ${isLocked ? "locked" : ""}`} 
                                                onClick={() => handleSelectModel(model)}
                                                title={isLocked ? "Sign in to unlock Gemini 4 Argon" : ""}
                                            >
                                                <div className="modelOptionInfo">
                                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                        <span className="modelOptionTitle">{model.label}</span>
                                                        {isLocked && <i className="fa-solid fa-lock modelLockIcon" title="Requires Sign In"></i>}
                                                    </div>
                                                    {model.badge && (
                                                        <span className={`modelOptionBadge ${model.badge === "Pro" ? "proBadge" : model.badge === "Nano" ? "nanoBadge" : ""}`}>
                                                            {model.badge} {isLocked && "• Locked"}
                                                        </span>
                                                    )}
                                                </div>
                                                {selectedModel === model.id && (
                                                    <i className="fa-solid fa-check modelCheckIcon"></i>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div 
                            id='submit' 
                            onClick={GetReply}
                            style={{ 
                                opacity: (countPrompts >= maxPrompts || (!prompt.trim() && !selectedImage)) ? 0.4 : 1, 
                                cursor: (countPrompts >= maxPrompts || (!prompt.trim() && !selectedImage)) ? "not-allowed" : "pointer" 
                            }}
                        >
                            <i className="fa-solid fa-paper-plane"></i>
                        </div>
                    </div>
                </div>
                <p className="info">
                    This is Ai and can make mistakes • Prompts: {countPrompts}/{maxPrompts} {!user && "(Guest mode)"}
                </p>
                <div className='gptDiv'>
                    <p>Tokens used: {totalTokensUsed}</p>
                </div>
            </div>

>>>>>>> origin/main
        </div>
    );
}

export default ChatWindow;