using Microsoft.UI.Dispatching;
using Microsoft.UI.Xaml;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Windows.ApplicationModel.Core;
using Windows.Security.Credentials;
using Windows.Security.Cryptography;
using Windows.Storage;
using Windows.System;
using Windows.UI.Popups;

namespace SallieStudioApp.Services
{
    public class AuthenticationService : INotifyPropertyChanged
    {
        #region Singleton
        private static AuthenticationService _instance;
        public static AuthenticationService Instance => _instance ??= new AuthenticationService();
        #endregion

        #region Properties
        private AuthState _authState = new();
        public AuthState AuthState
        {
            get => _authState;
            set
            {
                if (_authState != value)
                {
                    _authState = value;
                    OnPropertyChanged();
                }
            }
        }

        private SecuritySettings _securitySettings = new();
        public SecuritySettings SecuritySettings
        {
            get => _securitySettings;
            set
            {
                if (_securitySettings != value)
                {
                    _securitySettings = value;
                    OnPropertyChanged();
                    SaveSecuritySettings();
                }
            }
        }
        #endregion

        #region Events
        public event EventHandler<User> UserLoggedIn;
        public event EventHandler UserLoggedOut;
        public event EventHandler<string> AuthenticationError;
        public event PropertyChangedEventHandler PropertyChanged;
        #endregion

        #region Private Fields
        private DispatcherQueue _dispatcherQueue;
        private Timer _sessionTimer;
        private PasswordVault _passwordVault;
        private readonly object _lockObject = new object();
        #endregion

        private AuthenticationService()
        {
            _dispatcherQueue = DispatcherQueue.GetForCurrentThread();
            _passwordVault = new PasswordVault();
            LoadSecuritySettings();
            GenerateDeviceFingerprint();
        }

        #region Initialization
        private async void LoadSecuritySettings()
        {
            try
            {
                var settings = ApplicationData.Current.LocalSettings;
                if (settings.Values.TryGetValue("SecuritySettings", out var settingsValue) && 
                    settingsValue is string settingsJson)
                {
                    SecuritySettings = JsonSerializer.Deserialize<SecuritySettings>(settingsJson);
                }
                else
                {
                    SecuritySettings = new SecuritySettings();
                    await SaveSecuritySettings();
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading security settings: {ex.Message}");
                SecuritySettings = new SecuritySettings();
            }
        }

        private async Task SaveSecuritySettings()
        {
            try
            {
                var settings = ApplicationData.Current.LocalSettings;
                var settingsJson = JsonSerializer.Serialize(SecuritySettings);
                settings.Values["SecuritySettings"] = settingsJson;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error saving security settings: {ex.Message}");
            }
        }

        private void GenerateDeviceFingerprint()
        {
            try
            {
                var systemInfo = new
                {
                    MachineName = Environment.MachineName,
                    UserName = Environment.UserName,
                    OSVersion = Environment.OSVersion.ToString(),
                    ProcessorCount = Environment.ProcessorCount,
                    SystemPageSize = Environment.SystemPageSize,
                };

                var fingerprintJson = JsonSerializer.Serialize(systemInfo);
                var fingerprintBytes = Encoding.UTF8.GetBytes(fingerprintJson);
                var hash = SHA256.HashData(fingerprintBytes);
                var fingerprint = Convert.ToBase64String(hash);

                SecuritySettings.DeviceFingerprint = fingerprint;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error generating device fingerprint: {ex.Message}");
                SecuritySettings.DeviceFingerprint = Guid.NewGuid().ToString();
            }
        }
        #endregion

        #region Authentication Methods
        public async Task<bool> LoginAsync(LoginCredentials credentials)
        {
            try
            {
                SetAuthState(isLoading: true, error: null);

                // Validate credentials
                if (string.IsNullOrWhiteSpace(credentials.Email) || 
                    string.IsNullOrWhiteSpace(credentials.Password))
                {
                    throw new ArgumentException("Email and password are required");
                }

                // Check IP restrictions
                if (SecuritySettings.AllowedIPs.Count > 0)
                {
                    var clientIP = await GetClientIPAsync();
                    if (!SecuritySettings.AllowedIPs.Contains(clientIP))
                    {
                        throw new UnauthorizedAccessException("Access denied from this IP address");
                    }
                }

                // Call authentication API
                var authResult = await AuthenticateWithAPIAsync(credentials);
                
                if (authResult.RequiresTwoFactor)
                {
                    return await HandleTwoFactorAuthAsync(authResult.TempToken, credentials);
                }

                // Set authenticated user
                var user = authResult.User;
                await SetAuthenticatedUserAsync(user, authResult.Token, authResult.RefreshToken);

                // Store credentials if remember me is checked
                if (credentials.RememberMe)
                {
                    await StoreCredentialsAsync(credentials.Email, credentials.Password);
                }

                UserLoggedIn?.Invoke(this, user);
                return true;
            }
            catch (Exception ex)
            {
                SetAuthState(isLoading: false, error: ex.Message);
                AuthenticationError?.Invoke(this, ex.Message);
                return false;
            }
        }

        public async Task<bool> RegisterAsync(RegisterData data)
        {
            try
            {
                SetAuthState(isLoading: true, error: null);

                // Validate registration data
                if (string.IsNullOrWhiteSpace(data.Email) || 
                    string.IsNullOrWhiteSpace(data.Password) || 
                    string.IsNullOrWhiteSpace(data.Name))
                {
                    throw new ArgumentException("All fields are required");
                }

                if (data.Password != data.ConfirmPassword)
                {
                    throw new ArgumentException("Passwords do not match");
                }

                if (data.Password.Length < 8)
                {
                    throw new ArgumentException("Password must be at least 8 characters long");
                }

                if (!data.AcceptTerms)
                {
                    throw new ArgumentException("You must accept the terms and conditions");
                }

                // Call registration API
                var registerResult = await RegisterWithAPIAsync(data);
                
                if (registerResult.Success)
                {
                    // Auto-login after successful registration
                    return await LoginAsync(new LoginCredentials
                    {
                        Email = data.Email,
                        Password = data.Password,
                        RememberMe = false,
                    });
                }

                return false;
            }
            catch (Exception ex)
            {
                SetAuthState(isLoading: false, error: ex.Message);
                AuthenticationError?.Invoke(this, ex.Message);
                return false;
            }
        }

        public async Task LogoutAsync()
        {
            try
            {
                // Call logout API
                if (AuthState.Token != null)
                {
                    await LogoutWithAPIAsync(AuthState.Token);
                }

                // Clear authentication state
                await ClearAuthenticationAsync();

                UserLoggedOut?.Invoke(this, EventArgs.Empty);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Logout error: {ex.Message}");
                // Still clear local auth even if API call fails
                await ClearAuthenticationAsync();
            }
        }

        public async Task<bool> UpdateProfileAsync(ProfileUpdates updates)
        {
            try
            {
                if (AuthState.User == null || AuthState.Token == null)
                {
                    throw new InvalidOperationException("User not authenticated");
                }

                var updatedUser = await UpdateProfileWithAPIAsync(AuthState.Token, updates);
                
                if (updatedUser != null)
                {
                    AuthState.User = updatedUser;
                    await SaveUserAsync(updatedUser);
                    return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                SetAuthState(error: ex.Message);
                AuthenticationError?.Invoke(this, ex.Message);
                return false;
            }
        }

        public async Task<bool> ChangePasswordAsync(string currentPassword, string newPassword)
        {
            try
            {
                if (AuthState.Token == null)
                {
                    throw new InvalidOperationException("User not authenticated");
                }

                var success = await ChangePasswordWithAPIAsync(AuthState.Token, currentPassword, newPassword);
                
                if (success && SecuritySettings.RequirePasswordChange)
                {
                    SecuritySettings.RequirePasswordChange = false;
                }

                return success;
            }
            catch (Exception ex)
            {
                SetAuthState(error: ex.Message);
                AuthenticationError?.Invoke(this, ex.Message);
                return false;
            }
        }

        public async Task<string> EnableTwoFactorAsync()
        {
            try
            {
                if (AuthState.Token == null)
                {
                    throw new InvalidOperationException("User not authenticated");
                }

                var result = await EnableTwoFactorWithAPIAsync(AuthState.Token);
                SecuritySettings.TwoFactorEnabled = true;
                return result.QrCode;
            }
            catch (Exception ex)
            {
                SetAuthState(error: ex.Message);
                AuthenticationError?.Invoke(this, ex.Message);
                throw;
            }
        }

        public async Task<bool> AuthenticateWithWindowsHelloAsync()
        {
            try
            {
                // In a real implementation, you'd use Windows Hello APIs
                // For now, we'll simulate the authentication
                var user = await GetUserFromStoredCredentialsAsync();
                if (user != null)
                {
                    await SetAuthenticatedUserAsync(user, "mock_token", "mock_refresh_token");
                    return true;
                }
                return false;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Windows Hello authentication error: {ex.Message}");
                return false;
            }
        }
        #endregion

        #region API Methods
        private async Task<AuthResult> AuthenticateWithAPIAsync(LoginCredentials credentials)
        {
            // Simulate API call - in a real app, this would call your backend
            await Task.Delay(1000);

            // Mock successful authentication
            var user = new User
            {
                Id = Guid.NewGuid().ToString(),
                Email = credentials.Email,
                Name = "Test User",
                Role = "user",
                Permissions = new List<string> { "read", "write" },
                CreatedAt = DateTime.UtcNow,
            };

            return new AuthResult
            {
                User = user,
                Token = "mock_jwt_token",
                RefreshToken = "mock_refresh_token",
                RequiresTwoFactor = false,
            };
        }

        private async Task<RegisterResult> RegisterWithAPIAsync(RegisterData data)
        {
            // Simulate API call
            await Task.Delay(1000);

            return new RegisterResult { Success = true };
        }

        private async Task LogoutWithAPIAsync(string token)
        {
            // Simulate API call
            await Task.Delay(500);
        }

        private async Task<User> UpdateProfileWithAPIAsync(string token, ProfileUpdates updates)
        {
            // Simulate API call
            await Task.Delay(500);

            if (AuthState.User != null)
            {
                var updatedUser = AuthState.User with
                {
                    Name = updates.Name ?? AuthState.User.Name,
                    Avatar = updates.Avatar ?? AuthState.User.Avatar,
                };

                return updatedUser;
            }

            return null;
        }

        private async Task<bool> ChangePasswordWithAPIAsync(string token, string currentPassword, string newPassword)
        {
            // Simulate API call
            await Task.Delay(500);
            return true;
        }

        private async Task<TwoFactorResult> EnableTwoFactorWithAPIAsync(string token)
        {
            // Simulate API call
            await Task.Delay(500);

            return new TwoFactorResult
            {
                QrCode = "data:image/png;base64,mock_qr_code_data",
                SecretKey = "mock_secret_key",
            };
        }

        private async Task<bool> HandleTwoFactorAuthAsync(string tempToken, LoginCredentials credentials)
        {
            // In a real implementation, you'd show a 2FA input dialog
            // For now, we'll simulate successful 2FA
            await Task.Delay(1000);

            var user = new User
            {
                Id = Guid.NewGuid().ToString(),
                Email = credentials.Email,
                Name = "Test User",
                Role = "user",
                Permissions = new List<string> { "read", "write" },
                CreatedAt = DateTime.UtcNow,
            };

            await SetAuthenticatedUserAsync(user, "mock_jwt_token_2fa", "mock_refresh_token_2fa");
            return true;
        }
        #endregion

        #region Storage Methods
        private async Task SetAuthenticatedUserAsync(User user, string token, string refreshToken)
        {
            AuthState.User = user;
            AuthState.Token = token;
            AuthState.RefreshToken = refreshToken;
            AuthState.IsAuthenticated = true;
            AuthState.IsLoading = false;
            AuthState.Error = null;

            await SaveUserAsync(user);
            await SaveTokensAsync(token, refreshToken);
            StartSessionTimer();
        }

        private async Task SaveUserAsync(User user)
        {
            try
            {
                var settings = ApplicationData.Current.LocalSettings;
                var userJson = JsonSerializer.Serialize(user);
                settings.Values["auth_user"] = userJson;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error saving user: {ex.Message}");
            }
        }

        private async Task SaveTokensAsync(string token, string refreshToken)
        {
            try
            {
                var settings = ApplicationData.Current.LocalSettings;
                settings.Values["auth_token"] = token;
                settings.Values["refresh_token"] = refreshToken;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error saving tokens: {ex.Message}");
            }
        }

        private async Task StoreCredentialsAsync(string email, string password)
        {
            try
            {
                var credential = new PasswordCredential("SallieStudio", email, password);
                _passwordVault.Add(credential);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error storing credentials: {ex.Message}");
            }
        }

        private async Task<User> GetUserFromStoredCredentialsAsync()
        {
            try
            {
                var credentials = _passwordVault.FindAllByResource("SallieStudio");
                if (credentials.Count > 0)
                {
                    var credential = credentials[0];
                    // In a real app, you'd use the stored credentials to authenticate
                    return new User
                    {
                        Id = Guid.NewGuid().ToString(),
                        Email = credential.UserName,
                        Name = "Stored User",
                        Role = "user",
                        Permissions = new List<string> { "read", "write" },
                        CreatedAt = DateTime.UtcNow,
                    };
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error retrieving stored credentials: {ex.Message}");
            }
            return null;
        }

        private async Task ClearAuthenticationAsync()
        {
            AuthState.User = null;
            AuthState.Token = null;
            AuthState.RefreshToken = null;
            AuthState.IsAuthenticated = false;
            AuthState.IsLoading = false;
            AuthState.Error = null;

            // Clear stored data
            var settings = ApplicationData.Current.LocalSettings;
            settings.Values.Remove("auth_user");
            settings.Values.Remove("auth_token");
            settings.Values.Remove("refresh_token");

            StopSessionTimer();
        }
        #endregion

        #region Utility Methods
        public bool HasPermission(string permission)
        {
            return AuthState.User?.Permissions.Contains(permission) ?? false;
        }

        public bool HasRole(string role)
        {
            return AuthState.User?.Role == role;
        }

        private void SetAuthState(bool? isLoading = null, string error = null)
        {
            _dispatcherQueue.TryEnqueue(() =>
            {
                if (isLoading.HasValue)
                {
                    AuthState.IsLoading = isLoading.Value;
                }
                if (error != null)
                {
                    AuthState.Error = error;
                }
            });
        }

        private void StartSessionTimer()
        {
            StopSessionTimer();
            _sessionTimer = new Timer(async _ =>
            {
                await LogoutAsync();
            }, null, TimeSpan.FromMilliseconds(SecuritySettings.SessionTimeout), Timeout.InfiniteTimeSpan);
        }

        private void StopSessionTimer()
        {
            _sessionTimer?.Dispose();
            _sessionTimer = null;
        }

        private async Task<string> GetClientIPAsync()
        {
            try
            {
                using var httpClient = new System.Net.Http.HttpClient();
                var response = await httpClient.GetStringAsync("https://api.ipify.org?format=json");
                var ipData = JsonSerializer.Deserialize<Dictionary<string, string>>(response);
                return ipData?["ip"] ?? "unknown";
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error getting client IP: {ex.Message}");
                return "unknown";
            }
        }
        #endregion

        #region INotifyPropertyChanged
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
        #endregion
    }

    #region Supporting Classes
    public class AuthState : INotifyPropertyChanged
    {
        private User _user;
        public User User
        {
            get => _user;
            set
            {
                if (_user != value)
                {
                    _user = value;
                    OnPropertyChanged();
                }
            }
        }

        private string _token;
        public string Token
        {
            get => _token;
            set
            {
                if (_token != value)
                {
                    _token = value;
                    OnPropertyChanged();
                }
            }
        }

        private string _refreshToken;
        public string RefreshToken
        {
            get => _refreshToken;
            set
            {
                if (_refreshToken != value)
                {
                    _refreshToken = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _isAuthenticated;
        public bool IsAuthenticated
        {
            get => _isAuthenticated;
            set
            {
                if (_isAuthenticated != value)
                {
                    _isAuthenticated = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _isLoading;
        public bool IsLoading
        {
            get => _isLoading;
            set
            {
                if (_isLoading != value)
                {
                    _isLoading = value;
                    OnPropertyChanged();
                }
            }
        }

        private string _error;
        public string Error
        {
            get => _error;
            set
            {
                if (_error != value)
                {
                    _error = value;
                    OnPropertyChanged();
                }
            }
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public record User(
        string Id,
        string Email,
        string Name,
        string Role,
        List<string> Permissions,
        DateTime CreatedAt,
        string Avatar = null
    );

    public record LoginCredentials(
        string Email,
        string Password,
        bool RememberMe = false
    );

    public record RegisterData(
        string Email,
        string Password,
        string ConfirmPassword,
        string Name,
        bool AcceptTerms
    );

    public record ProfileUpdates(
        string Name = null,
        string Avatar = null
    );

    public record SecuritySettings(
        bool TwoFactorEnabled = false,
        long SessionTimeout = 3600000,
        bool RequirePasswordChange = false,
        List<string> AllowedIPs = null,
        string DeviceFingerprint = "",
        bool WindowsHelloEnabled = false
    )
    {
        public List<string> AllowedIPs { get; init; } = AllowedIPs ?? new List<string>();
    }

    public record AuthResult(
        User User,
        string Token,
        string RefreshToken,
        bool RequiresTwoFactor,
        string TempToken = null
    );

    public record RegisterResult(
        bool Success
    );

    public record TwoFactorResult(
        string QrCode,
        string SecretKey
    );
    #endregion
}
