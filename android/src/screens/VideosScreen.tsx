import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import { api, type Video } from "../api";
import { formatBytes } from "../utils";

export default function VideosScreen({ navigation }: { navigation: any }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getVideos(search || undefined);
      setVideos(data.videos);
    } catch (e) {
      Alert.alert("Error", (e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const handleDelete = (video: Video) => {
    Alert.alert("Delete Video", `Delete "${video.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.deleteVideo(video.id);
            setVideos(videos.filter((v) => v.id !== video.id));
          } catch (e) {
            Alert.alert("Error", (e as Error).message);
          }
        },
      },
    ]);
  };

  const handleRename = (video: Video) => {
    Alert.prompt("Rename Video", "Enter new title:", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Save",
        onPress: async (newTitle: string) => {
          if (!newTitle?.trim()) return;
          try {
            const { video: updated } = await api.renameVideo(video.id, newTitle.trim());
            setVideos(videos.map((v) => (v.id === updated.id ? updated : v)));
          } catch (e) {
            Alert.alert("Error", (e as Error).message);
          }
        },
      },
    ]);
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return "";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const renderItem = ({ item }: { item: Video }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => item.status === "ready" && navigation.navigate("Player", { video: item })}
      disabled={item.status !== "ready"}
    >
      <View style={styles.thumbnail}>
        {item.thumbnail ? (
          <Image source={{ uri: item.thumbnail }} style={styles.thumbImg} />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <Text style={styles.thumbIcon}>🎬</Text>
          </View>
        )}
        {item.status !== "ready" && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        )}
        {item.duration > 0 && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
          </View>
        )}
      </View>
      <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.meta}>{formatBytes(item.size)}</Text>
      <View style={styles.actions}>
        {item.status === "ready" && (
          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.navigate("Player", { video: item })}
          >
            <Text style={styles.btnText}>Watch</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.btn} onPress={() => handleRename(item)}>
          <Text style={styles.btnText}>Rename</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={() => handleDelete(item)}>
          <Text style={styles.btnTextDanger}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search videos..."
        placeholderTextColor="#666"
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No videos in your library</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f17", padding: 12 },
  search: {
    backgroundColor: "#1a1a2e",
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 14,
  },
  list: { paddingBottom: 20 },
  card: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    borderRadius: 8,
    margin: 4,
    overflow: "hidden",
  },
  thumbnail: { width: "100%", aspectRatio: 16 / 9, backgroundColor: "#2a2a3a" },
  thumbImg: { width: "100%", height: "100%" },
  thumbPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  thumbIcon: { fontSize: 24 },
  statusBadge: {
    position: "absolute", top: 6, right: 6,
    backgroundColor: "rgba(0,0,0,0.7)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  statusText: { color: "#fbbf24", fontSize: 10, fontWeight: "700" },
  durationBadge: {
    position: "absolute", bottom: 6, right: 6,
    backgroundColor: "rgba(0,0,0,0.7)", paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3,
  },
  durationText: { color: "#fff", fontSize: 10 },
  title: { color: "#e0e0e0", fontSize: 12, fontWeight: "600", padding: 8, paddingBottom: 2 },
  meta: { color: "#666", fontSize: 10, paddingHorizontal: 8, paddingBottom: 6 },
  actions: { flexDirection: "row", gap: 4, paddingHorizontal: 8, paddingBottom: 8 },
  btn: { backgroundColor: "#2a2a3a", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  btnText: { color: "#a78bfa", fontSize: 10 },
  btnDanger: { backgroundColor: "#2a1212" },
  btnTextDanger: { color: "#f87171", fontSize: 10 },
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyText: { color: "#555", fontSize: 14 },
});
