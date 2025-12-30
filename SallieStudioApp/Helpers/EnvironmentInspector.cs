using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SallieStudioApp.Helpers
{
    public static class EnvironmentInspector
    {
        public static string GetEnvironment()
        {
            var sb = new StringBuilder();
            foreach (var key in Environment.GetEnvironmentVariables().Keys.Cast<string>())
            {
                sb.AppendLine($"{key} = {Environment.GetEnvironmentVariable(key)}");
            }
            return sb.ToString();
        }

        public static string GetPythonPath()
        {
            var path = Environment.GetEnvironmentVariable("PYTHONPATH");
            return string.IsNullOrWhiteSpace(path) ? "PYTHONPATH not set." : path;
        }

        public static async Task<string> GetDockerLogs()
        {
            var sb = new StringBuilder();
            sb.AppendLine(await Run("docker ps --format \"{{.Names}}\""));
            sb.AppendLine(await Run("docker logs progeny-memory"));
            sb.AppendLine(await Run("docker logs progeny-brain"));
            return sb.ToString();
        }

        public static string GetBackendLogs()
        {
            var logs = Path.Combine(AppContext.BaseDirectory, "logs", "backend.log");
            return File.Exists(logs) ? File.ReadAllText(logs) : "No backend logs found.";
        }

        public static string GetFrontendLogs()
        {
            var logs = Path.Combine(AppContext.BaseDirectory, "logs", "frontend.log");
            return File.Exists(logs) ? File.ReadAllText(logs) : "No frontend logs found.";
        }

        private static async Task<string> Run(string cmd)
        {
            var psi = new ProcessStartInfo
            {
                FileName = "powershell.exe",
                Arguments = $"-NoLogo -NoProfile -Command \"{cmd}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            try
            {
                using var process = new Process { StartInfo = psi };
                process.Start();
                var output = await process.StandardOutput.ReadToEndAsync();
                var error = await process.StandardError.ReadToEndAsync();
                await process.WaitForExitAsync();
                if (!string.IsNullOrWhiteSpace(error))
                {
                    output += $"\n{error}";
                }
                return output.Trim();
            }
            catch (Exception ex)
            {
                return $"Failed to run command: {ex.Message}";
            }
        }
    }
}
