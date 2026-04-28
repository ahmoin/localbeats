import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import MiniPlayer from "@/src/components/MiniPlayer";

export default function TabLayout() {
	return (
		<>
			<Tabs
				screenOptions={{
					headerShown: false,
					tabBarStyle: styles.tabBar,
					tabBarActiveTintColor: "#1DB954",
					tabBarInactiveTintColor: "#888",
					tabBarLabelStyle: { fontSize: 11 },
				}}
			>
				<Tabs.Screen
					name="index"
					options={{
						title: "Home",
						tabBarIcon: ({ color, size }) => (
							<Ionicons name="home" size={size} color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name="library"
					options={{
						title: "Library",
						tabBarIcon: ({ color, size }) => (
							<Ionicons name="musical-notes" size={size} color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name="search"
					options={{
						title: "Search",
						tabBarIcon: ({ color, size }) => (
							<Ionicons name="search" size={size} color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name="network"
					options={{
						title: "Download",
						tabBarIcon: ({ color, size }) => (
							<Ionicons
								name="cloud-download-outline"
								size={size}
								color={color}
							/>
						),
					}}
				/>
			</Tabs>
			<MiniPlayer />
		</>
	);
}

const styles = StyleSheet.create({
	tabBar: {
		backgroundColor: "#181818",
		borderTopColor: "#282828",
		borderTopWidth: 1,
		height: 60,
		paddingBottom: 8,
	},
});
