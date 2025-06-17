// Reexport the native module. On web, it will be resolved to AwsKmsExpoModule.web.ts
// and on native platforms to AwsKmsExpoModule.ts
import NativeAwsKmsExpoModule, { type KMSConfig } from "./AwsKmsExpoModule";

const AwsKmsExpoModule = {
  async init(config: KMSConfig): Promise<string> {
    return await NativeAwsKmsExpoModule.init({
      accessKey: config.accessKey,
      secretKey: config.secretKey,
      sessionToken: config.sessionToken,
      keyId: config.keyId,
      endpoint: config.endpoint,
    });
  },

  async encrypt(plaintext: string): Promise<string> {
    return await NativeAwsKmsExpoModule.encrypt(plaintext);
  },

  async decrypt(encryptedText: string): Promise<string> {
    return await NativeAwsKmsExpoModule.decrypt(encryptedText);
  },
};

export default AwsKmsExpoModule;
