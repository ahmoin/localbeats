import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Slider from "@/src/components/Slider";
import { formatDuration } from "@/src/lib/format";
import { usePlayerStore } from "@/src/store/playerStore";

export default function MiniPlayer() {
	const {
		currentTrack,
		isPlaying,
		togglePlay,
		position,
		duration,
		playNext,
		playPrev,
		shuffleEnabled,
		repeatMode,
		toggleShuffle,
		cycleRepeat,
		seekTo,
	} = usePlayerStore();

	if (!currentTrack) return null;

	return (
		<View style={styles.container}>
			<Pressable style={styles.left} onPress={() => router.push("/player")}>
				<View style={styles.artwork}>
					{currentTrack.artwork ? (
						<Image
							source={{ uri: currentTrack.artwork }}
							style={styles.artworkImg}
						/>
					) : (
						<View style={styles.artworkPlaceholder}>
							<Ionicons name="musical-note" size={16} color="#555" />
						</View>
					)}
				</View>
				<View style={styles.trackInfo}>
					<Text style={styles.title} numberOfLines={1}>
						{currentTrack.title}
					</Text>
					<Text style={styles.artist} numberOfLines={1}>
						{currentTrack.artist}
					</Text>
				</View>
			</Pressable>

			<View style={styles.center}>
				<View style={styles.controls}>
					<Pressable onPress={toggleShuffle} hitSlop={8}>
						<Ionicons
							name="shuffle"
							size={18}
							color={shuffleEnabled ? "#1DB954" : "#888"}
						/>
					</Pressable>
					<Pressable onPress={playPrev} hitSlop={8}>
						<Ionicons name="play-skip-back" size={20} color="#fff" />
					</Pressable>
					<Pressable style={styles.playBtn} onPress={togglePlay}>
						<Ionicons
							name={isPlaying ? "pause" : "play"}
							size={20}
							color="#121212"
						/>
					</Pressable>
					<Pressable onPress={playNext} hitSlop={8}>
						<Ionicons name="play-skip-forward" size={20} color="#fff" />
					</Pressable>
					<Pressable onPress={cycleRepeat} hitSlop={8}>
						<Ionicons
							name={repeatMode === "one" ? "repeat-outline" : "repeat"}
							size={18}
							color={repeatMode !== "off" ? "#1DB954" : "#888"}
						/>
					</Pressable>
				</View>

				<View style={styles.progressRow}>
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
			</View>

			<View style={styles.right} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		bottom: 60,
		left: 0,
		right: 0,
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#181818",
		borderTopColor: "#282828",
		borderTopWidth: StyleSheet.hairlineWidth,
		paddingHorizontal: 16,
		paddingVertical: 10,
		height: 90,
		zIndex: 100,
	},
	left: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		minWidth: 0,
	},
	artwork: { width: 48, height: 48, flexShrink: 0 },
	artworkImg: { width: 48, height: 48, borderRadius: 4 },
	artworkPlaceholder: {
		width: 48,
		height: 48,
		borderRadius: 4,
		backgroundColor: "#282828",
		alignItems: "center",
		justifyContent: "center",
	},
	trackInfo: { flex: 1, minWidth: 0 },
	title: { color: "#fff", fontSize: 13, fontWeight: "500" },
	artist: { color: "#aaa", fontSize: 12, marginTop: 2 },
	center: {
		flex: 2,
		alignItems: "center",
		gap: 6,
		paddingHorizontal: 16,
	},
	controls: {
		flexDirection: "row",
		alignItems: "center",
		gap: 20,
	},
	playBtn: {
		backgroundColor: "#fff",
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: "center",
		justifyContent: "center",
	},
	progressRow: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	slider: { flex: 1 },
	time: { color: "#aaa", fontSize: 11, width: 36, textAlign: "center" },
	right: { flex: 1 },
});
