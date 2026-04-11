import { createContext, useContext, useRef, useState, useCallback, ReactNode } from 'react';

interface SectionAudioContextType {
  currentSection: string | null;
  isPlaying: boolean;
  toggle: (sectionId: string, src: string) => void;
}

const SectionAudioContext = createContext<SectionAudioContextType>({
  currentSection: null,
  isPlaying: false,
  toggle: () => {},
});

export const SectionAudioProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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
  }, [currentSection, isPlaying]);

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentSection(null);
  };

  return (
    <SectionAudioContext.Provider value={{ currentSection, isPlaying, toggle }}>
      {children}
    </SectionAudioContext.Provider>
  );
};

export const useSectionAudio = () => useContext(SectionAudioContext);
