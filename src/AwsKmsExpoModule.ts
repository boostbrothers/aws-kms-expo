import { NativeModule, requireNativeModule } from "expo";

export interface KMSConfig {
  accessKey: string;
  secretKey: string;
  sessionToken: string;
  keyId: string;
  endpoint?: string;
}

declare class AwsKmsExpoModule extends NativeModule {
  init(options: KMSConfig): Promise<string>;
  encrypt(plaintext: string): Promise<string>;
  decrypt(encryptedText: string): Promise<string>;
}

export default requireNativeModule<AwsKmsExpoModule>("AwsKmsExpo");
