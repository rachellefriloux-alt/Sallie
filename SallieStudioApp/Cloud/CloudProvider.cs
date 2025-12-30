using System.Threading.Tasks;

namespace SallieStudioApp.Cloud
{
    public interface ICloudProvider
    {
        Task<bool> Upload(string path, byte[] data);
        Task<byte[]?> Download(string path);
        Task<bool> Exists(string path);
    }
}
