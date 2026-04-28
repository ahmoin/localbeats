import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { formatDuration } from "@/src/lib/format";
import { type Track, usePlayerStore } from "@/src/store/playerStore";

interface Props {
	track: Track;
	onPress: () => void;
}

export default function TrackItem({ track, onPress }: Props) {
	const currentTrack = usePlayerStore((s) => s.currentTrack);
	const isActive = currentTrack?.id === track.id;

	return (
		<Pressable
			style={({ pressed }) => [styles.container, pressed && styles.pressed]}
			onPress={onPress}
		>
			<View style={styles.artwork}>
				{track.artwork ? (
					<Image source={{ uri: track.artwork }} style={styles.artworkImg} />
				) : (
					<View style={styles.artworkPlaceholder}>
						<Ionicons name="musical-note" size={20} color="#555" />
					</View>
				)}
			</View>
			<View style={styles.info}>
				<Text
					style={[styles.title, isActive && styles.activeText]}
					numberOfLines={1}
				>
					{track.title}
				</Text>
				<Text style={styles.artist} numberOfLines={1}>
					{track.artist}
				</Text>
			</View>
			<Text style={styles.duration}>{formatDuration(track.duration)}</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 10,
		gap: 12,
	},
	pressed: { backgroundColor: "#282828" },
	artwork: { width: 48, height: 48 },
	artworkImg: { width: 48, height: 48, borderRadius: 4 },
	artworkPlaceholder: {
		width: 48,
		height: 48,
		borderRadius: 4,
		backgroundColor: "#282828",
		alignItems: "center",
		justifyContent: "center",
	},
	info: { flex: 1 },
	title: { color: "#fff", fontSize: 15, fontWeight: "500" },
	activeText: { color: "#1DB954" },
	artist: { color: "#888", fontSize: 13, marginTop: 2 },
	duration: { color: "#888", fontSize: 12 },
});
