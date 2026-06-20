import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { api, type Stats } from "../api";
import { formatBytes } from "../utils";

export default function HomeScreen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await api.getStats();
      setStats(data.stats);
    } catch {} finally { setRefreshing(false); }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  if (!stats) return <View style={styles.container}><Text style={styles.loading}>Loading...</Text></View>;

  const cards = [
    { label: "Total Downloads", value: String(stats.totalDownloads), color: "#60a5fa" },
    { label: "Total Uploads", value: String(stats.totalUploads), color: "#4ade80" },
    { label: "Files Today", value: String(stats.filesToday), color: "#a78bfa" },
    { label: "Success Rate", value: `${stats.successRate}%`, color: stats.successRate >= 80 ? "#4ade80" : "#fb923c" },
    { label: "Active Queue", value: String(stats.activeQueue), color: "#fb923c" },
    { label: "Storage Sent", value: formatBytes(stats.storageSent), color: "#a78bfa" },
  ];

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor="#6d28d9" />}
    >
      <Text style={styles.title}>Dashboard</Text>
      <View style={styles.grid}>
        {cards.map((card) => (
          <View key={card.label} style={styles.card}>
            <Text style={[styles.cardValue, { color: card.color }]}>{card.value}</Text>
            <Text style={styles.cardLabel}>{card.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#0f0f17", minHeight: "100%" },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: {
    backgroundColor: "#1a1a2e", borderRadius: 12, padding: 16, width: "48%", marginBottom: 12,
  },
  cardValue: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  cardLabel: { color: "#666", fontSize: 12 },
  loading: { color: "#666", textAlign: "center", marginTop: 40 },
});
