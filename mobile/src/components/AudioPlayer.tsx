import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import theme from '../theme';
import { formatTime } from '../utils/timeUtils';

interface AudioPlayerProps {
  reference?: string;
  onPlaybackStatusUpdate?: (status: AVPlaybackStatus) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  reference,
  onPlaybackStatusUpdate,
}) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [error, setError] = useState('');

  const positionRef = useRef(position);
  positionRef.current = position;

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  useEffect(() => {
    if (reference) {
      loadAudio();
    }
  }, [reference]);

  const loadAudio = async () => {
    try {
      setIsLoading(true);
      setError('');

      if (sound) {
        await sound.unloadAsync();
      }

      // Get audio URL for the reference
      const audioUrl = await getAudioUrl(reference!);

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false },
        onPlaybackStatusUpdate
          ? status => {
              onPlaybackStatusUpdate(status);
              updateStatus(status);
            }
          : updateStatus,
      );

      setSound(newSound);
    } catch (err) {
      console.error('Failed to load audio:', err);
      setError('Failed to load audio');
    } finally {
      setIsLoading(false);
    }
  };

  const getAudioUrl = async (reference: string): Promise<string> => {
    // TODO: Implement API call to get audio URL for the reference
    return `https://example.com/audio/${reference}.mp3`;
  };

  const updateStatus = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);
    }
  };

  const togglePlayback = async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (err) {
      console.error('Playback error:', err);
      setError('Playback failed');
    }
  };

  const seekAudio = async (value: number) => {
    if (!sound) return;

    try {
      await sound.setPositionAsync(value);
    } catch (err) {
      console.error('Seek error:', err);
    }
  };

  const skipForward = async () => {
    if (!sound) return;
    const newPosition = Math.min(positionRef.current + 15000, duration);
    await seekAudio(newPosition);
  };

  const skipBackward = async () => {
    if (!sound) return;
    const newPosition = Math.max(positionRef.current - 15000, 0);
    await seekAudio(newPosition);
  };

  if (!reference) return null;

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={skipBackward}
            >
              <MaterialIcons
                name="replay-15"
                size={24}
                color={theme.colors.text}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playButton}
              onPress={togglePlayback}
            >
              <MaterialIcons
                name={isPlaying ? 'pause' : 'play-arrow'}
                size={32}
                color={theme.colors.background}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={skipForward}
            >
              <MaterialIcons
                name="forward-15"
                size={24}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.progressContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={position}
              onSlidingComplete={seekAudio}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.separator}
              thumbTintColor={theme.colors.primary}
            />
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.medium,
    marginHorizontal: theme.spacing.medium,
    marginVertical: theme.spacing.small,
    ...theme.shadows.small,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.medium,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: theme.spacing.medium,
  },
  skipButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    width: '100%',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.small,
  },
  timeText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textLight,
    fontFamily: theme.typography.fontFamily.medium,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    fontSize: theme.typography.sizes.small,
    fontFamily: theme.typography.fontFamily.medium,
  },
});

export default AudioPlayer;
