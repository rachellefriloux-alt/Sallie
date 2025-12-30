using Microsoft.UI.Xaml;
using System;
using System.IO;
using System.Linq;
using System.Windows.Forms;
using Windows.UI.Notifications;
using SallieStudioApp.Helpers;
using SallieStudioApp.Models;

namespace SallieStudioApp.Tray
{
    public class TrayIcon : IDisposable
    {
        private readonly Window _window;
        private readonly NotifyIcon _notifyIcon;

        public TrayIcon(Window window)
        {
            _window = window;

            _notifyIcon = new NotifyIcon
            {
                Icon = new System.Drawing.Icon(Path.Combine(AppContext.BaseDirectory, "Assets", "sallie-icon.ico")),
                Visible = true,
                Text = "Sallie Studio"
            };

            _notifyIcon.ContextMenuStrip = BuildMenu();
            _notifyIcon.DoubleClick += (s, e) => RestoreWindow();
        }

        private ContextMenuStrip BuildMenu()
        {
            var menu = new ContextMenuStrip();

            menu.Items.Add("Open Sallie Studio", null, (s, e) => RestoreWindow());
            menu.Items.Add(new ToolStripSeparator());

            menu.Items.Add("Start All", null, (s, e) => RunScript("start-all.ps1"));
            menu.Items.Add("Stop All", null, (s, e) => RunScript("stop-all.ps1"));
            menu.Items.Add("Health Check", null, (s, e) => RunScript("health-check.ps1"));

            menu.Items.Add(new ToolStripSeparator());
            menu.Items.Add("Exit", null, (s, e) => ExitApp());

            return menu;
        }

        private async void RunScript(string script)
        {
            string baseDir = AppContext.BaseDirectory;
            string scriptPath = Path.Combine(baseDir, "Scripts", script);
            var result = await ScriptRunner.RunScriptAsync(scriptPath);

            if (IsSilent()) return;
            ShowNotification("Sallie Studio", result.Length > 120 ? result[..120] + "..." : result);
        }

        private bool IsSilent()
        {
            try
            {
                var configPath = Path.Combine(AppContext.BaseDirectory, "config", "studio.json");
                if (!File.Exists(configPath)) return false;
                var json = File.ReadAllText(configPath);
                var root = System.Text.Json.JsonSerializer.Deserialize<StudioConfigRoot>(json);
                if (root == null || !root.Profiles.ContainsKey(root.ActiveProfile)) return false;
                var profile = root.Profiles[root.ActiveProfile];
                return profile.SilentMode;
            }
            catch { return false; }
        }

        private void RestoreWindow()
        {
            _window.Show();
            _window.Activate();
        }

        private void ExitApp()
        {
            _notifyIcon.Visible = false;
            Application.Current.Exit();
        }

        public void ShowNotification(string title, string message)
        {
            try
            {
                var toastXml = ToastNotificationManager.GetTemplateContent(ToastTemplateType.ToastText02);
                var textNodes = toastXml.GetElementsByTagName("text");
                textNodes[0].AppendChild(toastXml.CreateTextNode(title));
                textNodes[1].AppendChild(toastXml.CreateTextNode(message));

                var toast = new ToastNotification(toastXml);
                ToastNotificationManager.CreateToastNotifier("SallieStudio").Show(toast);
            }
            catch
            {
                // Fail silently if notifications are unavailable
            }
        }

        public void Dispose()
        {
            _notifyIcon.Visible = false;
            _notifyIcon.Dispose();
        }
    }
}
