import { Audio } from 'expo-av';

// This service handles audio session configuration
class AudioService {
  static async configureAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      console.log('Audio service configured for background playback');
    } catch (error) {
      console.error('Error configuring audio service:', error);
    }
  }

  static async loadSound(uri: string) {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false }
      );
      return sound;
    } catch (error) {
      console.error('Error loading sound:', error);
      return null;
    }
  }
}

export default AudioService;