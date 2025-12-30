using System;
using System.IO;
using System.Security.Cryptography;

namespace SallieStudioApp.Cloud
{
    public static class CloudEncryption
    {
        public static byte[] Encrypt(byte[] data, string key)
        {
            if (string.IsNullOrWhiteSpace(key))
            {
                throw new InvalidOperationException("Encryption key is required for cloud sync.");
            }

            using var aes = Aes.Create();
            aes.Key = Convert.FromBase64String(key);
            aes.GenerateIV();

            using var encryptor = aes.CreateEncryptor();
            using var ms = new MemoryStream();
            ms.Write(aes.IV, 0, aes.IV.Length);

            using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
            {
                cs.Write(data, 0, data.Length);
            }

            return ms.ToArray();
        }

        public static byte[] Decrypt(byte[] data, string key)
        {
            if (string.IsNullOrWhiteSpace(key))
            {
                throw new InvalidOperationException("Encryption key is required for cloud sync.");
            }

            using var aes = Aes.Create();
            aes.Key = Convert.FromBase64String(key);

            var iv = new byte[16];
            Array.Copy(data, iv, 16);

            using var decryptor = aes.CreateDecryptor(aes.Key, iv);
            using var ms = new MemoryStream(data, 16, data.Length - 16);
            using var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
            using var result = new MemoryStream();
            cs.CopyTo(result);
            return result.ToArray();
        }
    }
}
