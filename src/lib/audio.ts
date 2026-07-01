import {
  RecordingPresets,
  createAudioPlayer,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";
import {
  EncodingType,
  cacheDirectory,
  writeAsStringAsync,
} from "expo-file-system/legacy";

/**
 * Push-to-talk recorder. Wraps expo-audio so screens only deal with start/stop.
 * Returns the recorded file URI on stop (or null if nothing was captured).
 */
export function useVoiceRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  async function start(): Promise<void> {
    const perm = await requestRecordingPermissionsAsync();
    if (!perm.granted) {
      throw new Error(
        "Microphone permission is needed to practise speaking. Please allow it in Settings.",
      );
    }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
  }

  async function stop(): Promise<string | null> {
    await recorder.stop();
    return recorder.uri;
  }

  return { start, stop };
}

/**
 * Writes Sarvam's base64 WAV reply to a cache file and plays it.
 * Resolves once playback has started; returns a disposer to free the player.
 */
export async function playBase64Wav(base64: string): Promise<() => void> {
  const uri = `${cacheDirectory ?? ""}reply-${Date.now()}.wav`;
  await writeAsStringAsync(uri, base64, { encoding: EncodingType.Base64 });
  await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
  const player = createAudioPlayer({ uri });
  player.play();
  return () => {
    try {
      player.remove();
    } catch {
      // already removed
    }
  };
}
