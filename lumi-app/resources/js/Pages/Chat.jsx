import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import NavigationBar from '@/Components/NavigationBar';

export default function Chat({ chatWith, messages: initialMessages }) {
    const [messages, setMessages] = useState(initialMessages || []);
    const [newMessage, setNewMessage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const scrollRef = useRef(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const startRecording = async () => {
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
                sendVoiceMessage(blob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Erreur micro:", err);
            alert("Accès micro refusé ou non supporté.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const sendVoiceMessage = async (blob) => {
        try {
            // Convert blob to base64
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const base64data = reader.result;

                // Send voice message to backend
                const response = await window.axios.post('/api/messages', {
                    to_id: chatWith.id,
                    content: '',
                    type: 'voice',
                    media: base64data
                });

                setMessages([...messages, response.data]);
            };
        } catch (err) {
            console.error("Erreur envoi note vocale:", err);
            alert("Erreur lors de l'envoi de la note vocale.");
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
            alert("Erreur lors de l'envoi du message.");
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F2f5] flex flex-col font-sans">
            <Head title={`Chat avec ${chatWith?.name}`} />

            {/* Chat Header */}
            <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200 z-10 shadow-sm">
                <div className="flex items-center space-x-4">
                    <button onClick={() => router.visit('/chat')} className="text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <div className="relative">
                        <img src={chatWith?.avatar || 'https://via.placeholder.com/100'} className="w-10 h-10 rounded-full object-cover" alt="Avatar" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900 leading-tight">{chatWith?.name}</h2>
                        <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">En ligne</span>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.from_id === chatWith?.id ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-sm ${msg.from_id !== chatWith?.id
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                            }`}>
                            {msg.type === 'text' ? (
                                <p>{msg.content}</p>
                            ) : (
                                <div className="flex items-center space-x-3 w-48">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.from === 'me' ? 'bg-white/20' : 'bg-blue-100 text-blue-600'}`}>
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                                    </div>
                                    <div className="flex-1 h-1 bg-current opacity-20 rounded-full"></div>
                                    <span className="text-[10px] font-bold">{msg.duration}</span>
                                </div>
                            )}
                            <div className={`text-[9px] mt-1 text-right opacity-60`}>
                                {msg.time}
                                {msg.from === 'me' && <span className="ml-1">✓✓</span>}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>

            {/* Input Bar */}
            <div className="p-6 bg-white border-t border-gray-200">
                <div className="flex items-center space-x-3 bg-gray-50 py-3 px-4 rounded-[2rem] border border-gray-200">
                    <button className="text-gray-400 hover:text-blue-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Votre message..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-1 outline-none"
                    />
                    <button
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white scale-125 shadow-lg animate-pulse' : 'text-gray-400'
                            }`}
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"></path></svg>
                    </button>
                    {newMessage.trim() && (
                        <button
                            onClick={handleSend}
                            className="bg-blue-600 text-white p-2 rounded-full shadow-lg shadow-blue-100 flex items-center justify-center active:scale-90 transition-transform"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                        </button>
                    )}
                </div>
                {isRecording && (
                    <div className="text-center mt-2 text-[10px] text-red-500 font-bold uppercase tracking-widest animate-pulse">
                        Enregistrement vocal en cours...
                    </div>
                )}
            </div>
            <div className="h-20"></div> {/* Spacer for Nav */}
            <NavigationBar />
        </div>
    );
}
