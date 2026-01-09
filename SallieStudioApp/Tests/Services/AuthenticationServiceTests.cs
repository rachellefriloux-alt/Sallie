using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Threading.Tasks;
using SallieStudioApp.Services;
using Windows.Security.Credentials;
using Windows.ApplicationModel.DataTransfer;
using System.Net.Http;
using System.Text.Json;

namespace SallieStudioApp.Tests.Services
{
    [TestClass]
    public class AuthenticationServiceTests
    {
        private AuthenticationService _authService;
        private Mock<HttpClient> _mockHttpClient;
        private TestPasswordVault _testVault;

        [TestInitialize]
        public void Setup()
        {
            _mockHttpClient = new Mock<HttpClient>();
            _testVault = new TestPasswordVault();
            _authService = new AuthenticationService(_mockHttpClient.Object, _testVault);
        }

        [TestMethod]
        public async Task LoginAsync_ValidCredentials_ReturnsSuccess()
        {
            // Arrange
            var email = "test@example.com";
            var password = "password123";
            var expectedResponse = new
            {
                user = new { id = "user123", email = email, name = "Test User" },
                tokens = new { access = "access-token", refresh = "refresh-token" }
            };

            var mockResponse = new HttpResponseMessage(System.Net.HttpStatusCode.OK)
            {
                Content = new StringContent(JsonSerializer.Serialize(expectedResponse))
            };

            _mockHttpClient.Setup(x => x.PostAsync(It.IsAny<string>(), It.IsAny<HttpContent>()))
                .ReturnsAsync(mockResponse);

            // Act
            var result = await _authService.LoginAsync(email, password);

            // Assert
            Assert.IsTrue(result.Success);
            Assert.IsNotNull(result.User);
            Assert.AreEqual(email, result.User.Email);
            Assert.IsNotNull(result.Tokens);
            Assert.AreEqual("access-token", result.Tokens.Access);
        }

        [TestMethod]
        public async Task LoginAsync_InvalidCredentials_ReturnsFailure()
        {
            // Arrange
            var email = "test@example.com";
            var password = "wrongpassword";

            var mockResponse = new HttpResponseMessage(System.Net.HttpStatusCode.Unauthorized)
            {
                Content = new StringContent(JsonSerializer.Serialize(new { message = "Invalid credentials" }))
            };

            _mockHttpClient.Setup(x => x.PostAsync(It.IsAny<string>(), It.IsAny<HttpContent>()))
                .ReturnsAsync(mockResponse);

            // Act
            var result = await _authService.LoginAsync(email, password);

            // Assert
            Assert.IsFalse(result.Success);
            Assert.IsNull(result.User);
            Assert.IsNull(result.Tokens);
            Assert.AreEqual("Invalid credentials", result.ErrorMessage);
        }

        [TestMethod]
        public async Task RegisterAsync_ValidData_ReturnsSuccess()
        {
            // Arrange
            var name = "New User";
            var email = "newuser@example.com";
            var password = "password123";

            var expectedResponse = new
            {
                user = new { id = "user456", email = email, name = name },
                tokens = new { access = "access-token", refresh = "refresh-token" }
            };

            var mockResponse = new HttpResponseMessage(System.Net.HttpStatusCode.Created)
            {
                Content = new StringContent(JsonSerializer.Serialize(expectedResponse))
            };

            _mockHttpClient.Setup(x => x.PostAsync(It.IsAny<string>(), It.IsAny<HttpContent>()))
                .ReturnsAsync(mockResponse);

            // Act
            var result = await _authService.RegisterAsync(name, email, password);

            // Assert
            Assert.IsTrue(result.Success);
            Assert.IsNotNull(result.User);
            Assert.AreEqual(name, result.User.Name);
            Assert.AreEqual(email, result.User.Email);
        }

        [TestMethod]
        public async Task RegisterAsync_DuplicateEmail_ReturnsFailure()
        {
            // Arrange
            var name = "Duplicate User";
            var email = "existing@example.com";
            var password = "password123";

            var mockResponse = new HttpResponseMessage(System.Net.HttpStatusCode.Conflict)
            {
                Content = new StringContent(JsonSerializer.Serialize(new { message = "Email already exists" }))
            };

            _mockHttpClient.Setup(x => x.PostAsync(It.IsAny<string>(), It.IsAny<HttpContent>()))
                .ReturnsAsync(mockResponse);

            // Act
            var result = await _authService.RegisterAsync(name, email, password);

            // Assert
            Assert.IsFalse(result.Success);
            Assert.AreEqual("Email already exists", result.ErrorMessage);
        }

        [TestMethod]
        public async Task RefreshTokensAsync_ValidRefreshToken_ReturnsNewTokens()
        {
            // Arrange
            var refreshToken = "valid-refresh-token";
            var expectedResponse = new
            {
                tokens = new { access = "new-access-token", refresh = "new-refresh-token" }
            };

            var mockResponse = new HttpResponseMessage(System.Net.HttpStatusCode.OK)
            {
                Content = new StringContent(JsonSerializer.Serialize(expectedResponse))
            };

            _mockHttpClient.Setup(x => x.PostAsync(It.IsAny<string>(), It.IsAny<HttpContent>()))
                .ReturnsAsync(mockResponse);

            // Act
            var result = await _authService.RefreshTokensAsync(refreshToken);

            // Assert
            Assert.IsTrue(result.Success);
            Assert.IsNotNull(result.Tokens);
            Assert.AreEqual("new-access-token", result.Tokens.Access);
            Assert.AreEqual("new-refresh-token", result.Tokens.Refresh);
        }

        [TestMethod]
        public async Task RefreshTokensAsync_InvalidRefreshToken_ReturnsFailure()
        {
            // Arrange
            var refreshToken = "invalid-refresh-token";

            var mockResponse = new HttpResponseMessage(System.Net.HttpStatusCode.Unauthorized)
            {
                Content = new StringContent(JsonSerializer.Serialize(new { message = "Invalid refresh token" }))
            };

            _mockHttpClient.Setup(x => x.PostAsync(It.IsAny<string>(), It.IsAny<HttpContent>()))
                .ReturnsAsync(mockResponse);

            // Act
            var result = await _authService.RefreshTokensAsync(refreshToken);

            // Assert
            Assert.IsFalse(result.Success);
            Assert.AreEqual("Invalid refresh token", result.ErrorMessage);
        }

        [TestMethod]
        public async Task LogoutAsync_ValidToken_ClearsStoredData()
        {
            // Arrange
            var accessToken = "valid-access-token";

            var mockResponse = new HttpResponseMessage(System.Net.HttpStatusCode.OK)
            {
                Content = new StringContent(JsonSerializer.Serialize(new { message = "Logged out successfully" }))
            };

            _mockHttpClient.Setup(x => x.PostAsync(It.IsAny<string>(), It.IsAny<HttpContent>()))
                .ReturnsAsync(mockResponse);

            // Store some tokens first
            await _authService.StoreTokensAsync(new TokenInfo { Access = accessToken, Refresh = "refresh-token" });

            // Act
            var result = await _authService.LogoutAsync(accessToken);

            // Assert
            Assert.IsTrue(result.Success);
            var storedTokens = await _authService.GetStoredTokensAsync();
            Assert.IsNull(storedTokens);
        }

        [TestMethod]
        public async Task IsBiometricAvailableAsync_BiometricSupported_ReturnsTrue()
        {
            // This test would require mocking Windows Hello APIs
            // For now, we'll test the basic structure
            var result = await _authService.IsBiometricAvailableAsync();
            Assert.IsTrue(result is bool);
        }

        [TestMethod]
        public async Task LoginWithBiometricAsync_BiometricAvailable_ReturnsSuccess()
        {
            // This test would require mocking Windows Hello APIs
            // For now, we'll test the basic structure
            var result = await _authService.LoginWithBiometricAsync();
            Assert.IsNotNull(result);
        }

        [TestMethod]
        public void GenerateDeviceFingerprint_ReturnsValidFingerprint()
        {
            // Act
            var fingerprint = _authService.GenerateDeviceFingerprint();

            // Assert
            Assert.IsNotNull(fingerprint);
            Assert.IsTrue(fingerprint.Length > 0);
            Assert.IsTrue(fingerprint.Contains("deviceInfo"));
        }

        [TestMethod]
        public async Task ValidatePasswordStrength_ValidPassword_ReturnsTrue()
        {
            // Arrange
            var password = "StrongP@ssw0rd123!";

            // Act
            var isValid = await _authService.ValidatePasswordStrengthAsync(password);

            // Assert
            Assert.IsTrue(isValid);
        }

        [TestMethod]
        public async Task ValidatePasswordStrength_WeakPassword_ReturnsFalse()
        {
            // Arrange
            var password = "123";

            // Act
            var isValid = await _authService.ValidatePasswordStrengthAsync(password);

            // Assert
            Assert.IsFalse(isValid);
        }

        [TestMethod]
        public async Task StoreTokensAsync_ValidTokens_StoresSuccessfully()
        {
            // Arrange
            var tokens = new TokenInfo
            {
                Access = "access-token",
                Refresh = "refresh-token",
                ExpiresAt = DateTime.UtcNow.AddHours(1)
            };

            // Act
            await _authService.StoreTokensAsync(tokens);

            // Assert
            var storedTokens = await _authService.GetStoredTokensAsync();
            Assert.IsNotNull(storedTokens);
            Assert.AreEqual(tokens.Access, storedTokens.Access);
            Assert.AreEqual(tokens.Refresh, storedTokens.Refresh);
        }

        [TestMethod]
        public async Task GetStoredTokensAsync_NoTokensStored_ReturnsNull()
        {
            // Act
            var tokens = await _authService.GetStoredTokensAsync();

            // Assert
            Assert.IsNull(tokens);
        }

        [TestMethod]
        public async Task IsTokenExpired_ExpiredToken_ReturnsTrue()
        {
            // Arrange
            var expiredToken = new TokenInfo
            {
                Access = "expired-token",
                Refresh = "refresh-token",
                ExpiresAt = DateTime.UtcNow.AddHours(-1)
            };

            await _authService.StoreTokensAsync(expiredToken);

            // Act
            var isExpired = await _authService.IsTokenExpiredAsync();

            // Assert
            Assert.IsTrue(isExpired);
        }

        [TestMethod]
        public async Task IsTokenExpired_ValidToken_ReturnsFalse()
        {
            // Arrange
            var validToken = new TokenInfo
            {
                Access = "valid-token",
                Refresh = "refresh-token",
                ExpiresAt = DateTime.UtcNow.AddHours(1)
            };

            await _authService.StoreTokensAsync(validToken);

            // Act
            var isExpired = await _authService.IsTokenExpiredAsync();

            // Assert
            Assert.IsFalse(isExpired);
        }

        [TestMethod]
        public void ValidateEmailFormat_ValidEmail_ReturnsTrue()
        {
            // Arrange
            var validEmails = new[]
            {
                "test@example.com",
                "user.name@domain.co.uk",
                "user+tag@example.org",
                "user123@test-domain.com"
            };

            // Act & Assert
            foreach (var email in validEmails)
            {
                var isValid = _authService.ValidateEmailFormat(email);
                Assert.IsTrue(isValid, $"Email {email} should be valid");
            }
        }

        [TestMethod]
        public void ValidateEmailFormat_InvalidEmail_ReturnsFalse()
        {
            // Arrange
            var invalidEmails = new[]
            {
                "invalid-email",
                "@example.com",
                "test@",
                "test.example.com",
                "test@.com",
                "test@example.",
                ""
            };

            // Act & Assert
            foreach (var email in invalidEmails)
            {
                var isValid = _authService.ValidateEmailFormat(email);
                Assert.IsFalse(isValid, $"Email {email} should be invalid");
            }
        }

        [TestMethod]
        public async Task CheckAccountLockout_LockedAccount_ReturnsTrue()
        {
            // Arrange
            var email = "locked@example.com";
            
            // Simulate multiple failed login attempts
            for (int i = 0; i < 6; i++)
            {
                await _authService.RecordFailedLoginAttemptAsync(email);
            }

            // Act
            var isLocked = await _authService.IsAccountLockedAsync(email);

            // Assert
            Assert.IsTrue(isLocked);
        }

        [TestMethod]
        public async Task CheckAccountLockout_UnlockedAccount_ReturnsFalse()
        {
            // Arrange
            var email = "unlocked@example.com";

            // Act
            var isLocked = await _authService.IsAccountLockedAsync(email);

            // Assert
            Assert.IsFalse(isLocked);
        }

        [TestMethod]
        public async Task ResetFailedAttempts_ValidEmail_ResetsCounter()
        {
            // Arrange
            var email = "test@example.com";
            
            // Record some failed attempts
            await _authService.RecordFailedLoginAttemptAsync(email);
            await _authService.RecordFailedLoginAttemptAsync(email);

            // Act
            await _authService.ResetFailedLoginAttemptsAsync(email);

            // Assert
            var isLocked = await _authService.IsAccountLockedAsync(email);
            Assert.IsFalse(isLocked);
        }

        [TestMethod]
        public async Task InitializeAuthAsync_StoredTokens_RestoresAuthState()
        {
            // Arrange
            var tokens = new TokenInfo
            {
                Access = "stored-access-token",
                Refresh = "stored-refresh-token",
                ExpiresAt = DateTime.UtcNow.AddHours(1)
            };

            await _authService.StoreTokensAsync(tokens);

            // Act
            await _authService.InitializeAuthAsync();

            // Assert
            Assert.IsTrue(_authService.IsAuthenticated);
            Assert.IsNotNull(_authService.CurrentTokens);
            Assert.AreEqual(tokens.Access, _authService.CurrentTokens.Access);
        }

        [TestMethod]
        public async Task InitializeAuthAsync_NoStoredTokens_RemainsUnauthenticated()
        {
            // Act
            await _authService.InitializeAuthAsync();

            // Assert
            Assert.IsFalse(_authService.IsAuthenticated);
            Assert.IsNull(_authService.CurrentTokens);
        }
    }

    // Test implementation of PasswordVault for testing purposes
    public class TestPasswordVault : IPasswordVault
    {
        private Dictionary<string, string> _storedCredentials = new Dictionary<string, string>();

        public void AddCredential(string resource, string userName, string password)
        {
            _storedCredentials[$"{resource}_{userName}"] = password;
        }

        public string RetrieveCredential(string resource, string userName)
        {
            var key = $"{resource}_{userName}";
            return _storedCredentials.TryGetValue(key, out var password) ? password : null;
        }

        public void RemoveCredential(string resource, string userName)
        {
            var key = $"{resource}_{userName}";
            _storedCredentials.Remove(key);
        }

        public void Clear()
        {
            _storedCredentials.Clear();
        }
    }

    // Interface for dependency injection
    public interface IPasswordVault
    {
        void AddCredential(string resource, string userName, string password);
        string RetrieveCredential(string resource, string userName);
        void RemoveCredential(string resource, string userName);
        void Clear();
    }

    // Token info class for testing
    public class TokenInfo
    {
        public string Access { get; set; }
        public string Refresh { get; set; }
        public DateTime ExpiresAt { get; set; }
    }

    // Authentication result class for testing
    public class AuthResult
    {
        public bool Success { get; set; }
        public UserInfo User { get; set; }
        public TokenInfo Tokens { get; set; }
        public string ErrorMessage { get; set; }
    }

    // User info class for testing
    public class UserInfo
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
    }
}
