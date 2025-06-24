import Sound from "react-native-sound";

Sound.setCategory('Playback');

var whoose = new Sound('song.mp3', Sound.MAIN_BUNDLE, (error) => {
    if (error) {
        console.log('failed to load the sound', error);
        return;
    }
    // loaded successfully
    console.log('duration in seconds: ' + whoose.getDuration() + 'number of channels: ' + whoose.getNumberOfChannels());
    }   
);