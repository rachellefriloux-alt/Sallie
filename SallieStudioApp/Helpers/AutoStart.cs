using Microsoft.Win32;
using System;

namespace SallieStudioApp.Helpers
{
    public static class AutoStart
    {
        private const string Key = "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run";

        public static void Enable()
        {
            using var reg = Registry.CurrentUser.OpenSubKey(Key, writable: true);
            reg?.SetValue("SallieStudio", $"\"{AppContext.BaseDirectory}SallieStudioApp.exe\"");
        }

        public static void Disable()
        {
            using var reg = Registry.CurrentUser.OpenSubKey(Key, writable: true);
            reg?.DeleteValue("SallieStudio", false);
        }
    }
}
