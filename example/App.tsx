import React, { useState } from "react";
import {
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import AwsKmsExpo from "aws-kms-expo";

export default function App() {
  const [accessKey, setAccessKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [sessionToken, setSessionToken] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [keyId, setKeyId] = useState("");
  const [plaintext, setPlaintext] = useState("Hello from aws-kms-expo!");
  const [encryptedText, setEncryptedText] = useState("");
  const [decryptedText, setDecryptedText] = useState("");
  const [status, setStatus] = useState("Not initialized");

  const handleInit = async () => {
    if (!accessKey || !secretKey || !sessionToken || !keyId) {
      Alert.alert(
        "Error",
        "Access Key, Secret Key, Session Token, and Key ID are required."
      );
      return;
    }
    try {
      const result = await AwsKmsExpo.init({
        accessKey,
        secretKey,
        sessionToken,
        keyId,
        endpoint: endpoint || undefined,
      });
      setStatus(result);
      Alert.alert("Success", result);
    } catch (e: any) {
      setStatus(`Initialization failed: ${e.message}`);
      Alert.alert("Error", `Initialization failed: ${e.message}`);
    }
  };

  const handleEncrypt = async () => {
    try {
      setStatus("Encrypting...");
      const result = await AwsKmsExpo.encrypt(plaintext);
      setEncryptedText(result);
      setDecryptedText("");
      setStatus("Encryption successful");
    } catch (e: any) {
      setStatus(`Encryption failed: ${e.message}`);
      Alert.alert("Error", `Encryption failed: ${e.message}`);
      console.log(`Encryption failed: ${e.message}`);
    }
  };

  const handleDecrypt = async () => {
    if (!encryptedText) {
      Alert.alert("Error", "No encrypted text to decrypt.");
      return;
    }
    try {
      setStatus("Decrypting...");
      const result = await AwsKmsExpo.decrypt(encryptedText);
      setDecryptedText(result);
      setStatus("Decryption successful");
    } catch (e: any) {
      setStatus(`Decryption failed: ${e.message}`);
      Alert.alert("Error", `Decryption failed: ${e.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>aws-kms-expo Example</Text>
        <Text style={styles.status}>Status: {status}</Text>

        <View style={styles.group}>
          <Text style={styles.groupHeader}>1. Initialize KMS Client</Text>
          <TextInput
            style={styles.input}
            placeholder="AWS Access Key"
            value={accessKey}
            onChangeText={setAccessKey}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="AWS Secret Key"
            value={secretKey}
            onChangeText={setSecretKey}
            secureTextEntry
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="AWS Session Token"
            value={sessionToken}
            onChangeText={setSessionToken}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="KMS Key ID"
            value={keyId}
            onChangeText={setKeyId}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Endpoint (optional)"
            value={endpoint}
            onChangeText={setEndpoint}
            autoCapitalize="none"
          />
          <Button title="Initialize" onPress={handleInit} />
        </View>

        <View style={styles.group}>
          <Text style={styles.groupHeader}>2. Encrypt Data</Text>
          <TextInput
            style={styles.input}
            placeholder="Plaintext"
            value={plaintext}
            onChangeText={setPlaintext}
          />
          <Button title="Encrypt" onPress={handleEncrypt} />
        </View>

        {encryptedText ? (
          <View style={styles.group}>
            <Text style={styles.groupHeader}>3. Decrypt Data</Text>
            <Text style={styles.resultLabel}>Encrypted Text:</Text>
            <Text style={styles.resultText} selectable>
              {encryptedText}
            </Text>
            <Button title="Decrypt" onPress={handleDecrypt} />
            {decryptedText ? (
              <>
                <Text style={styles.resultLabel}>Decrypted Text:</Text>
                <Text style={styles.resultText}>{decryptedText}</Text>
              </>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  status: {
    textAlign: "center",
    marginBottom: 16,
    color: "gray",
  },
  group: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  groupHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  resultLabel: {
    fontWeight: "bold",
    marginTop: 8,
  },
  resultText: {
    marginTop: 4,
    marginBottom: 12,
    backgroundColor: "#eee",
    padding: 8,
    borderRadius: 4,
  },
});
