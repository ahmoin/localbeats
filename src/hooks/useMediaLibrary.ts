import * as MediaLibrary from "expo-media-library";
import { useState } from "react";
import { type Track, usePlayerStore } from "@/src/store/playerStore";

export function useMediaLibrary() {
	const [scanning, setScanning] = useState(false);
	const setTracks = usePlayerStore((s) => s.setTracks);

	async function scan() {
		setScanning(true);
		try {
			const { status } = await MediaLibrary.requestPermissionsAsync();
			if (status !== "granted") return;

			const media = await MediaLibrary.getAssetsAsync({
				mediaType: MediaLibrary.MediaType.audio,
				first: 2000,
			});

			const tracks: Track[] = await Promise.all(
				media.assets.map(async (asset) => {
					let info: MediaLibrary.AssetInfo;
					try {
						info = await MediaLibrary.getAssetInfoAsync(asset);
					} catch {
						info = asset as unknown as MediaLibrary.AssetInfo;
					}

					const title =
						asset.filename.replace(/\.[^.]+$/, "") || "Unknown Title";
					const durationSec = asset.duration ?? 0;

					return {
						id: asset.id,
						title,
						artist: "Unknown Artist",
						album: "Unknown Album",
						duration: durationSec,
						uri: info.localUri ?? asset.uri,
					};
				}),
			);

			setTracks(tracks);
		} finally {
			setScanning(false);
		}
	}

	return { scanning, scan };
}
