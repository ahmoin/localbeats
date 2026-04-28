import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@/src/components/Slider";
import { formatDuration } from "@/src/lib/format";
import { usePlayerStore } from "@/src/store/playerStore";

export default function PlayerScreen() {
	const {
		currentTrack,
		isPlaying,
		position,
		duration,
		togglePlay,
		seekTo,
		playNext,
		playPrev,
		shuffleEnabled,
		repeatMode,
		toggleShuffle,
		cycleRepeat,
	} = usePlayerStore();

	if (!currentTrack) {
		router.back();
		return null;
	}

	return (
		<SafeAreaView style={styles.container}>
			<Pressable style={styles.closeBtn} onPress={() => router.back()}>
				<Ionicons name="chevron-down" size={28} color="#fff" />
			</Pressable>

			<View style={styles.artwork}>
				{currentTrack.artwork ? (
					<Image
						source={{ uri: currentTrack.artwork }}
						style={styles.artworkImg}
					/>
				) : (
					<View style={styles.artworkPlaceholder}>
						<Ionicons name="musical-note" size={80} color="#555" />
					</View>
				)}
			</View>

			<View style={styles.info}>
				<Text style={styles.title} numberOfLines={1}>
					{currentTrack.title}
				</Text>
				<Text style={styles.artist} numberOfLines={1}>
					{currentTrack.artist}
				</Text>
			</View>

			<View style={styles.sliderRow}>
				<Text style={styles.time}>{formatDuration(position)}</Text>
				<Slider
					style={styles.slider}
					minimumValue={0}
					maximumValue={duration || 1}
					value={position}
					onSlidingComplete={seekTo}
				/>
				<Text style={styles.time}>{formatDuration(duration)}</Text>
			</View>

			<View style={styles.controls}>
				<Pressable onPress={toggleShuffle}>
					<Ionicons
						name="shuffle"
						size={24}
						color={shuffleEnabled ? "#1DB954" : "#888"}
					/>
				</Pressable>
				<Pressable onPress={playPrev}>
					<Ionicons name="play-skip-back" size={32} color="#fff" />
				</Pressable>
				<Pressable style={styles.playBtn} onPress={togglePlay}>
					<Ionicons
						name={isPlaying ? "pause" : "play"}
						size={36}
						color="#121212"
					/>
				</Pressable>
				<Pressable onPress={playNext}>
					<Ionicons name="play-skip-forward" size={32} color="#fff" />
				</Pressable>
				<Pressable onPress={cycleRepeat}>
					<Ionicons
						name={repeatMode === "one" ? "repeat-outline" : "repeat"}
						size={24}
						color={repeatMode !== "off" ? "#1DB954" : "#888"}
					/>
				</Pressable>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#121212",
		paddingHorizontal: 24,
		alignItems: "center",
	},
	closeBtn: { alignSelf: "flex-start", marginTop: 8, marginBottom: 16 },
	artwork: { width: "100%", aspectRatio: 1, marginBottom: 32 },
	artworkImg: { width: "100%", height: "100%", borderRadius: 12 },
	artworkPlaceholder: {
		width: "100%",
		height: "100%",
		borderRadius: 12,
		backgroundColor: "#282828",
		alignItems: "center",
		justifyContent: "center",
	},
	info: { width: "100%", marginBottom: 16 },
	title: { fontSize: 22, fontWeight: "700", color: "#fff" },
	artist: { fontSize: 16, color: "#888", marginTop: 4 },
	sliderRow: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 24,
	},
	slider: { flex: 1 },
	time: { color: "#888", fontSize: 12, width: 40, textAlign: "center" },
	controls: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	playBtn: {
		backgroundColor: "#1DB954",
		width: 68,
		height: 68,
		borderRadius: 34,
		alignItems: "center",
		justifyContent: "center",
	},
});
