namespace SallieStudioApp.Cloud
{
    public class CloudConfig
    {
        public bool Enabled { get; set; }
        public string Provider { get; set; } = "none"; // local, s3, github, custom
        public string Endpoint { get; set; } = string.Empty;
        public string ApiKey { get; set; } = string.Empty;
        public string EncryptionKey { get; set; } = string.Empty;
        public int SyncIntervalMinutes { get; set; } = 30;
    }
}
