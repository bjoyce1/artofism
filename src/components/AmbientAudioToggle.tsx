import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

const AmbientAudioToggle = () => {
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element with a subtle ambient drone
    const audio = new Audio();
    // Using a royalty-free ambient tone placeholder
    // Replace this URL with your own ambient audio file in /public/ambient.mp3
    audio.src = '/ambient.mp3';
    audio.loop = true;
    audio.volume = 0.15;
    audio.muted = true;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.muted = false;
      audio.play().catch(() => {});
    } else {
      audio.muted = true;
    }
    setIsMuted(!isMuted);
  };

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.5, duration: 1 }}
      onClick={toggleAudio}
      className="fixed bottom-8 right-8 z-50 w-10 h-10 flex items-center justify-center rounded-full border border-primary/30 bg-deep-black/80 backdrop-blur-sm text-muted-foreground hover:text-primary hover:border-primary/60 transition-all duration-300"
      aria-label={isMuted ? 'Unmute ambient audio' : 'Mute ambient audio'}
    >
      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
    </motion.button>
  );
};

export default AmbientAudioToggle;
