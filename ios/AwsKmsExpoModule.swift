import ExpoModulesCore
import AWSKMS
import AWSCore
import Foundation
import CryptoSwift

public class AwsKmsExpoModule: Module {
  private var kmsClient: AWSKMS?
  private var keyId: String?
    
  struct KMSConfig: Record {
    @Field
    var accessKey: String
    @Field
    var secretKey: String
    @Field
    var sessionToken: String
    @Field
    var keyId: String
    @Field
    var endpoint: String?
  }
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('AwsKmsExpo')` in JavaScript.
    Name("AwsKmsExpo")

    AsyncFunction("init") { (options: KMSConfig, promise: Promise) in
        self.keyId = options.keyId
        let credentials = AWSBasicSessionCredentialsProvider(
            accessKey: options.accessKey,
            secretKey: options.secretKey,
            sessionToken: options.sessionToken
        )
        
        let serviceConfig: AWSServiceConfiguration
        if let endpoint = options.endpoint {
            serviceConfig = AWSServiceConfiguration(
                region: .APNortheast2,
                endpoint: AWSEndpoint(urlString: endpoint),
                credentialsProvider: credentials
            )
        } else {
            serviceConfig = AWSServiceConfiguration(
                region: .APNortheast2,
                credentialsProvider: credentials
            )
        }
        
        AWSKMS.register(with: serviceConfig, forKey: options.keyId)
        self.kmsClient = AWSKMS(forKey: options.keyId)
        promise.resolve("AWS KMS Client initialized successfully")
    }
    
    AsyncFunction("encrypt") { (plaintext: String, promise: Promise) in
        guard let kmsClient = self.kmsClient, let keyId = self.keyId else {
            promise.reject("CLIENT_NOT_INITIALIZED", "KMS Client not initialized. Call init() first.")
            return
        }
        
        let dataKeyRequest = AWSKMSGenerateDataKeyRequest()
        dataKeyRequest?.keyId = keyId
        dataKeyRequest?.keySpec = AWSKMSDataKeySpec.aes256
        
        kmsClient.generateDataKey(dataKeyRequest!).continueWith { task in
            if let error = task.error {
                promise.reject("ENCRYPT_ERROR", "Failed to generate data key: \(error.localizedDescription)")
                return nil
            }
            
            guard let dataKeyResult = task.result,
                  let plaintextKey = dataKeyResult.plaintext,
                  let encryptedKey = dataKeyResult.ciphertextBlob else {
                promise.reject("ENCRYPT_ERROR", "Invalid data key result")
                return nil
            }
            
            
            let encryptedText = self.encryptWithAES(plaintext: plaintext, key: plaintextKey)
            let encryptedKeyBase64 = encryptedKey.base64EncodedString().replacingOccurrences(of: "\n", with: "")
            
            
            let result = encryptedText.isEmpty ? encryptedText : "\(encryptedText):DDOCDOC:\(encryptedKeyBase64)"
            promise.resolve(result)
            
            return nil
        }
    }
    
    AsyncFunction("decrypt") { (encryptedText: String, promise: Promise) in
        guard let kmsClient = self.kmsClient else {
            promise.reject("CLIENT_NOT_INITIALIZED", "KMS Client not initialized. Call init() first.")
            return
        }
        
        let components = encryptedText.components(separatedBy: ":DDOCDOC:")
        guard components.count == 2 else {
            promise.reject("DECRYPT_ERROR", "Invalid encrypted text format")
            return
        }
        
        let ciphertext = components[0]
        let encryptedKeyBase64 = components[1]
        
        guard let encryptedKeyData = Data(base64Encoded: encryptedKeyBase64) else {
            promise.reject("DECRYPT_ERROR", "Invalid encrypted key format")
            return
        }
        
        let decryptRequest = AWSKMSDecryptRequest()
        decryptRequest?.ciphertextBlob = encryptedKeyData
        
        kmsClient.decrypt(decryptRequest!).continueWith { task in
            if let error = task.error {
                promise.reject("DECRYPT_ERROR", "Failed to decrypt key: \(error.localizedDescription)")
                return nil
            }
            
            guard let decryptResult = task.result,
                  let plaintextKey = decryptResult.plaintext else {
                promise.reject("DECRYPT_ERROR", "Invalid decrypt result")
                return nil
            }
            
            
            let plaintext = self.decryptWithAES(ciphertext: ciphertext, key: plaintextKey)
            promise.resolve(plaintext)
            
            return nil
        }
    }
  }

  private func encryptWithAES(plaintext: String, key: Data) -> String {
      let textByte: [UInt8] = Array(plaintext.utf8)
      let keyBytes: [UInt8] = key.bytes
      
      do {
          let aes = try AES(key: keyBytes, blockMode: ECB(), padding: .pkcs5)
          let encryptedBytes = try aes.encrypt(textByte)
          return Data(encryptedBytes).base64EncodedString()
      } catch {
          return ""
      }
  }
  
  private func decryptWithAES(ciphertext: String, key: Data) -> String {
      guard let data = Data(base64Encoded: ciphertext) else { return "" }
      let keyBytes: [UInt8] = key.bytes
      let encryptedBytes: [UInt8] = data.bytes

      do {
          let aes = try AES(key: keyBytes, blockMode: ECB(), padding: .pkcs5)
          let decryptedBytes = try aes.decrypt(encryptedBytes)
          return String(data: Data(decryptedBytes), encoding: .utf8) ?? ""
      } catch {
          return ""
      }
  }
}
