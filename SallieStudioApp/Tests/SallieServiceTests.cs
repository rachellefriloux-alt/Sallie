using System;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using SallieStudioApp.Services;
using SallieStudioApp.Models;

namespace SallieStudioApp.Tests
{
    [TestClass]
    public class SallieServiceTests
    {
        private Mock<IHttpClientFactory> _mockHttpClientFactory;
        private Mock<HttpClient> _mockHttpClient;
        private SallieService _sallieService;

        [TestInitialize]
        public void Setup()
        {
            _mockHttpClientFactory = new Mock<IHttpClientFactory>();
            _mockHttpClient = new Mock<HttpClient>();
            _mockHttpClientFactory.Setup(x => x.CreateClient(It.IsAny<string>()))
                .Returns(_mockHttpClient.Object);
            
            _sallieService = new SallieService(_mockHttpClientFactory.Object);
        }

        [TestMethod]
        public async Task SendMessageAsync_WithValidMessage_ReturnsResponse()
        {
            // Arrange
            var message = "Hello Sallie";
            var expectedResponse = new SallieResponse
            {
                Message = "Hello! How can I help you today?",
                Success = true,
                Timestamp = DateTime.UtcNow
            };

            _mockHttpClient.Setup(x => x.PostAsJsonAsync(
                It.IsAny<string>(),
                It.IsAny<SallieRequest>()))
                .ReturnsAsync(new HttpResponseMessage(System.Net.HttpStatusCode.OK))
                .Verifiable();

            // Act
            var result = await _sallieService.SendMessageAsync(message);

            // Assert
            result.Should().NotBeNull();
            result.Success.Should().BeTrue();
            result.Message.Should().NotBeNullOrEmpty();
            _mockHttpClient.Verify(x => x.PostAsJsonAsync(
                It.IsAny<string>(),
                It.IsAny<SallieRequest>()), Times.Once);
        }

        [TestMethod]
        public async Task GetAvatarAsync_WithValidId_ReturnsAvatarData()
        {
            // Arrange
            var avatarId = "avatar-123";
            var expectedAvatar = new AvatarData
            {
                Id = avatarId,
                Name = "Sallie",
                Mood = "happy",
                Appearance = new AppearanceSettings
                {
                    SkinTone = "#f4c2a1",
                    HairColor = "#8b4513",
                    EyeColor = "#4a90e2"
                }
            };

            _mockHttpClient.Setup(x => x.GetAsync(It.IsAny<string>()))
                .ReturnsAsync(new HttpResponseMessage(System.Net.HttpStatusCode.OK))
                .Verifiable();

            // Act
            var result = await _sallieService.GetAvatarAsync(avatarId);

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().Be(avatarId);
            result.Name.Should().Be("Sallie");
            _mockHttpClient.Verify(x => x.GetAsync(It.IsAny<string>()), Times.Once);
        }

        [TestMethod]
        public async Task UpdateSettingsAsync_WithValidSettings_UpdatesSuccessfully()
        {
            // Arrange
            var settings = new UserSettings
            {
                Theme = "dark",
                Language = "en",
                Notifications = new NotificationSettings
                {
                    Email = true,
                    Push = false,
                    Desktop = true
                }
            };

            _mockHttpClient.Setup(x => x.PutAsJsonAsync(
                It.IsAny<string>(),
                It.IsAny<UserSettings>()))
                .ReturnsAsync(new HttpResponseMessage(System.Net.HttpStatusCode.OK))
                .Verifiable();

            // Act
            var result = await _sallieService.UpdateSettingsAsync(settings);

            // Assert
            result.Should().BeTrue();
            _mockHttpClient.Verify(x => x.PutAsJsonAsync(
                It.IsAny<string>(),
                It.IsAny<UserSettings>()), Times.Once);
        }

        [TestMethod]
        public async Task GetConversationsAsync_WithValidUser_ReturnsConversations()
        {
            // Arrange
            var expectedConversations = new[]
            {
                new Conversation
                {
                    Id = "conv-1",
                    Title = "Test Conversation 1",
                    LastMessage = "Hello from Sallie!",
                    Timestamp = DateTime.UtcNow,
                    Unread = false
                },
                new Conversation
                {
                    Id = "conv-2",
                    Title = "Test Conversation 2",
                    LastMessage = "How can I help you?",
                    Timestamp = DateTime.UtcNow.AddHours(-1),
                    Unread = true
                }
            };

            _mockHttpClient.Setup(x => x.GetAsync(It.IsAny<string>()))
                .ReturnsAsync(new HttpResponseMessage(System.Net.HttpStatusCode.OK))
                .Verifiable();

            // Act
            var result = await _sallieService.GetConversationsAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCountGreaterThan(0);
            _mockHttpClient.Verify(x => x.GetAsync(It.IsAny<string>()), Times.Once);
        }

        [TestMethod]
        public async Task SendMessageAsync_WithEmptyMessage_ThrowsArgumentException()
        {
            // Arrange
            var emptyMessage = string.Empty;

            // Act & Assert
            await Assert.ThrowsExceptionAsync<ArgumentException>(
                () => _sallieService.SendMessageAsync(emptyMessage));
        }

        [TestMethod]
        public async Task GetAvatarAsync_WithNullId_ThrowsArgumentNullException()
        {
            // Arrange
            string nullId = null;

            // Act & Assert
            await Assert.ThrowsExceptionAsync<ArgumentNullException>(
                () => _sallieService.GetAvatarAsync(nullId));
        }

        [TestMethod]
        public async Task UpdateSettingsAsync_WithNullSettings_ThrowsArgumentNullException()
        {
            // Arrange
            UserSettings nullSettings = null;

            // Act & Assert
            await Assert.ThrowsExceptionAsync<ArgumentNullException>(
                () => _sallieService.UpdateSettingsAsync(nullSettings));
        }

        [TestMethod]
        public void Constructor_WithNullHttpClientFactory_ThrowsArgumentNullException()
        {
            // Act & Assert
            Assert.ThrowsException<ArgumentNullException>(
                () => new SallieService(null));
        }
    }

    [TestClass]
    public class AvatarServiceTests
    {
        private Mock<ISallieService> _mockSallieService;
        private AvatarService _avatarService;

        [TestInitialize]
        public void Setup()
        {
            _mockSallieService = new Mock<ISallieService>();
            _avatarService = new AvatarService(_mockSallieService.Object);
        }

        [TestMethod]
        public async Task GetCurrentAvatarAsync_ReturnsCurrentAvatar()
        {
            // Arrange
            var expectedAvatar = new AvatarData
            {
                Id = "current-avatar",
                Name = "Sallie",
                Mood = "happy"
            };

            _mockSallieService.Setup(x => x.GetAvatarAsync("current"))
                .ReturnsAsync(expectedAvatar);

            // Act
            var result = await _avatarService.GetCurrentAvatarAsync();

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().Be("current-avatar");
            result.Name.Should().Be("Sallie");
            _mockSallieService.Verify(x => x.GetAvatarAsync("current"), Times.Once);
        }

        [TestMethod]
        public async Task UpdateAvatarAsync_WithValidData_UpdatesAvatar()
        {
            // Arrange
            var avatarData = new AvatarData
            {
                Id = "avatar-123",
                Name = "Sallie",
                Mood = "excited",
                Appearance = new AppearanceSettings
                {
                    SkinTone = "#f4c2a1",
                    HairColor = "#8b4513"
                }
            };

            _mockSallieService.Setup(x => x.UpdateAvatarAsync(avatarData))
                .ReturnsAsync(true);

            // Act
            var result = await _avatarService.UpdateAvatarAsync(avatarData);

            // Assert
            result.Should().BeTrue();
            _mockSallieService.Verify(x => x.UpdateAvatarAsync(avatarData), Times.Once);
        }

        [TestMethod]
        public async Task ChangeMoodAsync_WithValidMood_UpdatesMood()
        {
            // Arrange
            var newMood = "excited";
            var currentAvatar = new AvatarData
            {
                Id = "avatar-123",
                Name = "Sallie",
                Mood = "happy"
            };

            _mockSallieService.Setup(x => x.GetAvatarAsync("current"))
                .ReturnsAsync(currentAvatar);
            _mockSallieService.Setup(x => x.UpdateAvatarAsync(It.IsAny<AvatarData>()))
                .ReturnsAsync(true);

            // Act
            var result = await _avatarService.ChangeMoodAsync(newMood);

            // Assert
            result.Should().BeTrue();
            _mockSallieService.Verify(x => x.UpdateAvatarAsync(It.Is<AvatarData>(
                a => a.Mood == newMood)), Times.Once);
        }
    }

    [TestClass]
    public class SettingsServiceTests
    {
        private Mock<ISallieService> _mockSallieService;
        private SettingsService _settingsService;

        [TestInitialize]
        public void Setup()
        {
            _mockSallieService = new Mock<ISallieService>();
            _settingsService = new SettingsService(_mockSallieService.Object);
        }

        [TestMethod]
        public async Task GetSettingsAsync_ReturnsUserSettings()
        {
            // Arrange
            var expectedSettings = new UserSettings
            {
                Theme = "dark",
                Language = "en",
                Notifications = new NotificationSettings
                {
                    Email = true,
                    Push = false,
                    Desktop = true
                }
            };

            _mockSallieService.Setup(x => x.GetSettingsAsync())
                .ReturnsAsync(expectedSettings);

            // Act
            var result = await _settingsService.GetSettingsAsync();

            // Assert
            result.Should().NotBeNull();
            result.Theme.Should().Be("dark");
            result.Language.Should().Be("en");
            result.Notifications.Email.Should().BeTrue();
            _mockSallieService.Verify(x => x.GetSettingsAsync(), Times.Once);
        }

        [TestMethod]
        public async Task SetThemeAsync_WithValidTheme_UpdatesTheme()
        {
            // Arrange
            var newTheme = "light";
            var currentSettings = new UserSettings
            {
                Theme = "dark",
                Language = "en"
            };

            _mockSallieService.Setup(x => x.GetSettingsAsync())
                .ReturnsAsync(currentSettings);
            _mockSallieService.Setup(x => x.UpdateSettingsAsync(It.IsAny<UserSettings>()))
                .ReturnsAsync(true);

            // Act
            var result = await _settingsService.SetThemeAsync(newTheme);

            // Assert
            result.Should().BeTrue();
            _mockSallieService.Verify(x => x.UpdateSettingsAsync(It.Is<UserSettings>(
                s => s.Theme == newTheme)), Times.Once);
        }

        [TestMethod]
        public async Task ToggleNotificationsAsync_WithValidType_TogglesNotification()
        {
            // Arrange
            var notificationType = "push";
            var currentSettings = new UserSettings
            {
                Theme = "dark",
                Notifications = new NotificationSettings
                {
                    Email = true,
                    Push = false,
                    Desktop = true
                }
            };

            _mockSallieService.Setup(x => x.GetSettingsAsync())
                .ReturnsAsync(currentSettings);
            _mockSallieService.Setup(x => x.UpdateSettingsAsync(It.IsAny<UserSettings>()))
                .ReturnsAsync(true);

            // Act
            var result = await _settingsService.ToggleNotificationsAsync(notificationType);

            // Assert
            result.Should().BeTrue();
            _mockSallieService.Verify(x => x.UpdateSettingsAsync(It.Is<UserSettings>(
                s => s.Notifications.Push == true)), Times.Once);
        }
    }
}
