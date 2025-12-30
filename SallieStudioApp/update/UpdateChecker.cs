using System;
using System.IO;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using SallieStudioApp.Models;

namespace SallieStudioApp.Update
{
    public class UpdateChecker
    {
        private static readonly HttpClient HttpClient = new HttpClient();

        public class UpdateManifest
        {
            public string? Version { get; set; }
            public string? NotesUrl { get; set; }
            public string? InstallerUrl { get; set; }
            public string? Hash { get; set; }
        }

        public static async Task<UpdateManifest?> FetchManifestAsync(string updateChannel, CancellationToken cancellationToken)
        {
            var channel = string.IsNullOrWhiteSpace(updateChannel) ? "stable" : updateChannel.Trim().ToLowerInvariant();
            var manifestUrl = GetManifestUrl(channel);
            if (manifestUrl == null)
            {
                return null;
            }

            using var response = await HttpClient.GetAsync(manifestUrl, cancellationToken).ConfigureAwait(false);
            response.EnsureSuccessStatusCode();
            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken).ConfigureAwait(false);
            var manifest = await JsonSerializer.DeserializeAsync<UpdateManifest>(stream, cancellationToken: cancellationToken).ConfigureAwait(false);
            return manifest;
        }

        public static bool IsNewer(string? remoteVersion, string? currentVersion)
        {
            if (string.IsNullOrWhiteSpace(remoteVersion) || string.IsNullOrWhiteSpace(currentVersion))
            {
                return false;
            }

            if (Version.TryParse(remoteVersion, out var remote) && Version.TryParse(currentVersion, out var current))
            {
                return remote > current;
            }

            return false;
        }

        private static string? GetManifestUrl(string channel)
        {
            return channel switch
            {
                "stable" => "https://example.com/sallie/studio/update/stable/manifest.json",
                "beta" => "https://example.com/sallie/studio/update/beta/manifest.json",
                "canary" => "https://example.com/sallie/studio/update/canary/manifest.json",
                _ => null
            };
        }

        public static async Task DownloadInstallerAsync(string url, string destinationPath, IProgress<double>? progress, CancellationToken cancellationToken)
        {
            using var response = await HttpClient.GetAsync(url, HttpCompletionOption.ResponseHeadersRead, cancellationToken).ConfigureAwait(false);
            response.EnsureSuccessStatusCode();
            var contentLength = response.Content.Headers.ContentLength;

            await using var contentStream = await response.Content.ReadAsStreamAsync(cancellationToken).ConfigureAwait(false);
            await using var fileStream = new FileStream(destinationPath, FileMode.Create, FileAccess.Write, FileShare.None);

            var buffer = new byte[8192];
            long totalRead = 0;
            int read;
            while ((read = await contentStream.ReadAsync(buffer.AsMemory(0, buffer.Length), cancellationToken).ConfigureAwait(false)) > 0)
            {
                await fileStream.WriteAsync(buffer.AsMemory(0, read), cancellationToken).ConfigureAwait(false);
                totalRead += read;

                if (contentLength.HasValue && progress != null)
                {
                    var percent = (double)totalRead / contentLength.Value * 100d;
                    progress.Report(percent);
                }
            }
        }
    }
}
