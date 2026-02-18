import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import RecordRTC from 'recordrtc';
import VoicePlayer from '../components/ui/VoicePlayer';
import { useAuth } from '../contexts/AuthProvider';

export default function Chat() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: authUser } = useAuth();

    const [chatWith, setChatWith] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    // Input & Recording State
    const [newMessage, setNewMessage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const timerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const recorderRef = useRef(null);
    const cancelRecordingRef = useRef(false);

    // Options Modal State
    const [showOptions, setShowOptions] = useState(false);
    const [reportModal, setReportModal] = useState(false);
    const [blockConfirm, setBlockConfirm] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportDescription, setReportDescription] = useState('');

    // Pagination/Scroll
    const [isLoadingOlder, setIsLoadingOlder] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const scrollContainerRef = useRef(null);
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

    // Initial Fetch
    useEffect(() => {
        fetchChatData();
    }, [id]);

    const fetchChatData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/chat/${id}`);
            setChatWith(response.data.chatWith);
            setMessages(response.data.messages || []);
            setShouldScrollToBottom(true);
        } catch (error) {
            console.error("Error fetching chat:", error);
            if (error.response && error.response.status === 404) {
                navigate('/chat');
            }
        } finally {
            setLoading(false);
        }
    };

    // Real-time (Echo)
    useEffect(() => {
        if (!authUser || !id) return;

        // Ensure Echo is available
        const echo = window.Echo;
        if (!echo) return;

        console.log(`Subscribing to chat.${authUser.id}`);
        const channel = echo.private(`chat.${authUser.id}`);

        channel.listen('.MessageSent', (data) => {
            console.log("Message received:", data);
            // Verify if the message is from the current chat user
            // The event might broadcast the whole message object or just data
            // Assuming data is the message object or contains it
            const msg = data.message || data;

            if (msg.from_id == id) { // Loose comparison for string/int
                setMessages(prev => [...prev, { ...msg, created_at: new Date().toISOString() }]);
                setShouldScrollToBottom(true);
                // Mark as read
                axios.post('/api/notifications/read', { from_id: id });
            }
        });

        // Also listen for 'message.sent' if the event name is different in backend
        channel.listen('MessageSent', (data) => {
            // Redundant listener just in case naming varies
            const msg = data.message || data;
            if (msg.from_id == id) {
                setMessages(prev => {
                    if (prev.find(m => m.id === msg.id)) return prev;
                    return [...prev, { ...msg, created_at: new Date().toISOString() }];
                });
                setShouldScrollToBottom(true);
                axios.post('/api/notifications/read', { from_id: id });
            }
        });

        return () => {
            echo.leave(`chat.${authUser.id}`);
        };
    }, [id, authUser]);

    // Scroll to bottom
    useEffect(() => {
        if (shouldScrollToBottom && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            setShouldScrollToBottom(false);
        }
    }, [messages, shouldScrollToBottom]);

    // Recording Timer
    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
        } else {
            clearInterval(timerRef.current);
            setRecordingTime(0);
        }
        return () => clearInterval(timerRef.current);
    }, [isRecording]);

    // Infinite Scroll
    const handleScroll = async (e) => {
        const container = e.target;
        if (container.scrollTop === 0 && !isLoadingOlder && hasMore && messages.length >= 20) {
            setIsLoadingOlder(true);
            const oldScrollHeight = container.scrollHeight;
            try {
                const offset = messages.length;
                const response = await axios.get(`/api/messages/${id}?offset=${offset}`);
                const olderMessages = response.data;

                if (olderMessages.length < 20) setHasMore(false);
                if (olderMessages.length > 0) {
                    setMessages(prev => [...olderMessages, ...prev]);
                    // Maintain scroll position
                    requestAnimationFrame(() => {
                        container.scrollTop = container.scrollHeight - oldScrollHeight;
                    });
                }
            } catch (err) {
                console.error("Error loading older messages:", err);
            } finally {
                setIsLoadingOlder(false);
            }
        }
    };

    // Actions
    const handleSend = async () => {
        if (!newMessage.trim()) return;
        const text = newMessage;
        setNewMessage('');

        // Optimistic Update
        const tempId = Date.now();
        const optimisticMsg = {
            id: tempId,
            from_id: authUser.id,
            to_id: parseInt(id),
            content: text,
            type: 'text',
            created_at: new Date().toISOString(),
            is_optimistic: true
        };
        setMessages(prev => [...prev, optimisticMsg]);
        setShouldScrollToBottom(true);

        try {
            const response = await axios.post('/api/messages', {
                to_id: id,
                content: text,
                type: 'text'
            });
            // Replace optimistic
            setMessages(prev => prev.map(m => m.id === tempId ? response.data : m));
        } catch (err) {
            console.error("Failed to send:", err);
            setMessages(prev => prev.filter(m => m.id !== tempId)); // Remove if failed
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('media', file);
        formData.append('to_id', id);
        formData.append('type', 'image');

        // Optimistic placeholder could be complex for images, skipping for now
        setShouldScrollToBottom(true);

        try {
            const response = await axios.post('/api/messages', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessages(prev => [...prev, response.data]);
        } catch (err) {
            console.error("Error sending image:", err);
            alert("Erreur lors de l'envoi de l'image.");
        }
    };

    // Recording Logic
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            recorderRef.current = new RecordRTC(stream, {
                type: 'audio',
                mimeType: 'audio/webm',
                recorderType: RecordRTC.StereoAudioRecorder,
                numberOfAudioChannels: 1,
                desiredSampRate: 16000,
            });
            recorderRef.current.startRecording();
            setIsRecording(true);
        } catch (err) {
            console.error(err);
            alert("Impossible d'accéder au microphone.");
        }
    };

    const stopRecording = () => {
        if (recorderRef.current) {
            recorderRef.current.stopRecording(() => {
                const blob = recorderRef.current.getBlob();
                setIsRecording(false);
                if (!cancelRecordingRef.current) {
                    sendVoiceMessage(blob);
                }
                // Cleanup
                recorderRef.current.stream.getTracks().forEach(t => t.stop());
                cancelRecordingRef.current = false;
            });
        }
    };

    const sendVoiceMessage = async (blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
            const base64 = reader.result;

            // Optimistic
            const tempId = Date.now();
            const optimisticMsg = {
                id: tempId,
                from_id: authUser.id,
                to_id: parseInt(id),
                content: '',
                type: 'voice',
                media_path: null, // No local preview easy for blob without URL.createObjectURL
                duration: formatTime(recordingTime),
                created_at: new Date().toISOString(),
                is_optimistic: true
            };
            setMessages(prev => [...prev, optimisticMsg]);
            setShouldScrollToBottom(true);

            try {
                const response = await axios.post('/api/messages', {
                    to_id: id,
                    content: '',
                    type: 'voice',
                    media: base64,
                    duration: formatTime(recordingTime)
                });
                setMessages(prev => prev.map(m => m.id === tempId ? response.data : m));
            } catch (err) {
                console.error("Voice send failed:", err);
                setMessages(prev => prev.filter(m => m.id !== tempId));
            }
        };
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const reportReasons = ["Contenu inapproprié", "Harcèlement", "Faux profil", "Comportement suspect", "Autre"];

    const handleBlock = async () => {
        if (!confirm(`Bloquer ${chatWith.name} ?`)) return;
        try {
            await axios.post('/api/blocks', { blocked_id: id });
            navigate('/chat');
        } catch (err) { console.error(err); }
    };

    const handleReportSubmit = async () => {
        if (!reportReason) return;
        try {
            await axios.post('/api/reports', {
                reported_id: id,
                reason: reportReason,
                description: reportDescription
            });
            setShowOptions(false);
            setReportModal(false);
            alert("Signalement envoyé.");
            navigate('/chat');
        } catch (err) { console.error(err); }
    };

    if (loading || !chatWith) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#101322]">
                <div className="size-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ right: 0.2 }}
            onDragEnd={(e, { offset, velocity }) => {
                if (offset.x > 100) {
                    navigate('/chat');
                }
            }}
            className="h-screen bg-gray-50 dark:bg-[#101322] flex flex-col font-['Be_Vietnam_Pro'] text-[#101322] dark:text-white transition-colors duration-500 overflow-hidden"
        >
            {/* Header */}
            <div className="bg-white dark:bg-[#161b2e] px-4 py-3 flex items-center justify-between border-b border-black/5 dark:border-white/10 z-10 shadow-sm transition-colors duration-500 sticky top-0">
                <div className="flex items-center space-x-3">
                    <button onClick={() => navigate('/chat')} className="size-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-[#1a1f35] active:bg-gray-200 transition-all">
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">arrow_back</span>
                    </button>
                    <div className="flex items-center gap-3" onClick={() => navigate(`/profile/${id}`)}>
                        <div className="relative cursor-pointer">
                            <img src={chatWith.avatar || 'https://via.placeholder.com/100'} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" alt="Avatar" />
                            {chatWith.is_online && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#161b2e] rounded-full"></div>
                            )}
                        </div>
                        <div className="cursor-pointer">
                            <h2 className="font-bold text-sm text-[#101322] dark:text-white leading-tight">{chatWith.name}</h2>
                            <span className={`text-xs ${chatWith.is_online ? 'text-green-500' : 'text-gray-400'}`}>
                                {chatWith.is_online ? 'En ligne' : 'Hors ligne'}
                            </span>
                        </div>
                    </div>
                </div>
                <button onClick={() => setShowOptions(true)} className="size-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-[#1a1f35] active:bg-gray-200 transition-all">
                    <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">more_vert</span>
                </button>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 custom-scrollbar"
            >
                {isLoadingOlder && (
                    <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {messages.map((msg, idx) => {
                    const isMine = msg.from_id === authUser.id;
                    const dateMsg = new Date(msg.created_at);
                    const prevMsg = idx > 0 ? messages[idx - 1] : null;
                    const prevDate = prevMsg ? new Date(prevMsg.created_at) : null;
                    const showSeparator = !prevDate || dateMsg.toDateString() !== prevDate.toDateString();

                    return (
                        <React.Fragment key={msg.id || idx}>
                            {showSeparator && (
                                <div className="flex justify-center my-6">
                                    <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-[10px] font-bold text-gray-500 dark:text-gray-400">
                                        {dateMsg.toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                            <motion.div
                                initial={{ opacity: 0, x: isMine ? 20 : -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                            >
                                <div className={`max-w-[80%] ${isMine
                                    ? 'bg-[#D4AF37] text-[#101322] rounded-[1.5rem] rounded-tr-lg'
                                    : 'bg-white dark:bg-[#161b2e] text-[#101322] dark:text-white rounded-[1.5rem] rounded-tl-lg border border-black/5 dark:border-white/5'} px-4 py-3 shadow-sm relative group`}>

                                    {msg.type === 'text' ? (
                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                    ) : msg.type === 'voice' ? (
                                        <VoicePlayer src={msg.media_path} duration={msg.duration} isMine={isMine} />
                                    ) : (
                                        <img src={msg.media_path} className="max-w-full h-auto rounded-lg" alt="Media" />
                                    )}

                                    <div className={`text-[9px] mt-1 flex items-center justify-end gap-1 opacity-60 font-medium`}>
                                        {dateMsg.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {isMine && !msg.is_optimistic && (
                                            <span className="material-symbols-outlined text-[10px]">
                                                {msg.is_read ? 'done_all' : 'done'}
                                            </span>
                                        )}
                                        {msg.is_optimistic && <span className="material-symbols-outlined text-[10px] animate-pulse">schedule</span>}
                                    </div>
                                </div>
                            </motion.div>
                        </React.Fragment>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-[#161b2e] border-t border-black/5 dark:border-white/5 transition-colors duration-500 sticky bottom-0">
                <div className="flex items-center gap-2">
                    {!isRecording && (
                        <button onClick={() => document.getElementById('galleryInput').click()} className="size-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                            <span className="material-symbols-outlined text-xl">add</span>
                            <input type="file" id="galleryInput" accept="image/*" className="hidden" onChange={handleFileUpload} />
                        </button>
                    )}

                    <div className={`flex-1 ${isRecording ? 'bg-red-500/10' : 'bg-gray-100 dark:bg-[#1a1f35]'} rounded-full flex items-center px-4 py-1 transition-all duration-300`}>
                        {isRecording ? (
                            <div className="flex-1 flex items-center justify-between py-1.5">
                                <div className="flex items-center gap-3">
                                    <div className="size-2 bg-red-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-black text-red-500 italic tracking-tighter uppercase">{formatTime(recordingTime)}</span>
                                </div>
                                <button onClick={() => { cancelRecordingRef.current = true; stopRecording(); }} className="text-[10px] font-black uppercase text-red-500 italic hover:underline">Annuler</button>
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Message..."
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-2 text-[#101322] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 font-medium"
                            />
                        )}
                    </div>

                    <button
                        onClick={newMessage.trim() ? handleSend : (isRecording ? stopRecording : startRecording)}
                        className={`size-12 rounded-full flex items-center justify-center text-white shadow-xl transition-all active:scale-90 ${isRecording ? 'bg-green-500 animate-pulse' : 'bg-[#D4AF37]'} ${(newMessage.trim() || isRecording) ? 'scale-100' : 'scale-95 opacity-80'}`}
                    >
                        <span className="material-symbols-outlined text-[24px]">
                            {newMessage.trim() ? 'send' : (isRecording ? 'check' : 'mic')}
                        </span>
                    </button>
                </div>
            </div>

            {/* Options Modal */}
            <AnimatePresence>
                {showOptions && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowOptions(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative w-full max-w-md bg-white dark:bg-[#161b2e] rounded-t-[2rem] p-6 border-t border-black/5 dark:border-white/10 shadow-2xl transition-colors duration-500">
                            <div className="space-y-3">
                                <button onClick={() => { setReportModal(true); setShowOptions(false); }} className="w-full py-3.5 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center gap-3 text-red-500 font-bold">
                                    <span className="material-symbols-outlined">report</span> Signaler
                                </button>
                                <button onClick={handleBlock} className="w-full py-3.5 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center gap-3 text-gray-500 font-bold">
                                    <span className="material-symbols-outlined">block</span> Bloquer
                                </button>
                                <button onClick={() => setShowOptions(false)} className="w-full py-3.5 rounded-xl bg-gray-100 dark:bg-white/10 text-[#101322] dark:text-white font-bold mt-2">Annuler</button>
                            </div>
                        </motion.div>
                    </div>
                )}
                {reportModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative bg-white dark:bg-[#161b2e] w-full max-w-sm rounded-[2.5rem] p-8 border border-black/5 dark:border-white/10 shadow-2xl transition-colors duration-500">
                            <h3 className="text-xl font-black italic tracking-tight mb-6 text-[#101322] dark:text-white">Signaler</h3>
                            <div className="space-y-2 mb-6">
                                {reportReasons.map(reason => (
                                    <button key={reason} onClick={() => setReportReason(reason)} className={`w-full p-4 rounded-2xl text-xs font-bold text-left transition-all ${reportReason === reason ? 'bg-[#D4AF37] text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-500'}`}>{reason}</button>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setReportModal(false)} className="flex-1 py-4 rounded-2xl bg-white/10 font-bold text-xs">Annuler</button>
                                <button onClick={handleReportSubmit} disabled={!reportReason} className="flex-1 py-4 rounded-2xl bg-red-500 font-black text-xs uppercase text-white tracking-widest disabled:opacity-50">Confirmer</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
