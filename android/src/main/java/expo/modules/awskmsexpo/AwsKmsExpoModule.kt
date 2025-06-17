package expo.modules.awskmsexpo

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import com.amazonaws.auth.BasicSessionCredentials
import com.amazonaws.services.kms.AWSKMSClient
import com.amazonaws.services.kms.AWSKMS
import com.amazonaws.services.kms.model.*
import android.util.Base64
import java.nio.ByteBuffer
import javax.crypto.Cipher
import javax.crypto.spec.SecretKeySpec
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import com.amazonaws.regions.Region
import com.amazonaws.regions.Regions

class KmsOptions : Record {
    @Field
    lateinit var accessKey: String
    @Field
    lateinit var secretKey: String
    @Field
    lateinit var sessionToken: String
    @Field
    lateinit var keyId: String
    @Field
    var endpoint: String? = null
}

class AwsKmsExpoModule : Module() {
  private var kmsClient: AWSKMS? = null
  private var keyId: String? = null

  companion object {
    const val AES_ALGORITHM = "AES"
    const val AES_PADDING = "AES/ECB/PKCS5Padding"
  }
  
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('AwsKmsExpo')` in JavaScript.
    Name("AwsKmsExpo")

      AsyncFunction("init") { options: KmsOptions, promise: Promise ->
          try {
              val credentials = BasicSessionCredentials(options.accessKey, options.secretKey, options.sessionToken)
              val client = AWSKMSClient(credentials)

              val region = Region.getRegion(Regions.AP_NORTHEAST_2)
              client.setRegion(region)

              options.endpoint?.let {
                  client.setEndpoint(it)
              }
              
              this@AwsKmsExpoModule.kmsClient = client
              this@AwsKmsExpoModule.keyId = options.keyId
              promise.resolve("AWS KMS Client initialized successfully")
          } catch (e: Exception) {
              promise.reject("INIT_ERROR", "Failed to initialize AWS KMS Client: ${e.message}", e)
          }
      }

      AsyncFunction("encrypt") { plaintext: String, promise: Promise ->
          try {
              val client = this@AwsKmsExpoModule.kmsClient ?: throw IllegalStateException("KMS Client not initialized")
              val currentKeyId = this@AwsKmsExpoModule.keyId ?: throw IllegalStateException("KMS keyId not set")

              // 1. Generate data key from KMS
              val keyRequest = GenerateDataKeyRequest()
              keyRequest.keyId = currentKeyId
              keyRequest.setKeySpec(DataKeySpec.AES_256)

              val generateDataKeyResult = client.generateDataKey(keyRequest)
              val plaintextKeyBuffer = generateDataKeyResult.plaintext
              val encryptedKeyBuffer = generateDataKeyResult.ciphertextBlob

              val plaintextKeyBytes = ByteArray(plaintextKeyBuffer.remaining())
              plaintextKeyBuffer.get(plaintextKeyBytes)

              // 2. Encrypt the plaintext locally using the plaintext data key
              val secretKey = SecretKeySpec(plaintextKeyBytes, AES_ALGORITHM)
              val cipher = Cipher.getInstance(AES_PADDING)
              cipher.init(Cipher.ENCRYPT_MODE, secretKey)
              val ciphertext = cipher.doFinal(plaintext.toByteArray(Charsets.UTF_8))

              // 3. Encode everything to Base64
              val encryptedKeyBytes = ByteArray(encryptedKeyBuffer.remaining())
              encryptedKeyBuffer.get(encryptedKeyBytes)
              val encryptedKeyB64 = Base64.encodeToString(encryptedKeyBytes, Base64.DEFAULT)
              val ciphertextB64 = Base64.encodeToString(ciphertext, Base64.DEFAULT)

              val result = "$ciphertextB64:DDOCDOC:$encryptedKeyB64"

              promise.resolve(result)
          } catch (e: Exception) {
              promise.reject("ENCRYPT_ERROR", "Failed to encrypt data: ${e.message}", e)
          }
      }

      AsyncFunction("decrypt") { encryptedText: String, promise: Promise ->
          try {
              val client = this@AwsKmsExpoModule.kmsClient ?: throw IllegalStateException("KMS Client not initialized")

              val parts = encryptedText.split(":DDOCDOC:")
              if (parts.size != 2) {
                  throw IllegalArgumentException("Invalid encrypted text format")
              }
              val ciphertextB64 = parts[0]
              val encryptedKeyB64 = parts[1]

              // 1. Decrypt the data key using KMS
              val encryptedKeyBytes = Base64.decode(encryptedKeyB64, Base64.DEFAULT)
              val decryptRequest = DecryptRequest().withCiphertextBlob(ByteBuffer.wrap(encryptedKeyBytes))
              val decryptResult = client.decrypt(decryptRequest)
              val plaintextKey = decryptResult.plaintext

              val plaintextKeyBytes = ByteArray(plaintextKey.remaining())
              plaintextKey.get(plaintextKeyBytes)
              
              // 2. Decode the application-encrypted ciphertext
              val ciphertextBytes = Base64.decode(ciphertextB64, Base64.DEFAULT)

              // 3. Decrypt the ciphertext locally using the plaintext data key
              val secretKey = SecretKeySpec(plaintextKeyBytes,  AES_ALGORITHM)
              val cipher = Cipher.getInstance(AES_PADDING)
              cipher.init(Cipher.DECRYPT_MODE, secretKey)
              val decryptedBytes = cipher.doFinal(ciphertextBytes)

              promise.resolve(String(decryptedBytes, Charsets.UTF_8))
          } catch (e: Exception) {
              promise.reject("DECRYPT_ERROR", "Failed to decrypt data: ${e.message}", e)
          }
      }
  }
}
