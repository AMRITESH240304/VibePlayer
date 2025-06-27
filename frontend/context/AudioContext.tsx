import { Song } from '@/types/index';
import { useAudioPlayer } from 'expo-audio';
import React, { createContext, useContext, useEffect, useState } from 'react';

type AudioContextType = {
  currentSong: Song | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  playSong: (song: Song) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  seekTo: (position: number) => void;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const audioPlayer = useAudioPlayer({
    uri: audioUrl || '',
  });
  
  useEffect(() => {
    if (currentSong) {
      setAudioUrl(`https://vibeplayer.onrender.com/stream/${currentSong.id}`);
    }
  }, [currentSong]);
  
  useEffect(() => {
    // Update position and duration
    const intervalId = setInterval(async () => {
      if (audioPlayer) {
        const current = await audioPlayer.currentTime;
        setPosition(current || 0);
        
        const total = await audioPlayer.duration;
        if (total && total > 0) setDuration(total);
      }
    }, 500);
    
    return () => clearInterval(intervalId);
  }, [audioPlayer]);
  
  const playSong = async (song: Song) => {
    if (currentSong?.id === song.id) {
      // Resume current song
      await audioPlayer.play();
      setIsPlaying(true);
    } else {
      // Play new song
      setCurrentSong(song);
      setIsPlaying(true);
      // Audio will start playing when the URL changes due to the effect
    }
  };
  
  const pauseSong = async () => {
    await audioPlayer.pause();
    setIsPlaying(false);
  };
  
  const resumeSong = async () => {
    await audioPlayer.play();
    setIsPlaying(true);
  };
  
  const seekTo = async (pos: number) => {
    await audioPlayer.seekTo(pos);
  };
  
  useEffect(() => {
    if (audioUrl) {
      audioPlayer.play();
    }
  }, [audioUrl]);
  
  return (
    <AudioContext.Provider
      value={{
        currentSong,
        isPlaying,
        position,
        duration,
        playSong,
        pauseSong,
        resumeSong,
        seekTo,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};