import { Text, View, StyleSheet } from "react-native";
import { Link, Stack } from "expo-router"
import React from "react";

export default function NotFoundScreen() {
  return (
    <>
    <View style={styles.constainer}>
      <Link href={"/"} style={styles.button}>
        Go to home
      </Link>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  constainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black"
  },
  text: {
    color: "white"
  },
  button: {
    fontSize: 20,
    textDecorationLine: "underline",
    color: "white"
  }
})