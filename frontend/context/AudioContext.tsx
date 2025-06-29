import { Song } from '@/types/index';
import { Audio } from 'expo-av';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

type AudioContextType = {
  currentSong: Song | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  playSong: (song: Song) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  seekTo: (position: number) => void;
  playlist: Song[];
  setPlaylist: (songs: Song[]) => void;
  playNext: () => void;
  playPrevious: () => void;
  isShuffleOn: boolean;
  toggleShuffle: () => void;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [playHistory, setPlayHistory] = useState<Song[]>([]);
  const soundRef = useRef<Audio.Sound | null>(null);
  
  // Configure audio mode for background playback
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true, // This is the key setting for background playback
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        console.log('Audio mode set for background playback');
      } catch (error) {
        console.error('Error setting audio mode:', error);
      }
    };
    
    setupAudio();
    
    return () => {
      // Clean up sound on unmount
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);
  
  useEffect(() => {
    if (currentSong) {
      setAudioUrl(`https://vibeplayer.onrender.com/stream/${currentSong.id}`);
    }
  }, [currentSong]);
  
  useEffect(() => {
    // Update position and duration
    const intervalId = setInterval(async () => {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          setPosition(status.positionMillis / 1000);
          setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
          
          // Auto-play next song when current song ends
          if (status.didJustFinish) {
            playNext();
          }
        }
      }
    }, 500);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Load and play new audio when URL changes
  useEffect(() => {
    const loadAndPlayAudio = async () => {
      try {
        if (!audioUrl) return;
        
        // Unload previous sound if exists
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
        }
        
        // Load new sound
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true },
          (status) => {
            // This is our playback status update callback
            if (status.isLoaded) {
              setIsPlaying(status.isPlaying);
            }
          }
        );
        
        soundRef.current = sound;
      } catch (error) {
        console.error('Error loading audio:', error);
      }
    };
    
    loadAndPlayAudio();
  }, [audioUrl]);
  
  const playSong = async (song: Song) => {
    if (currentSong?.id === song.id) {
      // Resume current song
      if (soundRef.current) {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    } else {
      // Add current song to history if it exists
      if (currentSong) {
        setPlayHistory(prev => [...prev, currentSong]);
      }
      
      // Play new song
      setCurrentSong(song);
      setIsPlaying(true);
      // Audio will start playing when the URL changes due to the effect
    }
  };
  
  const pauseSong = async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    }
  };
  
  const resumeSong = async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  };
  
  const seekTo = async (pos: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(pos * 1000); // Convert to milliseconds
    }
  };

  const getRandomSong = (): Song | null => {
    if (playlist.length === 0) return null;
    
    // Exclude current song from random selection
    const availableSongs = playlist.filter(
      song => !currentSong || song.id !== currentSong.id
    );
    
    if (availableSongs.length === 0) return playlist[0];
    
    const randomIndex = Math.floor(Math.random() * availableSongs.length);
    return availableSongs[randomIndex];
  };
  
  const getNextSong = (): Song | null => {
    if (playlist.length === 0) return null;
    
    if (isShuffleOn) {
      return getRandomSong();
    }
    
    // Find current song index
    const currentIndex = currentSong 
      ? playlist.findIndex(song => song.id === currentSong.id)
      : -1;
    
    // If current song not in playlist or is last song, play first song
    if (currentIndex === -1 || currentIndex === playlist.length - 1) {
      return playlist[0];
    }
    
    // Otherwise play next song
    return playlist[currentIndex + 1];
  };
  
  const getPreviousSong = (): Song | null => {
    // If we have play history, use the most recent song
    if (playHistory.length > 0) {
      const previousSong = playHistory[playHistory.length - 1];
      // Remove the song from history
      setPlayHistory(prev => prev.slice(0, -1));
      return previousSong;
    }
    
    if (playlist.length === 0) return null;
    
    if (isShuffleOn) {
      return getRandomSong();
    }
    
    // Find current song index
    const currentIndex = currentSong 
      ? playlist.findIndex(song => song.id === currentSong.id)
      : -1;
    
    // If current song not in playlist or is first song, play last song
    if (currentIndex === -1 || currentIndex === 0) {
      return playlist[playlist.length - 1];
    }
    
    // Otherwise play previous song
    return playlist[currentIndex - 1];
  };
  
  const playNext = () => {
    const nextSong = getNextSong();
    if (nextSong) {
      playSong(nextSong);
    }
  };
  
  const playPrevious = () => {
    const prevSong = getPreviousSong();
    if (prevSong) {
      playSong(prevSong);
    }
  };
  
  const toggleShuffle = () => {
    setIsShuffleOn(prev => !prev);
  };
  
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
        playlist,
        setPlaylist,
        playNext,
        playPrevious,
        isShuffleOn,
        toggleShuffle
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