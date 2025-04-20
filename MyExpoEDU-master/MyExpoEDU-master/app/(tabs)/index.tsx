import Map from "@/components/Map";
import { StyleSheet, View } from "react-native";

export default function RootMap() {
  return (
    <View style={styles.container} >
      <Map />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }
});
