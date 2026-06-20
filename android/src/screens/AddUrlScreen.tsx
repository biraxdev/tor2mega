import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList } from "react-native";
import { api, type Destination } from "../api";

export default function AddUrlScreen() {
  const [url, setUrl] = useState("");
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDest, setSelectedDest] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getDestinations().then((data) => {
      const enabled = data.destinations.filter((d) => d.enabled);
      setDestinations(enabled);
      if (enabled.length > 0) setSelectedDest(enabled[0].id);
    }).catch(() => {});
  }, []);

  const submit = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      await api.createDownload(url.trim(), selectedDest || undefined);
      Alert.alert("Success", "Added to queue!");
      setUrl("");
    } catch (e) {
      Alert.alert("Error", (e as Error).message);
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Video URL</Text>
      <TextInput
        style={styles.input}
        placeholder="https://example.com/video.mp4"
        placeholderTextColor="#555"
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Text style={styles.label}>Destination</Text>
      <FlatList
        data={destinations}
        keyExtractor={(item) => item.id}
        horizontal
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.destChip, selectedDest === item.id && styles.destChipActive]}
            onPress={() => setSelectedDest(item.id)}
          >
            <Text style={[styles.destChipText, selectedDest === item.id && styles.destChipTextActive]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.noDest}>No destinations configured</Text>}
        style={styles.destList}
      />
      <TouchableOpacity style={styles.button} onPress={submit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Sending..." : "Send to Mega"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f17", padding: 20 },
  label: { color: "#999", fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: "#1a1a2e", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12,
    color: "#fff", fontSize: 15,
  },
  destList: { marginTop: 4 },
  destChip: {
    backgroundColor: "#1a1a2e", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    marginRight: 8, borderWidth: 1, borderColor: "#2a2a3a",
  },
  destChipActive: { backgroundColor: "#6d28d9", borderColor: "#6d28d9" },
  destChipText: { color: "#999", fontSize: 13 },
  destChipTextActive: { color: "#fff" },
  noDest: { color: "#555", fontSize: 13 },
  button: {
    backgroundColor: "#6d28d9", borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 24,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
