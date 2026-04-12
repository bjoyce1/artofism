import { createContext, useContext, useRef, useState, useCallback, ReactNode } from 'react';

interface SectionAudioContextType {
  currentSection: string | null;
  isPlaying: boolean;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  toggle: (sectionId: string, src: string) => void;
}

const SectionAudioContext = createContext<SectionAudioContextType>({
  currentSection: null,
  isPlaying: false,
  audioRef: { current: null },
  toggle: () => {},
});

export const SectionAudioProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentSection(null);
  }, []);

  const toggle = useCallback((sectionId: string, src: string) => {
    // Same section — toggle play/pause
    if (currentSection === sectionId && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    // Different section — stop current, start new
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener('ended', handleEnded);
    }

    const audio = new Audio(src);
    audio.addEventListener('ended', handleEnded);
    audioRef.current = audio;
    setCurrentSection(sectionId);
    audio.play();
    setIsPlaying(true);
  }, [currentSection, isPlaying, handleEnded]);

  return (
    <SectionAudioContext.Provider value={{ currentSection, isPlaying, audioRef, toggle }}>
      {children}
    </SectionAudioContext.Provider>
  );
};

export const useSectionAudio = () => useContext(SectionAudioContext);
