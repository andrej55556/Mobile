import MarkerList from "@/components/MarkerList";
import { MarkerType } from "@/types";
import { StyleSheet, View } from "react-native";

export default function Markers() {
  return (
    <View style={styles.container}>
      <MarkerList />
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
