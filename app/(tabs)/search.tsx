import { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TrackItem from "@/src/components/TrackItem";
import { usePlayerStore } from "@/src/store/playerStore";

export default function SearchScreen() {
	const { tracks, playTrack } = usePlayerStore();
	const [query, setQuery] = useState("");

	const results = query.trim()
		? tracks.filter(
				(t) =>
					t.title.toLowerCase().includes(query.toLowerCase()) ||
					t.artist.toLowerCase().includes(query.toLowerCase()) ||
					t.album.toLowerCase().includes(query.toLowerCase()),
			)
		: [];

	return (
		<SafeAreaView style={styles.container}>
			<Text style={styles.heading}>Search</Text>
			<View style={styles.inputWrapper}>
				<TextInput
					style={styles.input}
					placeholder="Artists, songs, albums…"
					placeholderTextColor="#888"
					value={query}
					onChangeText={setQuery}
					returnKeyType="search"
					autoCorrect={false}
				/>
			</View>

			{query.trim().length > 0 && results.length === 0 ? (
				<View style={styles.empty}>
					<Text style={styles.emptyText}>No results for "{query}"</Text>
				</View>
			) : (
				<FlatList
					data={results}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<TrackItem track={item} onPress={() => playTrack(item, results)} />
					)}
					contentContainerStyle={{ paddingBottom: 80 }}
				/>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#121212" },
	heading: {
		fontSize: 26,
		fontWeight: "700",
		color: "#fff",
		padding: 16,
		paddingBottom: 8,
	},
	inputWrapper: { paddingHorizontal: 16, paddingBottom: 12 },
	input: {
		backgroundColor: "#282828",
		borderRadius: 8,
		color: "#fff",
		paddingHorizontal: 14,
		paddingVertical: 10,
		fontSize: 15,
	},
	empty: { flex: 1, alignItems: "center", paddingTop: 60 },
	emptyText: { color: "#888", fontSize: 16 },
});
