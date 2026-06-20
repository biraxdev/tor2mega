import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import VideoPlayer from "react-native-video";
import { api, type Video } from "../api";

export default function PlayerScreen({ route, navigation }: { route: any; navigation: any }) {
  const video: Video = route.params?.video;
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    api.getVideoStreamUrl(video.id).then(setStreamUrl);
  }, [video.id]);

  if (!streamUrl) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading video...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{video.title}</Text>
      </View>
      <VideoPlayer
        ref={playerRef}
        source={{ uri: streamUrl }}
        style={styles.video}
        controls
        paused={paused}
        rate={rate}
        resizeMode="contain"
        onError={(e: any) => Alert.alert("Error", "Failed to play video")}
      />
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => setPaused(!paused)}
        >
          <Text style={styles.btnText}>{paused ? "▶ Play" : "⏸ Pause"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, rate === 1 && styles.btnActive]}
          onPress={() => setRate(1)}
        >
          <Text style={styles.btnText}>1x</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, rate === 1.5 && styles.btnActive]}
          onPress={() => setRate(1.5)}
        >
          <Text style={styles.btnText}>1.5x</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, rate === 2 && styles.btnActive]}
          onPress={() => setRate(2)}
        >
          <Text style={styles.btnText}>2x</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f17" },
  header: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#2a2a3a" },
  title: { color: "#fff", fontSize: 16, fontWeight: "600" },
  video: { width: "100%", aspectRatio: 16 / 9, backgroundColor: "#000" },
  controls: { flexDirection: "row", gap: 8, padding: 12, justifyContent: "center" },
  btn: { backgroundColor: "#1a1a2e", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  btnActive: { backgroundColor: "#6d28d9" },
  btnText: { color: "#fff", fontSize: 14 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0f0f17" },
  loadingText: { color: "#666", fontSize: 14 },
});
