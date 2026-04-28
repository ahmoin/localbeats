import { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { type Track, usePlayerStore } from "@/src/store/playerStore";

function getAudioDuration(uri: string): Promise<number> {
	return new Promise((resolve) => {
		const audio = new Audio(uri);
		audio.addEventListener("loadedmetadata", () => resolve(audio.duration));
		audio.addEventListener("error", () => resolve(0));
	});
}

export default function DropZone() {
	const [dragging, setDragging] = useState(false);
	const { tracks, setTracks } = usePlayerStore();
	const counter = useRef(0);

	async function processFiles(files: FileList) {
		const audioFiles = Array.from(files).filter((f) =>
			f.type.startsWith("audio/"),
		);
		if (audioFiles.length === 0) return;

		const newTracks: Track[] = await Promise.all(
			audioFiles.map(async (file) => {
				const uri = URL.createObjectURL(file);
				const duration = await getAudioDuration(uri);
				return {
					id: uri,
					title: file.name.replace(/\.[^.]+$/, ""),
					artist: "Unknown Artist",
					album: "Unknown Album",
					duration,
					uri,
				};
			}),
		);

		const merged = [
			...tracks,
			...newTracks.filter((t) => !tracks.some((e) => e.id === t.id)),
		];
		setTracks(merged);
	}

	return (
		<View
			// @ts-expect-error web-only drag events
			onDragEnter={(e: DragEvent) => {
				e.preventDefault();
				counter.current += 1;
				setDragging(true);
			}}
			onDragOver={(e: DragEvent) => e.preventDefault()}
			onDragLeave={() => {
				counter.current -= 1;
				if (counter.current === 0) setDragging(false);
			}}
			onDrop={(e: DragEvent) => {
				e.preventDefault();
				counter.current = 0;
				setDragging(false);
				const dt = (e as unknown as React.DragEvent).dataTransfer;
				if (dt?.files) processFiles(dt.files);
			}}
			style={[styles.zone, dragging && styles.zoneDragging]}
		>
			<Text style={styles.icon}>🎵</Text>
			<Text style={styles.text}>
				{dragging ? "Drop to add" : "Drag & drop audio files here"}
			</Text>
			<Text style={styles.hint}>or use Add Files below</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	zone: {
		margin: 16,
		borderWidth: 2,
		borderColor: "#383838",
		borderStyle: "dashed",
		borderRadius: 12,
		padding: 32,
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
	},
	zoneDragging: {
		borderColor: "#1DB954",
		backgroundColor: "rgba(29,185,84,0.08)",
	},
	icon: { fontSize: 36 },
	text: { color: "#fff", fontSize: 16, fontWeight: "600" },
	hint: { color: "#888", fontSize: 13 },
});
