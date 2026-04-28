import RNSlider from "@react-native-community/slider";
import { Platform, StyleSheet, View } from "react-native";

interface Props {
	value: number;
	minimumValue: number;
	maximumValue: number;
	onSlidingComplete: (value: number) => void;
	style?: object;
}

export default function Slider({
	value,
	minimumValue,
	maximumValue,
	onSlidingComplete,
	style,
}: Props) {
	if (Platform.OS === "web") {
		return (
			<View style={[styles.webWrapper, style]}>
				<input
					type="range"
					min={minimumValue}
					max={maximumValue}
					value={value}
					onChange={(e) => onSlidingComplete(Number(e.target.value))}
					style={webInputStyle}
				/>
			</View>
		);
	}

	return (
		<RNSlider
			style={style}
			minimumValue={minimumValue}
			maximumValue={maximumValue}
			value={value}
			onSlidingComplete={onSlidingComplete}
			minimumTrackTintColor="#1DB954"
			maximumTrackTintColor="#555"
			thumbTintColor="#fff"
		/>
	);
}

const styles = StyleSheet.create({
	webWrapper: { flex: 1, justifyContent: "center" },
});

const webInputStyle: React.CSSProperties = {
	width: "100%",
	accentColor: "#1DB954",
	cursor: "pointer",
};
