import { Audio, type AVPlaybackStatus } from "expo-av";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { zustandStorage as storage } from "@/src/lib/storage";

export type RepeatMode = "off" | "all" | "one";

export interface Track {
	id: string;
	title: string;
	artist: string;
	album: string;
	duration: number;
	uri: string;
	artwork?: string;
}

interface PlayerState {
	tracks: Track[];
	queue: Track[];
	currentTrack: Track | null;
	isPlaying: boolean;
	position: number;
	duration: number;
	shuffleEnabled: boolean;
	repeatMode: RepeatMode;

	setTracks: (tracks: Track[]) => void;
	playTrack: (track: Track, queue?: Track[]) => Promise<void>;
	togglePlay: () => Promise<void>;
	seekTo: (position: number) => Promise<void>;
	playNext: () => Promise<void>;
	playPrev: () => Promise<void>;
	toggleShuffle: () => void;
	cycleRepeat: () => void;
}

let sound: Audio.Sound | null = null;

async function loadAndPlay(
	uri: string,
	onStatusUpdate: (status: AVPlaybackStatus) => void,
): Promise<Audio.Sound> {
	if (sound) {
		await sound.unloadAsync();
		sound = null;
	}
	const { sound: newSound } = await Audio.Sound.createAsync(
		{ uri },
		{ shouldPlay: true },
		onStatusUpdate,
	);
	sound = newSound;
	return newSound;
}

export const usePlayerStore = create<PlayerState>()(
	persist(
		(set, get) => ({
			tracks: [],
			queue: [],
			currentTrack: null,
			isPlaying: false,
			position: 0,
			duration: 0,
			shuffleEnabled: false,
			repeatMode: "off",

			setTracks: (tracks) => set({ tracks }),

			playTrack: async (track, queue) => {
				await Audio.setAudioModeAsync({
					playsInSilentModeIOS: true,
					staysActiveInBackground: true,
				});

				await loadAndPlay(track.uri, (status) => {
					if (!status.isLoaded) return;
					set({
						position: status.positionMillis / 1000,
						duration: (status.durationMillis ?? 0) / 1000,
						isPlaying: status.isPlaying,
					});
					if (status.didJustFinish) {
						get().playNext();
					}
				});

				set({
					currentTrack: track,
					isPlaying: true,
					queue: queue ?? get().tracks,
					position: 0,
				});
			},

			togglePlay: async () => {
				if (!sound) return;
				const { isPlaying } = get();
				if (isPlaying) {
					await sound.pauseAsync();
				} else {
					await sound.playAsync();
				}
				set({ isPlaying: !isPlaying });
			},

			seekTo: async (position) => {
				if (!sound) return;
				await sound.setPositionAsync(position * 1000);
				set({ position });
			},

			playNext: async () => {
				const { queue, currentTrack, shuffleEnabled, repeatMode } = get();
				if (!currentTrack || queue.length === 0) return;

				if (repeatMode === "one") {
					await get().playTrack(currentTrack, queue);
					return;
				}

				const idx = queue.findIndex((t) => t.id === currentTrack.id);
				let nextIdx: number;

				if (shuffleEnabled) {
					nextIdx = Math.floor(Math.random() * queue.length);
				} else {
					nextIdx = idx + 1;
					if (nextIdx >= queue.length) {
						if (repeatMode === "all") nextIdx = 0;
						else return;
					}
				}

				await get().playTrack(queue[nextIdx], queue);
			},

			playPrev: async () => {
				const { queue, currentTrack, position } = get();
				if (!currentTrack || queue.length === 0) return;

				if (position > 3) {
					await get().seekTo(0);
					return;
				}

				const idx = queue.findIndex((t) => t.id === currentTrack.id);
				const prevIdx = idx > 0 ? idx - 1 : 0;
				await get().playTrack(queue[prevIdx], queue);
			},

			toggleShuffle: () => set((s) => ({ shuffleEnabled: !s.shuffleEnabled })),

			cycleRepeat: () =>
				set((s) => ({
					repeatMode:
						s.repeatMode === "off"
							? "all"
							: s.repeatMode === "all"
								? "one"
								: "off",
				})),
		}),
		{
			name: "localbeats-player",
			storage,
			partialize: (s) => ({
				tracks: s.tracks,
				currentTrack: s.currentTrack,
				queue: s.queue,
				shuffleEnabled: s.shuffleEnabled,
				repeatMode: s.repeatMode,
			}),
		},
	),
);
