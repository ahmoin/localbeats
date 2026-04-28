import * as DocumentPicker from "expo-document-picker";
import { Platform } from "react-native";
import { type Track, usePlayerStore } from "@/src/store/playerStore";

function getAudioDurationWeb(uri: string): Promise<number> {
	return new Promise((resolve) => {
		const audio = new Audio(uri);
		audio.addEventListener("loadedmetadata", () => resolve(audio.duration));
		audio.addEventListener("error", () => resolve(0));
	});
}

function filenameToTitle(name: string) {
	return name.replace(/\.[^.]+$/, "");
}

export function useFilePicker() {
	const { tracks, setTracks } = usePlayerStore();

	async function pickFiles() {
		const result = await DocumentPicker.getDocumentAsync({
			type: "audio/*",
			multiple: true,
			copyToCacheDirectory: true,
		});

		if (result.canceled) return;

		const newTracks: Track[] = await Promise.all(
			result.assets.map(async (asset) => {
				let duration = 0;
				if (Platform.OS === "web") {
					duration = await getAudioDurationWeb(asset.uri);
				} else {
					duration = (asset as { duration?: number }).duration ?? 0;
				}

				return {
					id: asset.uri,
					title: filenameToTitle(asset.name),
					artist: "Unknown Artist",
					album: "Unknown Album",
					duration,
					uri: asset.uri,
				};
			}),
		);

		const merged = [
			...tracks,
			...newTracks.filter((t) => !tracks.some((e) => e.id === t.id)),
		];
		setTracks(merged);
	}

	return { pickFiles };
}
