import React, { useState, useEffect, useRef } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Chat({ chatWith, messages: initialMessages }) {
    const { auth } = usePage().props;
    const Auth = auth;

    const [messages, setMessages] = useState(initialMessages || []);
    const [newMessage, setNewMessage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const [showOptions, setShowOptions] = useState(false);
    const [reportModal, setReportModal] = useState(false);
    const [blockConfirm, setBlockConfirm] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportDescription, setReportDescription] = useState('');

    // Pagination State
    const [isLoadingOlder, setIsLoadingOlder] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const containerRef = useRef(null);
    const scrollRef = useRef(null); // Ref for scrolling to bottom (initial)
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

    const handleReport = async () => {
        if (!reportReason) return;
        try {
            await axios.post('/api/reports', {
                reported_id: chatWith.id,
                reason: reportReason,
                description: reportDescription
            });
            setShowOptions(false);
            setReportModal(false);
            alert("Signalement envoyé.");
            router.visit(route('chat'));
        } catch (err) {
            console.error(err);
        }
    };

    const handleBlock = async () => {
        try {
            await axios.post('/api/blocks', { blocked_id: chatWith.id });
            setShowOptions(false);
            setBlockConfirm(false);
            alert("Utilisateur bloqué.");
            router.visit(route('chat'));
        } catch (err) {
            console.error(err);
        }
    };

    const reportReasons = [
        "Contenu inapproprié",
        "Harcèlement",
        "Faux profil",
        "Comportement suspect",
        "Autre"
    ];

    const timerRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    // Scroll handling for infinite scroll
    const handleScroll = async (e) => {
        const container = e.target;

        // Check if scrolled to top and not loading and has more
        if (container.scrollTop === 0 && !isLoadingOlder && hasMore) {
            setIsLoadingOlder(true);
            const oldScrollHeight = container.scrollHeight;

            try {
                const offset = messages.length;
                const response = await axios.get(`/api/messages/${chatWith.id}/fetch?offset=${offset}`);

                const newMessages = response.data;

                if (newMessages.length < 20) {
                    setHasMore(false);
                }

                if (newMessages.length > 0) {
                    setMessages(prev => [...newMessages, ...prev]); // Prepend older messages (already ASC from API)

                    // Restore scroll position
                    requestAnimationFrame(() => {
                        container.scrollTop = container.scrollHeight - oldScrollHeight;
                    });
                }
            } catch (error) {
                console.error("Failed to fetch older messages", error);
            } finally {
                setIsLoadingOlder(false);
                setShouldScrollToBottom(false); // Disable auto-scroll to bottom when loading old
            }
        }
    };

    // Auto-scroll to bottom only when sending/receiving new messages, not when loading old
    useEffect(() => {
        if (shouldScrollToBottom && scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'auto' });
        }
    }, [messages, shouldScrollToBottom]);

    // Re-enable auto-scroll when user sends a message
    const enableAutoScroll = () => setShouldScrollToBottom(true);


    useEffect(() => {
        if (typeof window !== 'undefined' && window.Echo) {
            console.log("Echo: Connecting to private channel", `chat.${Auth.user.id}`);
            const channel = window.Echo.private(`chat.${Auth.user.id}`);

            channel.subscribed(() => {
                console.log("Echo: Subscribed to channel !");
            }).error((err) => {
                console.error("Echo: Subscription error:", err);
            });

            channel.listen('.message.sent', (data) => {
                console.log("Echo: Received message.sent", data);
                if (data.from_id === chatWith.id) {
                    setMessages(prev => [...prev, {
                        ...data,
                        created_at: new Date().toISOString(),
                    }]);

                    window.axios.post('/api/notifications/read', { from_id: chatWith.id });
                    setShouldScrollToBottom(true);
                }
            });

            return () => {
                console.log("Echo: Leaving channel");
                window.Echo.leave(`chat.${Auth.user.id}`);
            };
        }
    }, [chatWith.id]);

    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
            setRecordingTime(0);
        }
        return () => clearInterval(timerRef.current);
    }, [isRecording]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatMessageDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const startRecording = async () => {
        if (isRecording) {
            stopRecording();
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                if (chunksRef.current.length > 0 && !cancelRecordingRef.current) {
                    sendVoiceMessage(blob);
                }
                cancelRecordingRef.current = false;
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Erreur micro:", err);
            alert("Accès micro refusé ou non supporté.");
        }
    };

    const cancelRecordingRef = useRef(false);

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleCancelRecording = () => {
        cancelRecordingRef.current = true;
        stopRecording();
    };

    const sendVoiceMessage = async (blob) => {
        enableAutoScroll();
        try {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const base64data = reader.result;

                // Optimistic Update
                const optimisticMsg = {
                    id: Date.now(),
                    from_id: Auth.id, // Need to ensure Auth is accessible or use a prop
                    to_id: chatWith.id,
                    content: '',
                    type: 'voice',
                    duration: formatTime(recordingTime),
                    created_at: new Date().toISOString(),
                    is_optimistic: true
                };
                setMessages(prev => [...prev, optimisticMsg]);

                const response = await window.axios.post('/api/messages', {
                    to_id: chatWith.id,
                    content: '',
                    type: 'voice',
                    media: base64data,
                    duration: formatTime(recordingTime)
                });

                setMessages(prev => prev.map(m => m.is_optimistic && m.id === optimisticMsg.id ? response.data : m));
            };
        } catch (err) {
            console.error("Erreur envoi note vocale:", err);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        enableAutoScroll();
        const formData = new FormData();
        formData.append('media', file);
        formData.append('to_id', chatWith.id);
        formData.append('type', 'image');

        try {
            const response = await window.axios.post('/api/messages', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessages([...messages, response.data]);
        } catch (err) {
            console.error("Erreur envoi image:", err);
        }
    };

    const handleSend = async () => {
        if (!newMessage.trim()) return;
        const text = newMessage;
        setNewMessage('');
        enableAutoScroll();

        // Optimistic Update
        const optimisticMsg = {
            id: Date.now(),
            from_id: Auth.id, // Assuming Auth.id is available, might need to pass it or use usePage
            to_id: chatWith.id,
            content: text,
            type: 'text',
            created_at: new Date().toISOString(),
            is_optimistic: true
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            const response = await window.axios.post('/api/messages', {
                to_id: chatWith.id,
                content: text,
                type: 'text'
            });
            setMessages(prev => prev.map(m => m.is_optimistic && m.id === optimisticMsg.id ? response.data : m));
        } catch (err) {
            console.error("Erreur envoi message:", err);
            // Rollback optimistic update
            setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#101322] flex flex-col font-sans text-[#101322] dark:text-white transition-colors duration-500">
            <Head title={`Chat avec ${chatWith?.name}`} />

            {/* Chat Header */}
            <div className="bg-white dark:bg-[#161b2e] px-4 py-3 flex items-center justify-between border-b border-black/5 dark:border-white/10 z-10 shadow-sm transition-colors duration-500 sticky top-0">
                <div className="flex items-center space-x-3">
                    <button onClick={() => router.visit('/chat')} className="size-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-[#1a1f35] active:bg-gray-200 transition-all">
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">arrow_back</span>
                    </button>
                    <div className="flex items-center gap-3" onClick={() => router.visit(route('profile', chatWith.id))}>
                        <div className="relative cursor-pointer">
                            <img src={chatWith?.avatar || 'https://via.placeholder.com/100'} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" alt="Avatar" />
                            {chatWith?.is_online && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#161b2e] rounded-full"></div>
                            )}
                        </div>
                        <div className="cursor-pointer">
                            <h2 className="font-bold text-sm text-[#101322] dark:text-white leading-tight">{chatWith?.name}</h2>
                            <span className={`text-xs ${chatWith?.is_online ? 'text-green-500' : 'text-gray-400'}`}>
                                {chatWith?.is_online ? 'En ligne' : 'Hors ligne'}
                            </span>
                        </div>
                    </div>
                </div>
                <button onClick={() => setShowOptions(true)} className="size-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-[#1a1f35] active:bg-gray-200 transition-all">
                    <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">more_vert</span>
                </button>
            </div>

            {/* Options Menu (Report/Block) */}
            <AnimatePresence>
                {showOptions && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowOptions(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="relative w-full max-w-md bg-white dark:bg-[#161b2e] rounded-t-[2rem] p-6 border-t border-black/5 dark:border-white/10 shadow-2xl transition-colors duration-500"
                        >
                            <div className="w-12 h-1 bg-gray-200 dark:bg-white/10 rounded-full mx-auto mb-6" />
                            <h3 className="text-lg font-bold mb-4 text-center text-[#101322] dark:text-white">Options</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => { setReportModal(true); setShowOptions(false); }}
                                    className="w-full py-3.5 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center gap-3 text-red-500 font-bold active:scale-95 transition-all"
                                >
                                    <span className="material-symbols-outlined">report</span>
                                    Signaler
                                </button>
                                <button
                                    onClick={() => { setBlockConfirm(true); setShowOptions(false); }}
                                    className="w-full py-3.5 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center gap-3 text-gray-500 dark:text-gray-400 font-bold active:scale-95 transition-all"
                                >
                                    <span className="material-symbols-outlined">block</span>
                                    Bloquer
                                </button>
                                <button onClick={() => setShowOptions(false)} className="w-full py-3.5 rounded-xl bg-gray-100 dark:bg-white/10 text-[#101322] dark:text-white font-bold mt-2">
                                    Annuler
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Initiation Overlay */}
            {!messages.some(m => !m.is_optimistic && m.from_id === Auth.user.id) && messages.some(m => m.from_id === chatWith.id) && (
                <div className="absolute inset-0 z[30] bg-[#101322]/40 backdrop-blur-md flex items-center justify-center p-6">
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white dark:bg-[#161b2e] p-8 rounded-[2.5rem] shadow-2xl border border-black/5 dark:border-white/10 text-center max-w-sm">
                        <div className="size-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#D4AF37]">
                            <span className="material-symbols-outlined text-4xl">chat_bubble</span>
                        </div>
                        <h3 className="text-xl font-black italic tracking-tighter mb-2 text-[#101322] dark:text-white">{chatWith.name} souhaite discuter</h3>
                        <p className="text-xs text-gray-500 mb-8 leading-relaxed">Voulez-vous accepter cette discussion ou bloquer cet utilisateur ?</p>
                        <div className="flex gap-3">
                            <button onClick={handleBlock} className="flex-1 py-4 rounded-2xl bg-gray-100 dark:bg-white/10 font-black text-[10px] uppercase tracking-widest text-[#101322] dark:text-white transition-all active:scale-95">Bloquer</button>
                            <button onClick={() => setNewMessage('Bonjour !')} className="flex-1 py-4 rounded-2xl bg-[#D4AF37] text-[#101322] font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#D4AF37]/20 active:scale-95 transition-all">Discuter</button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Messages Area */}
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4"
            >
                {isLoadingOlder && (
                    <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {messages.map((msg, idx) => {
                    const isMine = msg.from_id !== chatWith?.id;
                    const isLast = idx === messages.length - 1;

                    // Logique de séparateur de date
                    const msgDate = new Date(msg.created_at);
                    const prevMsg = idx > 0 ? messages[idx - 1] : null;
                    const prevDate = prevMsg ? new Date(prevMsg.created_at) : null;
                    const showSeparator = !prevDate || msgDate.toDateString() !== prevDate.toDateString();

                    const dateLabel = (date) => {
                        const today = new Date();
                        const yesterday = new Date();
                        yesterday.setDate(today.getDate() - 1);

                        if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
                        if (date.toDateString() === yesterday.toDateString()) return "Hier";
                        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
                    };

                    return (
                        <React.Fragment key={msg.id}>
                            {showSeparator && (
                                <div className="flex justify-center my-6">
                                    <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-[10px] font-bold text-gray-500 dark:text-gray-400">
                                        {dateLabel(msgDate)}
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
                                    : 'bg-white dark:bg-[#161b2e] text-[#101322] dark:text-white rounded-[1.5rem] rounded-tl-lg border border-gray-100 dark:border-white/5'} px-4 py-3 shadow-sm relative group`}>

                                    {msg.type === 'text' ? (
                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                    ) : msg.type === 'voice' ? (
                                        <div className="flex items-center space-x-3 w-48">
                                            <button className={`size-8 rounded-full flex items-center justify-center shrink-0 ${isMine ? 'bg-[#101322]/10' : 'bg-[#D4AF37]/20'} text-current`}>
                                                <span className="material-symbols-outlined text-lg">play_arrow</span>
                                            </button>
                                            <div className="flex-1">
                                                <div className="h-1 bg-current opacity-20 rounded-full w-full overflow-hidden mb-1">
                                                    <div className="h-full bg-current w-1/3 rounded-full"></div>
                                                </div>
                                                <span className="text-[10px] font-bold opacity-70">{msg.duration || '0:00'}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-xl overflow-hidden mb-1">
                                            <img src={msg.media_path} className="max-w-full h-auto max-h-60 object-cover" alt="Media" />
                                        </div>
                                    )}

                                    <div className={`text-[9px] mt-1 flex items-center justify-end gap-1 opacity-60 font-medium`}>
                                        {formatMessageDate(msg.created_at)}
                                        {isMine && (
                                            <span className="material-symbols-outlined text-[10px]">
                                                {msg.is_read ? 'done_all' : 'done'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </React.Fragment>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            {/* Input Bar (Redesigned) */}
            <div className="p-4 bg-white dark:bg-[#161b2e] border-t border-gray-100 dark:border-white/5 transition-colors duration-500">
                <div className="flex items-center gap-2">
                    {/* Attachments */}
                    <button
                        onClick={() => document.getElementById('galleryInput').click()}
                        className="size-10 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">add</span>
                        <input type="file" id="galleryInput" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </button>

                    {/* Input Field */}
                    <div className="flex-1 bg-gray-100 dark:bg-[#1a1f35] rounded-full flex items-center px-2 py-1 transition-colors duration-500">
                        {isRecording ? (
                            <div className="flex-1 flex items-center px-2 py-1.5 gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="size-2 bg-red-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs font-bold text-red-500">{formatTime(recordingTime)}</span>
                                </div>
                                <span className="text-xs text-gray-400">Enregistrement...</span>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => document.getElementById('cameraInput').click()}
                                    className="size-8 rounded-full flex items-center justify-center text-gray-400 hover:text-[#D4AF37] transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">photo_camera</span>
                                    <input type="file" id="cameraInput" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Message..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-2 text-[#101322] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 font-medium"
                                />
                            </>
                        )}

                        {/* Mic / Send Button (Inside Input) */}
                        <div className="pr-1">
                            {!newMessage.trim() && !isRecording ? (
                                <button
                                    onClick={startRecording}
                                    className="size-8 rounded-full flex items-center justify-center text-gray-400 hover:text-[#D4AF37] hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">mic</span>
                                </button>
                            ) : isRecording ? (
                                <button
                                    onClick={handleCancelRecording}
                                    className="size-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">close</span>
                                </button>
                            ) : null}
                        </div>
                    </div>

                    {/* Send Button (Outside if typing, or Stop Rec if recording) */}
                    {(newMessage.trim() || isRecording) && (
                        <button
                            onClick={isRecording ? stopRecording : handleSend}
                            className={`size-10 rounded-full flex items-center justify-center text-white shadow-md transition-all active:scale-95 ${isRecording ? 'bg-red-500' : 'bg-[#D4AF37]'
                                }`}
                        >
                            <span className="material-symbols-outlined text-xl">{isRecording ? 'send' : 'send'}</span>
                        </button>
                    )}
                </div>
            </div>
            {/* <div className="h-4"></div> Space for bottom nav if needed */}
        </div>
    );
}
