using Microsoft.Web.WebView2.Core;
using SallieStudioApp.Cloud;
using SallieStudioApp.Helpers;
using SallieStudioApp.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Windows.UI.Notifications;

namespace SallieStudioApp.Bridge
{
    /// <summary>
    /// Handles communication between the web app (JavaScript) and native C# code.
    /// Implements the bridge API defined in the consolidation plan.
    /// </summary>
    public class NativeBridge
    {
        private readonly MainWindow _mainWindow;
        private readonly CoreWebView2 _webView;
        private readonly StudioConfigRoot _config;
        private readonly JsonSerializerOptions _jsonOptions;
        private readonly object _configLock = new object();

        public NativeBridge(MainWindow mainWindow, CoreWebView2 webView, StudioConfigRoot config)
        {
            _mainWindow = mainWindow;
            _webView = webView;
            _config = config;
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false
            };
        }

        public Task InitializeAsync()
        {
            // Bridge is ready
            _mainWindow.AppendLog("[Bridge] Native bridge initialized");
            return Task.CompletedTask;
        }

        /// <summary>
        /// Handle incoming messages from the web app via postMessage
        /// </summary>
        public async Task HandleWebMessage(string messageJson)
        {
            try
            {
                var message = JsonSerializer.Deserialize<BridgeMessage>(messageJson, _jsonOptions);
                if (message == null) return;

                var response = message.Type switch
                {
                    "getVersion" => HandleGetVersion(),
                    "notification" => HandleNotification(message),
                    "cloudSync" => await HandleCloudSync(),
                    "getCloudSyncStatus" => HandleGetCloudSyncStatus(),
                    "getPlugins" => HandleGetPlugins(),
                    "executePlugin" => await HandleExecutePlugin(message),
                    "togglePlugin" => HandleTogglePlugin(message),
                    "runScript" => await HandleRunScript(message),
                    "getSetting" => HandleGetSetting(message),
                    "setSetting" => HandleSetSetting(message),
                    "openDevConsole" => HandleOpenDevConsole(),
                    "ping" => new BridgeResponse { Success = true, Data = "pong" },
                    _ => new BridgeResponse { Success = false, Error = $"Unknown message type: {message.Type}" }
                };

                // Send response back to web app
                await SendResponseAsync(message.Type, response);
            }
            catch (Exception ex)
            {
                _mainWindow.AppendLog($"[Bridge] Error handling message: {ex.Message}");
            }
        }

        private async Task SendResponseAsync(string type, BridgeResponse response)
        {
            try
            {
                var responseWrapper = new
                {
                    type = $"{type}Response",
                    success = response.Success,
                    data = response.Data,
                    error = response.Error
                };

                var json = JsonSerializer.Serialize(responseWrapper, _jsonOptions);
                var script = $"window.dispatchEvent(new CustomEvent('sallieBridgeResponse', {{ detail: {json} }}));";
                await _webView.ExecuteScriptAsync(script);
            }
            catch (Exception ex)
            {
                _mainWindow.AppendLog($"[Bridge] Error sending response: {ex.Message}");
            }
        }

        #region Message Handlers

        private BridgeResponse HandleGetVersion()
        {
            var version = typeof(MainWindow).Assembly.GetName().Version;
            return new BridgeResponse
            {
                Success = true,
                Data = $"{version?.Major ?? 1}.{version?.Minor ?? 0}.{version?.Build ?? 0}"
            };
        }

        private BridgeResponse HandleNotification(BridgeMessage message)
        {
            try
            {
                var title = message.Title ?? "Sallie";
                var body = message.Body ?? "";

                ShowToastNotification(title, body);
                _mainWindow.AppendLog($"[Bridge] Notification: {title}");

                return new BridgeResponse { Success = true };
            }
            catch (Exception ex)
            {
                return new BridgeResponse { Success = false, Error = ex.Message };
            }
        }

        private void ShowToastNotification(string title, string body)
        {
            try
            {
                var toastXml = ToastNotificationManager.GetTemplateContent(ToastTemplateType.ToastText02);
                var textNodes = toastXml.GetElementsByTagName("text");
                textNodes[0].AppendChild(toastXml.CreateTextNode(title));
                textNodes[1].AppendChild(toastXml.CreateTextNode(body));

                var toast = new ToastNotification(toastXml);
                ToastNotificationManager.CreateToastNotifier("SallieStudio").Show(toast);
            }
            catch
            {
                // Fail silently if notifications are unavailable
            }
        }

        private async Task<BridgeResponse> HandleCloudSync()
        {
            try
            {
                _mainWindow.UpdateSyncStatus("Syncing...");

                if (_config.Cloud.Enabled && !string.IsNullOrWhiteSpace(_config.Cloud.EncryptionKey))
                {
                    var manager = new CloudSyncManager(_config.Cloud);
                    await manager.SyncAllAsync();
                    _mainWindow.AppendLog("[Bridge] Cloud sync completed");
                    _mainWindow.UpdateSyncStatus("Idle");
                    return new BridgeResponse { Success = true, Data = "Sync completed" };
                }

                _mainWindow.UpdateSyncStatus("Not configured");
                return new BridgeResponse { Success = false, Error = "Cloud sync not configured" };
            }
            catch (Exception ex)
            {
                _mainWindow.UpdateSyncStatus("Error");
                return new BridgeResponse { Success = false, Error = ex.Message };
            }
        }

        private BridgeResponse HandleGetCloudSyncStatus()
        {
            try
            {
                lock (_configLock)
                {
                    var status = new
                    {
                        enabled = _config.Cloud.Enabled,
                        provider = _config.Cloud.Provider,
                        lastSync = DateTime.Now.ToString("o"), // Placeholder - would need actual tracking
                        syncInterval = _config.Cloud.SyncIntervalMinutes
                    };

                    return new BridgeResponse { Success = true, Data = status };
                }
            }
            catch (Exception ex)
            {
                return new BridgeResponse { Success = false, Error = ex.Message };
            }
        }

        private BridgeResponse HandleGetPlugins()
        {
            try
            {
                var plugins = _mainWindow.GetPlugins();
                var pluginDtos = plugins.Select(p => new
                {
                    id = p.Id,
                    name = p.Name,
                    description = p.Description,
                    enabled = p.Enabled,
                    commands = p.Commands?.Select(c => new { name = c.Name, description = c.Description })
                }).ToList();

                return new BridgeResponse
                {
                    Success = true,
                    Data = pluginDtos
                };
            }
            catch (Exception ex)
            {
                return new BridgeResponse { Success = false, Error = ex.Message };
            }
        }

        private BridgeResponse HandleTogglePlugin(BridgeMessage message)
        {
            try
            {
                var pluginId = message.PluginId;
                if (string.IsNullOrWhiteSpace(pluginId))
                {
                    return new BridgeResponse { Success = false, Error = "Plugin ID required" };
                }

                var plugins = _mainWindow.GetPlugins();
                var plugin = plugins.FirstOrDefault(p => p.Id == pluginId);

                if (plugin == null)
                {
                    return new BridgeResponse { Success = false, Error = $"Plugin not found: {pluginId}" };
                }

                // Toggle the plugin enabled state
                var newState = !plugin.Enabled;
                PluginLoader.SetPluginEnabled(plugin, newState);
                _mainWindow.AppendLog($"[Bridge] Plugin {plugin.Name} {(newState ? "enabled" : "disabled")}");

                return new BridgeResponse { Success = true, Data = new { enabled = newState } };
            }
            catch (Exception ex)
            {
                return new BridgeResponse { Success = false, Error = ex.Message };
            }
        }

        private async Task<BridgeResponse> HandleExecutePlugin(BridgeMessage message)
        {
            try
            {
                var pluginId = message.PluginId;
                var commandName = message.Command;

                if (string.IsNullOrWhiteSpace(pluginId) || string.IsNullOrWhiteSpace(commandName))
                {
                    return new BridgeResponse { Success = false, Error = "Plugin ID and command name required" };
                }

                var plugins = _mainWindow.GetPlugins();
                var plugin = plugins.FirstOrDefault(p => p.Id == pluginId);

                if (plugin == null)
                {
                    return new BridgeResponse { Success = false, Error = $"Plugin not found: {pluginId}" };
                }

                var command = plugin.Commands?.FirstOrDefault(c => c.Name == commandName);
                if (command == null)
                {
                    return new BridgeResponse { Success = false, Error = $"Command not found: {commandName}" };
                }

                var result = await PluginExecutor.ExecuteCommand(plugin, command);
                _mainWindow.AppendLog($"[Bridge] [{plugin.Name}] {result}");

                return new BridgeResponse { Success = true, Data = result };
            }
            catch (Exception ex)
            {
                return new BridgeResponse { Success = false, Error = ex.Message };
            }
        }

        private async Task<BridgeResponse> HandleRunScript(BridgeMessage message)
        {
            try
            {
                var scriptName = message.ScriptName;
                if (string.IsNullOrWhiteSpace(scriptName))
                {
                    return new BridgeResponse { Success = false, Error = "Script name required" };
                }

                // Validate script name to prevent path traversal
                var allowedScripts = new[] { "start-all.ps1", "stop-all.ps1", "health-check.ps1" };
                if (!allowedScripts.Contains(scriptName))
                {
                    return new BridgeResponse { Success = false, Error = $"Script not allowed: {scriptName}" };
                }

                var scriptPath = Path.Combine(AppContext.BaseDirectory, "Scripts", scriptName);
                var result = await ScriptRunner.RunScriptAsync(scriptPath);
                _mainWindow.AppendLog($"[Bridge] [{scriptName}] {(result.Length > 100 ? result[..100] + "..." : result)}");

                return new BridgeResponse { Success = true, Data = result };
            }
            catch (Exception ex)
            {
                return new BridgeResponse { Success = false, Error = ex.Message };
            }
        }

        private BridgeResponse HandleGetSetting(BridgeMessage message)
        {
            try
            {
                var key = message.Key;
                if (string.IsNullOrWhiteSpace(key))
                {
                    return new BridgeResponse { Success = false, Error = "Setting key required" };
                }

                lock (_configLock)
                {
                    // Get setting from config
                    object? value = key switch
                    {
                        "cloud.enabled" => _config.Cloud.Enabled,
                        "cloud.provider" => _config.Cloud.Provider,
                        "cloud.syncInterval" => _config.Cloud.SyncIntervalMinutes,
                        "activeProfile" => _config.ActiveProfile,
                        _ => null
                    };

                    if (value == null)
                    {
                        // Try to get from active profile
                        if (_config.Profiles.TryGetValue(_config.ActiveProfile, out var profile))
                        {
                            value = key switch
                            {
                                "silentMode" => profile.SilentMode,
                                "darkMode" => profile.DarkMode,
                                "startMinimized" => profile.StartMinimized,
                                "autoStart" => profile.AutoStart,
                                _ => null
                            };
                        }
                    }

                    // Return error if setting key is not recognized
                    if (value == null)
                    {
                        return new BridgeResponse { Success = false, Error = $"Unknown setting key: {key}" };
                    }

                    return new BridgeResponse { Success = true, Data = value };
                }
            }
            catch (Exception ex)
            {
                return new BridgeResponse { Success = false, Error = ex.Message };
            }
        }

        private BridgeResponse HandleSetSetting(BridgeMessage message)
        {
            try
            {
                var key = message.Key;
                var value = message.Value;

                if (string.IsNullOrWhiteSpace(key))
                {
                    return new BridgeResponse { Success = false, Error = "Setting key required" };
                }

                lock (_configLock)
                {
                    bool settingHandled = false;

                    // Set setting in config
                    switch (key)
                    {
                        case "cloud.enabled":
                            _config.Cloud.Enabled = Convert.ToBoolean(value);
                            settingHandled = true;
                            break;
                        case "cloud.provider":
                            _config.Cloud.Provider = value?.ToString() ?? "local";
                            settingHandled = true;
                            break;
                        case "cloud.syncInterval":
                            _config.Cloud.SyncIntervalMinutes = Convert.ToInt32(value);
                            settingHandled = true;
                            break;
                        default:
                            // Try to set in active profile
                            if (_config.Profiles.TryGetValue(_config.ActiveProfile, out var profile))
                            {
                                switch (key)
                                {
                                    case "silentMode":
                                        profile.SilentMode = Convert.ToBoolean(value);
                                        settingHandled = true;
                                        break;
                                    case "darkMode":
                                        profile.DarkMode = Convert.ToBoolean(value);
                                        settingHandled = true;
                                        break;
                                    case "startMinimized":
                                        profile.StartMinimized = Convert.ToBoolean(value);
                                        settingHandled = true;
                                        break;
                                    case "autoStart":
                                        profile.AutoStart = Convert.ToBoolean(value);
                                        if (profile.AutoStart)
                                            AutoStart.Enable();
                                        else
                                            AutoStart.Disable();
                                        settingHandled = true;
                                        break;
                                }
                            }
                            break;
                    }

                    // Return error if setting key is not recognized
                    if (!settingHandled)
                    {
                        return new BridgeResponse { Success = false, Error = $"Unknown setting key: {key}" };
                    }

                    // Save config
                    SaveConfig();
                    _mainWindow.AppendLog($"[Bridge] Setting updated: {key}");

                    return new BridgeResponse { Success = true };
                }
            }
            catch (Exception ex)
            {
                return new BridgeResponse { Success = false, Error = ex.Message };
            }
        }

        private void SaveConfig()
        {
            try
            {
                var configPath = Path.Combine(AppContext.BaseDirectory, "config", "studio.json");
                var configDir = Path.GetDirectoryName(configPath);
                if (!string.IsNullOrEmpty(configDir) && !Directory.Exists(configDir))
                {
                    Directory.CreateDirectory(configDir);
                }

                var json = JsonSerializer.Serialize(_config, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(configPath, json);
            }
            catch (Exception ex)
            {
                _mainWindow.AppendLog($"[Bridge] Failed to save config: {ex.Message}");
            }
        }

        private BridgeResponse HandleOpenDevConsole()
        {
            try
            {
                _mainWindow.DispatcherQueue.TryEnqueue(() =>
                {
                    var console = new DeveloperConsole();
                    var window = new Microsoft.UI.Xaml.Window
                    {
                        Title = "Sallie Studio — Developer Console",
                        Content = console
                    };
                    window.Activate();
                });

                return new BridgeResponse { Success = true };
            }
            catch (Exception ex)
            {
                return new BridgeResponse { Success = false, Error = ex.Message };
            }
        }

        #endregion
    }

    #region Message Models

    public class BridgeMessage
    {
        public string Type { get; set; } = "";
        public string? Title { get; set; }
        public string? Body { get; set; }
        public string? PluginId { get; set; }
        public string? Command { get; set; }
        public string? ScriptName { get; set; }
        public string? Key { get; set; }
        public object? Value { get; set; }
    }

    public class BridgeResponse
    {
        public bool Success { get; set; }
        public object? Data { get; set; }
        public string? Error { get; set; }
    }

    #endregion
}
