using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;

namespace SallieStudioApp.Cloud
{
    public class CloudSyncManager
    {
        private readonly CloudConfig _config;
        private readonly ICloudProvider _provider;

        private static readonly string[] DefaultSyncFiles =
        {
            "config/studio.json",
            "logs/backend.log",
            "logs/frontend.log",
            "logs/studio.log",
            "logs/docker.log",
            "health.json",
            "dashboard.json"
        };

        public CloudSyncManager(CloudConfig config)
        {
            _config = config;
            _provider = config.Provider switch
            {
                "local" => new LocalProvider(config.Endpoint),
                _ => new LocalProvider(config.Endpoint)
            };
        }

        public async Task SyncAllAsync(IEnumerable<string>? extraFiles = null)
        {
            if (!_config.Enabled || string.IsNullOrWhiteSpace(_config.EncryptionKey))
            {
                return;
            }

            var files = extraFiles == null ? DefaultSyncFiles : AppendDefaults(extraFiles);

            foreach (var file in files)
            {
                await SyncFileAsync(file).ConfigureAwait(false);
            }
        }

        public async Task PullAllAsync(IEnumerable<string>? files = null)
        {
            if (!_config.Enabled || string.IsNullOrWhiteSpace(_config.EncryptionKey))
            {
                return;
            }

            var targets = files == null ? new[] { "config/studio.json" } : files;
            foreach (var file in targets)
            {
                await PullFileAsync(file).ConfigureAwait(false);
            }
        }

        private async Task SyncFileAsync(string relativePath)
        {
            var localPath = Path.Combine(AppContext.BaseDirectory, relativePath);
            if (!File.Exists(localPath))
            {
                return;
            }

            try
            {
                var data = await File.ReadAllBytesAsync(localPath).ConfigureAwait(false);
                var encrypted = CloudEncryption.Encrypt(data, _config.EncryptionKey);
                await _provider.Upload(relativePath, encrypted).ConfigureAwait(false);
            }
            catch
            {
                // Swallow sync errors to keep loop resilient; surface via UI later if needed.
            }
        }

        private async Task PullFileAsync(string relativePath)
        {
            try
            {
                var data = await _provider.Download(relativePath).ConfigureAwait(false);
                if (data == null)
                {
                    return;
                }

                var decrypted = CloudEncryption.Decrypt(data, _config.EncryptionKey);
                var localPath = Path.Combine(AppContext.BaseDirectory, relativePath);
                Directory.CreateDirectory(Path.GetDirectoryName(localPath)!);
                await File.WriteAllBytesAsync(localPath, decrypted).ConfigureAwait(false);
            }
            catch
            {
                // Swallow pull errors for now.
            }
        }

        private static IEnumerable<string> AppendDefaults(IEnumerable<string> extra)
        {
            var set = new HashSet<string>(DefaultSyncFiles, StringComparer.OrdinalIgnoreCase);
            foreach (var f in extra)
            {
                set.Add(f);
            }

            return set;
        }
    }
}
