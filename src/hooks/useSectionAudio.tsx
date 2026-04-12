import { createContext, useContext, useRef, useState, useCallback, useEffect, ReactNode } from 'react';

interface SectionAudioContextType {
  currentSection: string | null;
  isPlaying: boolean;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  currentTime: number;
  duration: number;
  toggle: (sectionId: string, src: string) => void;
}

const SectionAudioContext = createContext<SectionAudioContextType>({
  currentSection: null,
  isPlaying: false,
  audioRef: { current: null },
  currentTime: 0,
  duration: 0,
  toggle: () => {},
});

export const SectionAudioProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const rafRef = useRef<number | null>(null);

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startRaf = useCallback(() => {
    stopRaf();
    const tick = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [stopRaf]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentSection(null);
    setCurrentTime(0);
    setDuration(0);
    stopRaf();
  }, [stopRaf]);

  const toggle = useCallback((sectionId: string, src: string) => {
    // Same section — toggle play/pause
    if (currentSection === sectionId && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        stopRaf();
      } else {
        audioRef.current.play();
        setIsPlaying(true);
        startRaf();
      }
      return;
    }

    // Different section — stop current, start new
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener('ended', handleEnded);
      stopRaf();
    }

    const audio = new Audio(src);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });
    audioRef.current = audio;
    setCurrentSection(sectionId);
    setCurrentTime(0);
    audio.play();
    setIsPlaying(true);
    startRaf();
  }, [currentSection, isPlaying, handleEnded, stopRaf, startRaf]);

  useEffect(() => {
    return () => stopRaf();
  }, [stopRaf]);

  return (
    <SectionAudioContext.Provider value={{ currentSection, isPlaying, audioRef, currentTime, duration, toggle }}>
      {children}
    </SectionAudioContext.Provider>
  );
};

export const useSectionAudio = () => useContext(SectionAudioContext);
