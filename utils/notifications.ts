import { AudioPlayer, createAudioPlayer } from 'expo-audio';
import { Platform, Vibration } from 'react-native';

// Bell sound URL
const BELL_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

let bellPlayer: AudioPlayer | null = null;

// Vibration patterns
const VIBRATION_PATTERNS = {
  short: [0, 200],
  medium: [0, 400],
  long: [0, 800],
  double: [0, 200, 100, 200],
  triple: [0, 200, 100, 200, 100, 200],
  restComplete: [0, 300, 100, 300, 100, 500],
};

/**
 * Vibrate the device with a specific pattern
 */
export const vibrate = (pattern: keyof typeof VIBRATION_PATTERNS = 'medium') => {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    Vibration.vibrate(VIBRATION_PATTERNS[pattern]);
  } catch (error) {
    console.log('Vibration not available:', error);
  }
};

/**
 * Play a bell sound for rest timer completion
 */
export const playBellSound = async () => {
  try {
    // Create player if not exists
    if (!bellPlayer) {
      bellPlayer = createAudioPlayer({ uri: BELL_SOUND_URL });
    }

    // Seek to start and play
    await bellPlayer.seekTo(0);
    bellPlayer.play();
  } catch (error) {
    console.log('Could not play bell sound:', error);
  }
};

/**
 * Notify user that rest time is complete with both vibration and sound
 */
export const notifyRestComplete = async () => {
  // Vibrate first (immediate feedback)
  vibrate('restComplete');

  // Then play sound
  await playBellSound();
};

/**
 * Cancel any ongoing vibration
 */
export const cancelVibration = () => {
  if (Platform.OS !== 'web') {
    Vibration.cancel();
  }
};

/**
 * Clean up audio resources
 */
export const cleanupAudio = () => {
  if (bellPlayer) {
    bellPlayer.remove();
    bellPlayer = null;
  }
};
