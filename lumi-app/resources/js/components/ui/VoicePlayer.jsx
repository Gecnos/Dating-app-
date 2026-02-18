import React, { useState, useRef, useEffect } from 'react';

const VoicePlayer = ({ src, duration, isMine }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef(new Audio(src));
    const intervalRef = useRef(null);

    useEffect(() => {
        const audio = audioRef.current;

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
            clearInterval(intervalRef.current);
        };

        audio.addEventListener('ended', handleEnded);
        return () => {
            audio.removeEventListener('ended', handleEnded);
            audio.pause();
            clearInterval(intervalRef.current);
        };
    }, []);

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
            clearInterval(intervalRef.current);
        } else {
            audioRef.current.play();
            intervalRef.current = setInterval(() => {
                setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
            }, 100);
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className={`flex items-center gap-3 min-w-[150px] ${isMine ? 'text-[#101322]' : 'text-[#101322] dark:text-white'}`}>
            <button
                onClick={togglePlay}
                className={`size-8 rounded-full flex items-center justify-center ${isMine ? 'bg-black/10' : 'bg-[#D4AF37]'}`}
            >
                <span className="material-symbols-outlined text-lg">
                    {isPlaying ? 'pause' : 'play_arrow'}
                </span>
            </button>
            <div className="flex-1">
                <div className="h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${isMine ? 'bg-black/30' : 'bg-[#D4AF37]'}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between text-[9px] mt-1 font-bold opacity-60">
                    <span>{isPlaying ? 'Listening...' : (duration || 'Voice Note')}</span>
                </div>
            </div>
        </div>
    );
};

export default VoicePlayer;
