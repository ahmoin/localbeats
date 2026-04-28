import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TrackItem from "@/src/components/TrackItem";
import { usePlayerStore } from "@/src/store/playerStore";

export default function HomeScreen() {
	const { tracks, playTrack } = usePlayerStore();
	const recent = tracks.slice(0, 10);

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView contentContainerStyle={styles.scroll}>
				<Text style={styles.heading}>Good evening</Text>

				{recent.length === 0 ? (
					<View style={styles.empty}>
						<Text style={styles.emptyText}>No tracks found.</Text>
						<Text style={styles.emptyHint}>
							Go to Library to scan your music.
						</Text>
					</View>
				) : (
					<>
						<Text style={styles.sectionTitle}>Recently Added</Text>
						{recent.map((track) => (
							<TrackItem
								key={track.id}
								track={track}
								onPress={() => playTrack(track, recent)}
							/>
						))}
					</>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#121212" },
	scroll: { padding: 16, paddingBottom: 80 },
	heading: { fontSize: 26, fontWeight: "700", color: "#fff", marginBottom: 24 },
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#fff",
		marginBottom: 12,
	},
	empty: { marginTop: 80, alignItems: "center" },
	emptyText: { color: "#fff", fontSize: 18, fontWeight: "600" },
	emptyHint: { color: "#888", marginTop: 8 },
});
