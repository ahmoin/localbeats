import {
	ActivityIndicator,
	FlatList,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DropZone from "@/src/components/DropZone";
import TrackItem from "@/src/components/TrackItem";
import { useFilePicker } from "@/src/hooks/useFilePicker";
import { useMediaLibrary } from "@/src/hooks/useMediaLibrary";
import { usePlayerStore } from "@/src/store/playerStore";

export default function LibraryScreen() {
	const { tracks, playTrack } = usePlayerStore();
	const { scanning, scan } = useMediaLibrary();
	const { pickFiles } = useFilePicker();

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.heading}>Your Library</Text>
				<View style={styles.headerBtns}>
					{Platform.OS !== "web" && (
						<Pressable
							style={({ pressed }) => [
								styles.btn,
								styles.btnSecondary,
								pressed && { opacity: 0.7 },
							]}
							onPress={scan}
							disabled={scanning}
						>
							{scanning ? (
								<ActivityIndicator size="small" color="#fff" />
							) : (
								<Text style={styles.btnSecondaryText}>Scan</Text>
							)}
						</Pressable>
					)}
					<Pressable
						style={({ pressed }) => [styles.btn, pressed && { opacity: 0.7 }]}
						onPress={pickFiles}
					>
						<Text style={styles.btnText}>+ Add Files</Text>
					</Pressable>
				</View>
			</View>

			{Platform.OS === "web" && <DropZone />}

			{tracks.length === 0 ? (
				<View style={styles.empty}>
					<Text style={styles.emptyText}>No tracks yet.</Text>
					<Text style={styles.emptyHint}>
						{Platform.OS === "web"
							? "Drag & drop audio files or tap Add Files."
							: "Tap Scan to find music on your device, or Add Files to pick manually."}
					</Text>
				</View>
			) : (
				<FlatList
					data={tracks}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<TrackItem track={item} onPress={() => playTrack(item, tracks)} />
					)}
					contentContainerStyle={{ paddingBottom: 80 }}
				/>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#121212" },
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 16,
	},
	heading: { fontSize: 26, fontWeight: "700", color: "#fff" },
	headerBtns: { flexDirection: "row", gap: 8 },
	btn: {
		backgroundColor: "#1DB954",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		alignItems: "center",
	},
	btnText: { color: "#121212", fontWeight: "700", fontSize: 13 },
	btnSecondary: { backgroundColor: "#282828" },
	btnSecondaryText: { color: "#fff", fontWeight: "600", fontSize: 13 },
	empty: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 32,
	},
	emptyText: { color: "#fff", fontSize: 18, fontWeight: "600" },
	emptyHint: { color: "#888", marginTop: 8, textAlign: "center" },
});
