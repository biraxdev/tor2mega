import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, RefreshControl, StyleSheet, TouchableOpacity } from "react-native";
import { api, type Download } from "../api";
import { formatBytes, statusColor } from "../utils";

export default function DownloadsScreen() {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await api.getDownloads();
      setDownloads(data.downloads);
    } catch {} finally { setRefreshing(false); }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  const renderItem = ({ item }: { item: Download }) => (
    <View style={styles.item}>
      <Text style={styles.title} numberOfLines={1}>{item.title || item.source_url}</Text>
      <View style={styles.row}>
        <Text style={[styles.status, { color: statusColor(item.status) }]}>{item.status}</Text>
        <Text style={styles.size}>{formatBytes(item.size)}</Text>
      </View>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${item.progress}%` }]} />
      </View>
      <Text style={styles.progressText}>{item.progress}%</Text>
    </View>
  );

  return (
    <FlatList
      data={downloads}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor="#6d28d9" />}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text style={styles.empty}>No downloads yet</Text>}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  item: { backgroundColor: "#1a1a2e", borderRadius: 10, padding: 14, marginBottom: 10 },
  title: { color: "#e0e0e0", fontSize: 14, fontWeight: "600", marginBottom: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  status: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  size: { color: "#666", fontSize: 12 },
  progressContainer: { height: 3, backgroundColor: "#2a2a3a", borderRadius: 2, overflow: "hidden" },
  progressBar: { height: "100%", backgroundColor: "#6d28d9" },
  progressText: { color: "#555", fontSize: 10, marginTop: 4 },
  empty: { color: "#555", textAlign: "center", marginTop: 40, fontSize: 14 },
});
