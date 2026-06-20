import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { api, clearToken } from "../api";
import { useNavigation } from "@react-navigation/native";

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const [apiUrl, setApiUrl] = useState("http://localhost:3000");
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await clearToken();
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API Configuration</Text>
        <TextInput
          style={styles.input}
          value={apiUrl}
          onChangeText={setApiUrl}
          placeholder="API URL"
          placeholderTextColor="#555"
          autoCapitalize="none"
        />
        <Text style={styles.hint}>Backend server URL for video cloud sync</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>1.5.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Platform</Text>
          <Text style={styles.infoValue}>Android</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Sync</Text>
          <Text style={styles.infoValue}>Active</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f17", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 24 },
  section: { backgroundColor: "#1a1a2e", borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: "#a78bfa", marginBottom: 12, textTransform: "uppercase" },
  input: { backgroundColor: "#0f0f17", borderRadius: 8, padding: 12, color: "#fff", fontSize: 14, borderWidth: 1, borderColor: "#2a2a3a" },
  hint: { fontSize: 12, color: "#555", marginTop: 8 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  infoLabel: { fontSize: 14, color: "#888" },
  infoValue: { fontSize: 14, color: "#fff", fontWeight: "500" },
  logoutButton: { backgroundColor: "#7f1d1d", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
