import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	FlatList,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { type Track, usePlayerStore } from "@/src/store/playerStore";

const API_BASE =
	typeof window !== "undefined"
		? window.location.origin
		: (process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? "");

interface DownloadItem {
	id: string;
	url: string;
	title: string;
	status: "pending" | "downloading" | "done" | "error";
	error?: string;
}

export default function NetworkScreen() {
	const [input, setInput] = useState("");
	const [items, setItems] = useState<DownloadItem[]>([]);
	const { tracks, setTracks } = usePlayerStore();

	function updateItem(id: string, patch: Partial<DownloadItem>) {
		setItems((prev) =>
			prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
		);
	}

	async function startDownload(url: string) {
		const id = Date.now().toString();
		const item: DownloadItem = { id, url, title: url, status: "pending" };
		setItems((prev) => [item, ...prev]);
		setInput("");

		updateItem(id, { status: "downloading" });

		const apiUrl = `${API_BASE}/api/download?url=${encodeURIComponent(url)}`;

		if (Platform.OS === "web") {
			try {
				const res = await fetch(apiUrl);
				if (!res.ok) throw new Error(`Server error ${res.status}`);

				const title =
					decodeURIComponent(res.headers.get("x-track-title") ?? "") ||
					`Track ${id}`;
				const artist =
					decodeURIComponent(res.headers.get("x-track-artist") ?? "") ||
					"YouTube";
				const apiDuration = Number(res.headers.get("x-track-duration") ?? 0);

				const blob = await res.blob();
				if (blob.size === 0) throw new Error("empty response");

				const blobUrl = URL.createObjectURL(blob);

				const duration = await new Promise<number>((resolve) => {
					const audio = new Audio(blobUrl);
					audio.addEventListener("loadedmetadata", () =>
						resolve(audio.duration || apiDuration),
					);
					audio.addEventListener("error", () => resolve(apiDuration));
					setTimeout(() => resolve(apiDuration), 5000);
				});

				const newTrack: Track = {
					id,
					title,
					artist,
					album: "Downloads",
					duration,
					uri: blobUrl,
				};

				setTracks([newTrack, ...tracks]);
				updateItem(id, { status: "done", title });
			} catch (err) {
				updateItem(id, {
					status: "error",
					error: err instanceof Error ? err.message : "failed",
				});
			}
			return;
		}

		try {
			const dest = `${FileSystem.documentDirectory}localbeats_${id}.m4a`;

			const downloadResumable = FileSystem.createDownloadResumable(
				apiUrl,
				dest,
				{},
				() => {},
			);

			const result = await downloadResumable.downloadAsync();
			if (!result?.uri) throw new Error("no uri");

			const title =
				decodeURIComponent(result.headers?.["x-track-title"] ?? "") ||
				`Track ${id}`;
			const artist =
				decodeURIComponent(result.headers?.["x-track-artist"] ?? "") ||
				"YouTube";
			const duration = Number(result.headers?.["x-track-duration"] ?? 0);

			const newTrack: Track = {
				id,
				title,
				artist,
				album: "Downloads",
				duration,
				uri: result.uri,
			};

			setTracks([newTrack, ...tracks]);
			updateItem(id, { status: "done", title });
		} catch (err) {
			updateItem(id, {
				status: "error",
				error: err instanceof Error ? err.message : "unknown error",
			});
		}
	}

	function handleAdd() {
		const url = input.trim();
		if (!url) return;
		if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
			Alert.alert("Invalid URL", "Paste a YouTube link.");
			return;
		}
		startDownload(url);
	}

	return (
		<SafeAreaView style={styles.container}>
			<Text style={styles.heading}>Download</Text>
			<Text style={styles.sub}>
				Paste a YouTube URL to add it to your library
			</Text>

			<View style={styles.inputRow}>
				<TextInput
					style={styles.input}
					placeholder="https://youtube.com/watch?v=..."
					placeholderTextColor="#555"
					value={input}
					onChangeText={setInput}
					onSubmitEditing={handleAdd}
					autoCapitalize="none"
					autoCorrect={false}
				/>
				<Pressable style={styles.addBtn} onPress={handleAdd}>
					<Ionicons name="arrow-down-circle" size={28} color="#1DB954" />
				</Pressable>
			</View>

			<FlatList
				data={items}
				keyExtractor={(it) => it.id}
				contentContainerStyle={styles.list}
				renderItem={({ item }) => (
					<View style={styles.item}>
						<View style={styles.itemIcon}>
							{item.status === "downloading" ? (
								<ActivityIndicator size="small" color="#1DB954" />
							) : item.status === "done" ? (
								<Ionicons name="checkmark-circle" size={22} color="#1DB954" />
							) : item.status === "error" ? (
								<Ionicons name="close-circle" size={22} color="#e74c3c" />
							) : (
								<Ionicons name="time-outline" size={22} color="#888" />
							)}
						</View>
						<View style={styles.itemInfo}>
							<Text style={styles.itemTitle} numberOfLines={1}>
								{item.title}
							</Text>
							<Text style={styles.itemStatus}>
								{item.status === "downloading"
									? "Downloading…"
									: item.status === "done"
										? "Added to library"
										: item.status === "error"
											? (item.error ?? "Failed")
											: "Queued"}
							</Text>
						</View>
					</View>
				)}
				ListEmptyComponent={
					<View style={styles.empty}>
						<Ionicons name="cloud-download-outline" size={48} color="#333" />
						<Text style={styles.emptyText}>No downloads yet</Text>
					</View>
				}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#121212" },
	heading: {
		color: "#fff",
		fontSize: 24,
		fontWeight: "700",
		paddingHorizontal: 16,
		paddingTop: 16,
	},
	sub: {
		color: "#888",
		fontSize: 13,
		paddingHorizontal: 16,
		marginTop: 4,
		marginBottom: 16,
	},
	inputRow: {
		flexDirection: "row",
		alignItems: "center",
		marginHorizontal: 16,
		marginBottom: 8,
		gap: 8,
	},
	input: {
		flex: 1,
		backgroundColor: "#282828",
		color: "#fff",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 14,
	},
	addBtn: { padding: 4 },
	list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 120 },
	item: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		paddingVertical: 10,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: "#282828",
	},
	itemIcon: { width: 24, alignItems: "center" },
	itemInfo: { flex: 1 },
	itemTitle: { color: "#fff", fontSize: 14 },
	itemStatus: { color: "#888", fontSize: 12, marginTop: 2 },
	empty: {
		alignItems: "center",
		marginTop: 80,
		gap: 12,
	},
	emptyText: { color: "#555", fontSize: 14 },
});
