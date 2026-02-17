import React, { useState, useEffect, useRef } from 'react';

const VoicePlayer = ({ src, duration, isMine }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [durationSec, setDurationSec] = useState(0);
    const audioRef = useRef(null);

    useEffect(() => {
        const audio = new Audio(src);
        audioRef.current = audio;

        const setAudioData = () => {
            setDurationSec(audio.duration);
        };

        const setAudioTime = () => {
            setCurrentTime(audio.currentTime);
        };

        const onEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
            audio.currentTime = 0;
        };

        audio.addEventListener('loadedmetadata', setAudioData);
        audio.addEventListener('timeupdate', setAudioTime);
        audio.addEventListener('ended', onEnded);

        return () => {
            audio.pause();
            audio.removeEventListener('loadedmetadata', setAudioData);
            audio.removeEventListener('timeupdate', setAudioTime);
            audio.removeEventListener('ended', onEnded);
        };
    }, [src]);

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (secs) => {
        if (!secs || isNaN(secs)) return '0:00';
        const minutes = Math.floor(secs / 60);
        const seconds = Math.floor(secs % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const progress = durationSec > 0 ? (currentTime / durationSec) * 100 : 0;

    return (
        <div className="flex items-center space-x-3 w-48 sm:w-56">
            <button
                onClick={togglePlay}
                className={`size-9 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 ${isMine
                        ? 'bg-[#101322]/20 hover:bg-[#101322]/30 text-[#101322]'
                        : 'bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#D4AF37]'
                    }`}
            >
                <span className="material-symbols-outlined text-[20px]">
                    {isPlaying ? 'pause' : 'play_arrow'}
                </span>
            </button>
            <div className="flex-1">
                <div className={`h-1.5 rounded-full w-full overflow-hidden mb-1.5 ${isMine ? 'bg-[#101322]/10' : 'bg-gray-200 dark:bg-white/10'
                    }`}>
                    <div
                        className={`h-full rounded-full transition-all duration-100 ${isMine ? 'bg-[#101322]' : 'bg-[#D4AF37]'
                            }`}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <div className="flex justify-between items-center px-0.5">
                    <span className={`text-[9px] font-black italic uppercase tracking-tighter opacity-70 ${isMine ? 'text-[#101322]' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                        {formatTime(currentTime)}
                    </span>
                    <span className={`text-[9px] font-black italic uppercase tracking-tighter opacity-70 ${isMine ? 'text-[#101322]' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                        {duration || formatTime(durationSec)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default VoicePlayer;
