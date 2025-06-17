# aws-kms-expo

`aws-kms-expo`는 React Native (Expo) 애플리케이션에서 AWS Key Management Service (KMS)를 사용하여 데이터를 암호화하고 복호화할 수 있도록 도와주는 네이티브 모듈입니다.

## 설치

```bash
npm install aws-kms-expo
```

또는

```bash
yarn add aws-kms-expo
```

## API

### `init(config)`

AWS KMS 클라이언트를 초기화합니다. 암호화 또는 복호화 함수를 호출하기 전에 반드시 먼저 호출해야 합니다.

**인자:**

- `config` (`KMSConfig`): KMS 클라이언트 설정을 위한 객체입니다.
  - `accessKey` (`string`): AWS 액세스 키 ID.
  - `secretKey` (`string`): AWS 시크릿 액세스 키.
  - `sessionToken` (`string`): AWS 세션 토큰.
  - `keyId` (`string`): 암호화에 사용할 KMS 키 ID.
  - `endpoint` (`string`, 선택 사항): AWS KMS 엔드포인트. 리전을 지정하거나 로컬 테스트 환경(예: LocalStack)을 사용할 때 필요합니다. (예: `kms.us-east-1.amazonaws.com`)

**반환값:**

- `Promise<string>`: 초기화 성공 시 성공 메시지를 담은 Promise를 반환합니다.

### `encrypt(plaintext)`

문자열 데이터를 암호화합니다.

**인자:**

- `plaintext` (`string`): 암호화할 원본 문자열입니다.

**반환값:**

- `Promise<string>`: 암호화된 후 Base64로 인코딩된 문자열을 담은 Promise를 반환합니다.

### `decrypt(ciphertext)`

암호화된 데이터를 복호화합니다.

**인자:**

- `ciphertext` (`string`): 복호화할 암호화된 문자열 (Base64 인코딩).

**반환값:**

- `Promise<string>`: 복호화된 원본 문자열을 담은 Promise를 반환합니다.

## 사용 예제

다음은 `aws-kms-expo` 모듈을 사용하여 AWS 자격 증명으로 클라이언트를 초기화하고, 메시지를 암호화한 후 다시 복호화하는 전체 과정을 보여주는 예제입니다.

```tsx
import React, { useState, useEffect } from "react";
import { Button, SafeAreaView, Text, View, Alert } from "react-native";
import AwsKmsExpo from "aws-kms-expo";

export default function App() {
  const [encryptedText, setEncryptedText] = useState("");
  const [decryptedText, setDecryptedText] = useState("");
  const [status, setStatus] = useState("Not initialized");

  const kmsConfig = {
    accessKey: "YOUR_AWS_ACCESS_KEY",
    secretKey: "YOUR_AWS_SECRET_KEY",
    sessionToken: "YOUR_AWS_SESSION_TOKEN",
    keyId: "YOUR_KMS_KEY_ID",
    // endpoint: "kms.your-region.amazonaws.com" // 필요한 경우 엔드포인트를 지정합니다.
  };

  useEffect(() => {
    const initializeKms = async () => {
      try {
        const result = await AwsKmsExpo.init(kmsConfig);
        setStatus(result);
      } catch (e: any) {
        setStatus(`Initialization failed: ${e.message}`);
        Alert.alert("Error", `Initialization failed: ${e.message}`);
      }
    };
    initializeKms();
  }, []);

  const handleEncrypt = async () => {
    try {
      setStatus("Encrypting...");
      const plaintext = "Hello from aws-kms-expo!";
      const result = await AwsKmsExpo.encrypt(plaintext);
      setEncryptedText(result);
      setDecryptedText(""); // 이전 복호화 결과 초기화
      setStatus("Encryption successful");
      Alert.alert("Encryption Success", `Encrypted Text: ${result}`);
    } catch (e: any) {
      setStatus(`Encryption failed: ${e.message}`);
      Alert.alert("Error", `Encryption failed: ${e.message}`);
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
      Alert.alert("Decryption Success", `Decrypted Text: ${result}`);
    } catch (e: any) {
      setStatus(`Decryption failed: ${e.message}`);
      Alert.alert("Error", `Decryption failed: ${e.message}`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", padding: 16 }}>
      <Text style={{ textAlign: "center", marginBottom: 16, fontWeight: "bold" }}>
        aws-kms-expo Example
      </Text>
      <Text style={{ textAlign: "center", marginBottom: 16 }}>Status: {status}</Text>
      <View>
        <Button title="Encrypt 'Hello from aws-kms-expo!'" onPress={handleEncrypt} />
      </View>
      <View style={{ marginTop: 16 }}>
        <Button title="Decrypt" onPress={handleDecrypt} disabled={!encryptedText} />
      </View>
      {encryptedText ? (
        <Text style={{ marginTop: 16 }}>Encrypted: {encryptedText}</Text>
      ) : null}
      {decryptedText ? (
        <Text style={{ marginTop: 16 }}>Decrypted: {decryptedText}</Text>
      ) : null}
    </SafeAreaView>
  );
}
```
