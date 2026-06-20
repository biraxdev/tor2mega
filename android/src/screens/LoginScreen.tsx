import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { api, setToken, setApiUrl, getToken } from "../api";

export default function LoginScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [serverUrl, setServerUrl] = useState("http://localhost:3000");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await setApiUrl(serverUrl);
      const { token } = await api.login(email, password);
      await setToken(token);
      navigation.replace("Home");
    } catch (e) {
      Alert.alert("Error", (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TOR2MEGA</Text>
      <TextInput
        style={styles.input}
        placeholder="Server URL"
        placeholderTextColor="#666"
        value={serverUrl}
        onChangeText={setServerUrl}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#666"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={login} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Logging in..." : "Login"}</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>Default: admin@tor2mega.local / admin</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f17", justifyContent: "center", padding: 30 },
  title: { fontSize: 28, fontWeight: "bold", color: "#a78bfa", textAlign: "center", marginBottom: 30 },
  input: {
    backgroundColor: "#1a1a2e", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12,
    color: "#fff", marginBottom: 12, fontSize: 15,
  },
  button: {
    backgroundColor: "#6d28d9", borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  hint: { color: "#555", fontSize: 12, textAlign: "center", marginTop: 16 },
});
