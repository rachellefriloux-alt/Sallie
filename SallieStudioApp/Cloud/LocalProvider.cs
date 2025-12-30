using System.IO;
using System.Threading.Tasks;

namespace SallieStudioApp.Cloud
{
    public class LocalProvider : ICloudProvider
    {
        private readonly string _root;

        public LocalProvider(string root)
        {
            _root = string.IsNullOrWhiteSpace(root) ? Path.Combine(AppContext.BaseDirectory, "cloud-sync") : root;
            Directory.CreateDirectory(_root);
        }

        public Task<bool> Upload(string path, byte[] data)
        {
            var full = Path.Combine(_root, path);
            Directory.CreateDirectory(Path.GetDirectoryName(full)!);
            File.WriteAllBytes(full, data);
            return Task.FromResult(true);
        }

        public Task<byte[]?> Download(string path)
        {
            var full = Path.Combine(_root, path);
            if (!File.Exists(full))
            {
                return Task.FromResult<byte[]?>(null);
            }

            return Task.FromResult<byte[]?>(File.ReadAllBytes(full));
        }

        public Task<bool> Exists(string path)
        {
            return Task.FromResult(File.Exists(Path.Combine(_root, path)));
        }
    }
}
