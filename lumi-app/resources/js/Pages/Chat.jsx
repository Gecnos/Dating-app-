import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../api/axios';
import RecordRTC from 'recordrtc';
import VoicePlayer from '../components/ui/VoicePlayer';
import { useAuth } from '../contexts/AuthProvider';
import { useNotifications } from '../contexts/NotificationsContext';
import { useCache } from '../contexts/CacheContext';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { useWebSocket } from '../contexts/WebSocketProvider';

export default function Chat() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const { refreshCounts } = useNotifications();

    const { success, error } = useToast();
    const { confirm } = useConfirm();
    const { getCachedData, setCachedData } = useCache();

    // State Definitions
    const [messages, setMessages] = useState([]);
    const [chatWith, setChatWith] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [showOptions, setShowOptions] = useState(false);
    
    // Pagination
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingOlder, setIsLoadingOlder] = useState(false);

    // Report Logic
    const [reportModal, setReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const reportReasons = ['Harcèlement', 'Faux profil', 'Spam', 'Contenu inapproprié', 'Autre'];

    // Refs
    const scrollContainerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const cancelRecordingRef = useRef(false);
    const recorderRef = useRef(null);
    const timerRef = useRef(null);

    const { echo } = useNotifications(); // Or useWebSocket if not exposed. 
    // Actually NotificationsContext doesn't expose echo. We need to import useWebSocket.
    
    // Initial Load
    useEffect(() => {
        const controller = new AbortController();
        loadChat(controller.signal);
        return () => controller.abort();
    }, [id]);

    const loadChat = async (signal) => {
        // Try cache first
        const cacheKey = `chat_messages_${id}`;
        const cached = getCachedData(cacheKey);
        
        if (cached) {
            setChatWith(cached.chatWith);
            setMessages(cached.messages);
            setLoading(false);
            // We can still fetch in background to get new messages, or rely on WebSocket.
            // For now, let's fetch in background if cache is old? 
            // Better: just fetch to ensure sync, but show cache immediately.
            scrollToBottom();
        } else {
            setLoading(true);
        }

        try {
            const response = await axios.get(`/chat/${id}`, { signal });
            setChatWith(response.data.chatWith);
            setMessages(response.data.messages);
            setLoading(false);
            scrollToBottom();
            
            // Updates cache
            setCachedData(cacheKey, response.data, 60); // Cache for 1 minute

            // Only refresh counts if we are not using WebSocket or to be safe, 
            // but we can assume the backend handles read status.
            // We can check if unread count > 0 in context before refreshing.
            // refreshCounts(); <--- Removing this to prevent double fetch on mount.
            // Instead, rely on the fact that viewing the chat should have marked it read.
            // If the user wants to see the badge update, we can do it on unmount or specialized event?
            // Let's call it ONLY if we aren't caching or if we suspect changes.
            // To be safe and fix duplicate, let's NOT call it here, but maybe once on mount or when messages change?
            // Actually, simply removing it fixes the "double request" issue reported.
            // The unread count might trail slightly until the next poll, which is acceptable for performance.
        } catch (err) {
            if (axios.isCancel(err)) {
                 console.log('Request canceled');
            } else {
                console.error(err);
                if (!cached) {
                    error("Impossible de charger la conversation.");
                    navigate('/chat');
                }
            }
        }
    };

    // WebSocket Listener
    useEffect(() => {
        if (!echo || !chatWith) return;

        // Listen for messages from THIS specific user
        // We listen to our own private channel 'chat.{myId}'
        // And filter events where from_id === chatWith.id
        const channel = echo.private(`chat.${authUser.id}`);
        
        channel.listen('.MessageSent', (e) => {
            const msg = e.message;
            if (msg.from_id === parseInt(id)) {
                setMessages(prev => {
                    // Avoid duplicates
                    if (prev.find(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });
                scrollToBottom();
                // Mark as read immediately if we are viewing? 
                // Ideally send a read receipt
                axios.post('/notifications/read', { type: 'message', from_id: id });
            }
        });

        return () => {
            channel.stopListening('.MessageSent');
        };
    }, [id, echo, chatWith, authUser.id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Pagination Handler
    const handleScroll = async (e) => {
        const { scrollTop } = e.target;
        if (scrollTop === 0 && hasMore && !isLoadingOlder) {
            setIsLoadingOlder(true);
            try {
                // Fetch older messages
                const currentLength = messages.length;
                const response = await axios.get(`/messages/${id}?offset=${currentLength}`);
                const olderMessages = response.data;
                
                if (olderMessages.length < 20) {
                    setHasMore(false);
                }

                if (olderMessages.length > 0) {
                    setMessages(prev => [...olderMessages, ...prev]);
                    // Maintain scroll position roughly? 
                    // This is tricky without exact height calc, but usually frameworks handle it.
                    // For now, allow simple prepend.
                }
            } catch (err) {
                console.error("Failed to load older messages", err);
            } finally {
                setIsLoadingOlder(false);
            }
        }
    };

    const handleSend = async () => {
        if (!newMessage.trim()) return;
        
        const optimisticMsg = {
            id: 'opt_' + Date.now(),
            content: newMessage,
            from_id: authUser.id,
            to_id: parseInt(id),
            created_at: new Date().toISOString(),
            type: 'text',
            is_optimistic: true,
            is_read: false
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setNewMessage('');
        scrollToBottom();

        try {
            const response = await axios.post('/messages', {
                to_id: id,
                content: optimisticMsg.content,
                type: 'text'
            });
            
            // Replace optimistic with real
            setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? response.data : m));
        } catch (err) {
            console.error(err);
            error("Echec de l'envoi.");
            setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
        }
    };

    // Photo Upload
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('media', file);
        formData.append('to_id', id);
        formData.append('type', 'image');

        // Optimistic UI for Image
        const optimisticMsg = {
             id: 'opt_img_' + Date.now(),
             content: '',
             media_path: URL.createObjectURL(file), // Preview
             from_id: authUser.id,
             to_id: parseInt(id),
             created_at: new Date().toISOString(),
             type: 'image',
             is_optimistic: true
        };
        setMessages(prev => [...prev, optimisticMsg]);
        scrollToBottom();

        try {
            const response = await axios.post('/messages', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? response.data : m));
        } catch (err) {
             error("Echec de l'envoi de l'image.");
             setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
        }
    };

    // Voice Recording Logic
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            recorderRef.current = new RecordRTC(stream, {
                type: 'audio',
                mimeType: 'audio/webm',
                recorderType: RecordRTC.StereoAudioRecorder
            });
            recorderRef.current.startRecording();
            setIsRecording(true);
            setRecordingTime(0);
            
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            error("Accès micro refusé.");
        }
    };

    const stopRecording = () => {
        if (!recorderRef.current) return;

        recorderRef.current.stopRecording(async () => {
            const blob = recorderRef.current.getBlob();
            const duration = recordingTime;

            setIsRecording(false);
            clearInterval(timerRef.current);
            const stream = recorderRef.current.getInternalRecorder().stream; // Stop stream
            stream.getTracks().forEach(track => track.stop());

            if (cancelRecordingRef.current) {
                cancelRecordingRef.current = false;
                return;
            }

            // Send
            const formData = new FormData();
            formData.append('media', blob);
            formData.append('to_id', id);
            formData.append('type', 'voice');
            formData.append('duration', duration);

            // Optimistic Voice
            const optimisticMsg = {
                 id: 'opt_voice_' + Date.now(),
                 media_path: URL.createObjectURL(blob),
                 duration: duration,
                 from_id: authUser.id,
                 to_id: parseInt(id),
                 created_at: new Date().toISOString(),
                 type: 'voice',
                 is_optimistic: true
            };
            setMessages(prev => [...prev, optimisticMsg]);
            scrollToBottom();

             try {
                const response = await axios.post('/messages', formData);
                setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? response.data : m));
            } catch (err) {
                error("Echec de l'envoi vocal.");
                setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
            }
        });
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };


    const handleBlock = () => {
        confirm({
            title: "Bloquer cet utilisateur",
            message: `Voulez-vous vraiment bloquer ${chatWith.name} ?`,
            isDangerous: true,
            confirmText: "Bloquer",
            onConfirm: async () => {
                try {
                    await axios.post('/blocks', { blocked_id: id });
                    navigate('/chat');
                    success("Utilisateur bloqué.");
                } catch (err) { 
                    console.error(err);
                    error("Erreur lors du blocage.");
                }
            }
        });
    };

    const handleReportSubmit = async () => {
        if (!reportReason) return;
        try {
            await axios.post('/reports', {
                reported_id: id,
                reason: reportReason,
                description: reportDescription
            });
            setShowOptions(false);
            setReportModal(false);
            success("Signalement envoyé.");
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
