import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Chat({ chatWith, messages: initialMessages }) {
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

    const timerRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

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
        try {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const base64data = reader.result;
                const response = await window.axios.post('/api/messages', {
                    to_id: chatWith.id,
                    content: '',
                    type: 'voice',
                    media: base64data,
                    duration: formatTime(recordingTime)
                });
                setMessages([...messages, response.data]);
            };
        } catch (err) {
            console.error("Erreur envoi note vocale:", err);
        }
    };

    const handleSend = async () => {
        if (!newMessage.trim()) return;
        const text = newMessage;
        setNewMessage('');
        try {
            const response = await window.axios.post('/api/messages', {
                to_id: chatWith.id,
                content: text,
                type: 'text'
            });
            setMessages([...messages, response.data]);
        } catch (err) {
            console.error("Erreur envoi message:", err);
        }
    };

    return (
        <div className="min-h-screen bg-[#101322] flex flex-col font-sans text-white">
            <Head title={`Chat avec ${chatWith?.name}`} />

            {/* Chat Header */}
            <div className="bg-[#161b2e] px-6 py-4 flex items-center justify-between border-b border-white/10 z-10 shadow-lg">
                <div className="flex items-center space-x-4">
                    <button onClick={() => router.visit('/chat')} className="size-10 flex items-center justify-center rounded-xl bg-[#1a1f35] border border-white/10 active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-gray-400">arrow_back</span>
                    </button>
                    <div className="relative">
                        <img src={chatWith?.avatar || 'https://via.placeholder.com/100'} className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]/30" alt="Avatar" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#161b2e] rounded-full"></div>
                    </div>
                    <div>
                        <h2 className="font-black italic tracking-tighter uppercase text-sm leading-tight">{chatWith?.name}</h2>
                        <span className="text-[9px] text-green-500 font-black uppercase tracking-widest">En ligne</span>
                    </div>
                </div>
                <button onClick={() => setShowOptions(true)} className="size-10 flex items-center justify-center rounded-xl bg-[#1a1f35] border border-white/10 active:scale-90 transition-transform">
                    <span className="material-symbols-outlined text-gray-400">more_vert</span>
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
                            className="relative w-full max-w-md bg-[#161b2e] rounded-t-[3rem] p-8 border-t border-white/10 shadow-2xl"
                        >
                            <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-8" />
                            <h3 className="text-xl font-black italic tracking-tighter mb-6 text-center">Options de discussion</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => { setReportModal(true); setShowOptions(false); }}
                                    className="w-full py-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center gap-3 text-red-500 font-bold active:scale-95 transition-all"
                                >
                                    <span className="material-symbols-outlined text-xl">report</span>
                                    Signaler cet utilisateur
                                </button>
                                <button
                                    onClick={() => { setBlockConfirm(true); setShowOptions(false); }}
                                    className="w-full py-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center gap-3 text-gray-400 font-bold active:scale-95 transition-all"
                                >
                                    <span className="material-symbols-outlined text-xl">block</span>
                                    Bloquer cet utilisateur
                                </button>
                                <button onClick={() => setShowOptions(false)} className="w-full py-4 rounded-2xl bg-white/10 flex items-center justify-center text-sm font-black uppercase tracking-widest mt-4">
                                    Annuler
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.from_id === chatWith?.id ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[85%] px-5 py-3.5 rounded-3xl text-sm shadow-xl ${msg.from_id !== chatWith?.id
                            ? 'bg-[#D4AF37] text-[#101322] rounded-tr-none font-bold italic'
                            : 'bg-[#161b2e] text-gray-200 rounded-tl-none border border-white/5 font-medium'
                            }`}>
                            {msg.type === 'text' ? (
                                <p className="leading-relaxed">{msg.content}</p>
                            ) : (
                                <div className="flex items-center space-x-4 w-52">
                                    <button className={`size-10 rounded-full flex items-center justify-center shrink-0 ${msg.from_id !== chatWith?.id ? 'bg-[#101322] text-[#D4AF37]' : 'bg-[#D4AF37] text-[#101322]'}`}>
                                        <span className="material-symbols-outlined">play_arrow</span>
                                    </button>
                                    <div className="flex-1 flex flex-col gap-1">
                                        <div className="h-1 bg-current opacity-20 rounded-full w-full"></div>
                                        <span className="text-[10px] font-black italic opacity-60 leading-none">{msg.duration || '0:12'}</span>
                                    </div>
                                </div>
                            )}
                            <div className={`text-[9px] mt-2 flex items-center justify-end gap-1 opacity-60 font-black uppercase`}>
                                {msg.time || '12:45'}
                                {msg.from_id !== chatWith?.id && <span className="material-symbols-outlined text-[10px]">done_all</span>}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>

            {/* Input Bar */}
            <div className="p-6 bg-[#161b2e] border-t border-white/10">
                <div className="flex items-center space-x-3 bg-[#1a1f35] py-2 px-2 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                    {isRecording ? (
                        <div className="flex-1 flex items-center px-4 space-x-4 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center space-x-2 text-red-500">
                                <div className="size-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-black italic tracking-wider">{formatTime(recordingTime)}</span>
                            </div>
                            <div className="flex-1 text-gray-400 text-[10px] font-medium italic truncate">
                                Enregistrement en cours...
                            </div>
                            <button
                                onClick={handleCancelRecording}
                                className="text-red-500 font-black text-[10px] uppercase tracking-widest px-3 py-1 hover:bg-red-500/10 rounded-full transition-colors"
                            >
                                Annuler
                            </button>
                        </div>
                    ) : (
                        <>
                            <button className="size-10 flex items-center justify-center rounded-full text-gray-400 hover:text-[#D4AF37] transition-colors bg-[#101322]/50">
                                <span className="material-symbols-outlined">add</span>
                            </button>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Écrivez votre message..."
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-2 outline-none italic font-medium placeholder:text-gray-600"
                            />
                        </>
                    )}

                    <div className="flex items-center pr-1">
                        {!newMessage.trim() || isRecording ? (
                            <button
                                onClick={startRecording}
                                className={`size-12 rounded-full flex items-center justify-center transition-all ${isRecording
                                    ? 'bg-red-500 text-white scale-110 shadow-2xl shadow-red-500/40 z-20 animate-pulse'
                                    : 'bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 active:scale-90'
                                    }`}
                            >
                                <span className="material-symbols-outlined font-black">{isRecording ? 'stop' : 'mic_none'}</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleSend}
                                className="bg-[#D4AF37] text-[#101322] size-12 rounded-full shadow-xl shadow-[#D4AF37]/20 flex items-center justify-center active:scale-95 transition-all text-white"
                            >
                                <span className="material-symbols-outlined font-black">send</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className="h-20"></div> {/* Spacer for Nav */}
        </div>
    );
}
