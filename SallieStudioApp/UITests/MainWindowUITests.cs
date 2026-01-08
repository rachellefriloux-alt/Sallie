using System;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Playwright;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using SallieStudioApp.TestHelpers;

namespace SallieStudioApp.UITests
{
    [TestClass]
    public class MainWindowUITests : PlaywrightTestBase
    {
        private IPage _page;

        [TestInitialize]
        public async Task Setup()
        {
            _page = await CreatePageAsync();
            await NavigateToMainWindowAsync(_page);
        }

        [TestCleanup]
        public async Task Cleanup()
        {
            await _page.CloseAsync();
        }

        [TestMethod]
        public async Task MainWindow_LoadsCorrectly_DisplaysAllElements()
        {
            // Assert
            await ExpectPageTitleAsync(_page, "Sallie Studio");
            
            var avatar = await _page.QuerySelectorAsync("[data-testid='sallie-avatar']");
            avatar.Should().NotBeNull();
            
            var welcomeText = await _page.QuerySelectorAsync("[data-testid='welcome-text']");
            welcomeText.Should().NotBeNull();
            
            var conversationPanel = await _page.QuerySelectorAsync("[data-testid='conversation-panel']");
            conversationPanel.Should().NotBeNull();
        }

        [TestMethod]
        public async Task AvatarSection_ClickCustomization_OpensCustomizationDialog()
        {
            // Arrange
            var customizeButton = await _page.QuerySelectorAsync("[data-testid='customize-avatar-button']");
            customizeButton.Should().NotBeNull();

            // Act
            await customizeButton.ClickAsync();

            // Assert
            await WaitForElementAsync(_page, "[data-testid='avatar-customization-dialog']");
            var dialog = await _page.QuerySelectorAsync("[data-testid='avatar-customization-dialog']");
            dialog.Should().NotBeNull();
            await dialog.IsVisibleAsync().Should().BeTrue();
        }

        [TestMethod]
        public async Task ConversationPanel_SendMessage_DisplaysResponse()
        {
            // Arrange
            var messageInput = await _page.QuerySelectorAsync("[data-testid='message-input']");
            var sendButton = await _page.QuerySelectorAsync("[data-testid='send-button']");

            // Act
            await messageInput.FillAsync("Hello Sallie!");
            await sendButton.ClickAsync();

            // Assert
            await WaitForElementAsync(_page, "[data-testid='user-message']");
            await WaitForElementAsync(_page, "[data-testid='sallie-response']");
            
            var userMessage = await _page.QuerySelectorAsync("[data-testid='user-message']");
            var sallieResponse = await _page.QuerySelectorAsync("[data-testid='sallie-response']");
            
            userMessage.Should().NotBeNull();
            sallieResponse.Should().NotBeNull();
            
            var messageText = await userMessage.TextContentAsync();
            messageText.Should().Contain("Hello Sallie!");
        }

        [TestMethod]
        public async Task SettingsPanel_ToggleDarkMode_UpdatesTheme()
        {
            // Arrange
            var settingsButton = await _page.QuerySelectorAsync("[data-testid='settings-button']");
            await settingsButton.ClickAsync();
            
            await WaitForElementAsync(_page, "[data-testid='settings-panel']");
            var darkModeToggle = await _page.QuerySelectorAsync("[data-testid='dark-mode-toggle']");

            // Act
            await darkModeToggle.ClickAsync();

            // Assert
            var body = await _page.QuerySelectorAsync("body");
            var hasDarkClass = await body.EvaluateAsync<bool>("element => element.classList.contains('dark-theme')");
            hasDarkClass.Should().BeTrue();
        }

        [TestMethod]
        public async Task NavigationPanel_ClickTabs_NavigatesCorrectly()
        {
            // Test Dashboard navigation
            var dashboardTab = await _page.QuerySelectorAsync("[data-testid='dashboard-tab']");
            await dashboardTab.ClickAsync();
            await WaitForElementAsync(_page, "[data-testid='dashboard-panel']");
            
            var dashboardPanel = await _page.QuerySelectorAsync("[data-testid='dashboard-panel']");
            dashboardPanel.Should().NotBeNull();
            await dashboardPanel.IsVisibleAsync().Should().BeTrue();

            // Test Conversations navigation
            var conversationsTab = await _page.QuerySelectorAsync("[data-testid='conversations-tab']");
            await conversationsTab.ClickAsync();
            await WaitForElementAsync(_page, "[data-testid='conversations-panel']");
            
            var conversationsPanel = await _page.QuerySelectorAsync("[data-testid='conversations-panel']");
            conversationsPanel.Should().NotBeNull();
            await conversationsPanel.IsVisibleAsync().Should().BeTrue();

            // Test Avatar navigation
            var avatarTab = await _page.QuerySelectorAsync("[data-testid='avatar-tab']");
            await avatarTab.ClickAsync();
            await WaitForElementAsync(_page, "[data-testid='avatar-panel']");
            
            var avatarPanel = await _page.QuerySelectorAsync("[data-testid='avatar-panel']");
            avatarPanel.Should().NotBeNull();
            await avatarPanel.IsVisibleAsync().Should().BeTrue();
        }

        [TestMethod]
        public async Task ConversationHistory_LoadsPreviousConversations_DisplaysCorrectly()
        {
            // Arrange
            var conversationsTab = await _page.QuerySelectorAsync("[data-testid='conversations-tab']");
            await conversationsTab.ClickAsync();
            await WaitForElementAsync(_page, "[data-testid='conversations-panel']");

            // Act
            var conversationItems = await _page.QuerySelectorAllAsync("[data-testid='conversation-item']");

            // Assert
            conversationItems.Should().NotBeEmpty();
            
            foreach (var item in conversationItems)
            {
                var title = await item.QuerySelectorAsync("[data-testid='conversation-title']");
                var lastMessage = await item.QuerySelectorAsync("[data-testid='conversation-last-message']");
                var timestamp = await item.QuerySelectorAsync("[data-testid='conversation-timestamp']");
                
                title.Should().NotBeNull();
                lastMessage.Should().NotBeNull();
                timestamp.Should().NotBeNull();
            }
        }

        [TestMethod]
        public async Task AvatarCustomization_ChangeAppearance_UpdatesAvatar()
        {
            // Arrange
            var customizeButton = await _page.QuerySelectorAsync("[data-testid='customize-avatar-button']");
            await customizeButton.ClickAsync();
            await WaitForElementAsync(_page, "[data-testid='avatar-customization-dialog']");

            // Act
            var skinTonePicker = await _page.QuerySelectorAsync("[data-testid='skin-tone-picker']");
            await skinTonePicker.SelectOptionAsync(new[] { "medium" });
            
            var hairColorPicker = await _page.QuerySelectorAsync("[data-testid='hair-color-picker']");
            await hairColorPicker.SelectOptionAsync(new[] { "brown" });
            
            var saveButton = await _page.QuerySelectorAsync("[data-testid='save-avatar-button']");
            await saveButton.ClickAsync();

            // Assert
            await WaitForElementToDisappearAsync(_page, "[data-testid='avatar-customization-dialog']");
            
            var successMessage = await _page.QuerySelectorAsync("[data-testid='success-message']");
            successMessage.Should().NotBeNull();
            await successMessage.IsVisibleAsync().Should().BeTrue();
        }

        [TestMethod]
        public async Task ConnectionStatus_Offline_DisplaysOfflineIndicator()
        {
            // Arrange - Simulate offline connection
            await _page.Context.SetOfflineAsync(true);

            // Act
            await _page.ReloadAsync();
            await NavigateToMainWindowAsync(_page);

            // Assert
            var offlineIndicator = await _page.QuerySelectorAsync("[data-testid='offline-indicator']");
            offlineIndicator.Should().NotBeNull();
            await offlineIndicator.IsVisibleAsync().Should().BeTrue();
            
            var onlineIndicator = await _page.QuerySelectorAsync("[data-testid='online-indicator']");
            onlineIndicator.Should().BeNull();
        }

        [TestMethod]
        public async Task KeyboardNavigation_TabThroughElements_FocusesCorrectly()
        {
            // Arrange
            var firstFocusableElement = await _page.QuerySelectorAsync("[data-testid='first-focusable']");
            await firstFocusableElement.FocusAsync();

            // Act - Tab through elements
            await _page.Keyboard.PressAsync("Tab");
            var secondFocused = await _page.QuerySelectorAsync(":focus");
            
            await _page.Keyboard.PressAsync("Tab");
            var thirdFocused = await _page.QuerySelectorAsync(":focus");

            // Assert
            secondFocused.Should().NotBeNull();
            thirdFocused.Should().NotBeNull();
            secondFocused.Should().NotBe(firstFocusableElement);
            thirdFocused.Should().NotBe(secondFocused);
        }

        [TestMethod]
        public async Task Accessibility_ScreenReader_HasCorrectAriaLabels()
        {
            // Assert
            var mainRegion = await _page.QuerySelectorAsync("[role='region'][aria-label='Sallie avatar']");
            mainRegion.Should().NotBeNull();
            
            var conversationArea = await _page.QuerySelectorAsync("[role='main'][aria-label='Conversation area']");
            conversationArea.Should().NotBeNull();
            
            var settingsButton = await _page.QuerySelectorAsync("[aria-label='Settings']");
            settingsButton.Should().NotBeNull();
            
            var messageInput = await _page.QuerySelectorAsync("[aria-label='Type your message']");
            messageInput.Should().NotBeNull();
        }

        [TestMethod]
        public async Task ErrorHandling_NetworkError_DisplaysErrorMessage()
        {
            // Arrange - Mock network error
            await _page.RouteAsync("**/api/**", async route =>
            {
                await route.FulfillAsync(
                    status: 500,
                    contentType: "application/json",
                    body: "{\"error\":\"Internal Server Error\"}"
                );
            });

            // Act
            var messageInput = await _page.QuerySelectorAsync("[data-testid='message-input']");
            var sendButton = await _page.QuerySelectorAsync("[data-testid='send-button']");
            
            await messageInput.FillAsync("Test message");
            await sendButton.ClickAsync();

            // Assert
            await WaitForElementAsync(_page, "[data-testid='error-message']");
            var errorMessage = await _page.QuerySelectorAsync("[data-testid='error-message']");
            errorMessage.Should().NotBeNull();
            await errorMessage.IsVisibleAsync().Should().BeTrue();
        }

        [TestMethod]
        public async Task Performance_LargeConversation_HandlesSmoothly()
        {
            // Arrange - Create large conversation
            var messageInput = await _page.QuerySelectorAsync("[data-testid='message-input']");
            var sendButton = await _page.QuerySelectorAsync("[data-testid='send-button']");

            // Act - Send multiple messages quickly
            for (int i = 0; i < 50; i++)
            {
                await messageInput.FillAsync($"Test message {i}");
                await sendButton.ClickAsync();
                await _page.WaitForTimeoutAsync(100); // Small delay between messages
            }

            // Assert - Application should still be responsive
            var appElement = await _page.QuerySelectorAsync("[data-testid='main-app']");
            appElement.Should().NotBeNull();
            await appElement.IsVisibleAsync().Should().BeTrue();
            
            // Check that conversation panel is still scrollable
            var conversationPanel = await _page.QuerySelectorAsync("[data-testid='conversation-panel']");
            var isScrollable = await conversationPanel.EvaluateAsync<bool>(
                "element => element.scrollHeight > element.clientHeight");
            isScrollable.Should().BeTrue();
        }
    }

    [TestClass]
    public class AvatarCustomizationUITests : PlaywrightTestBase
    {
        private IPage _page;

        [TestInitialize]
        public async Task Setup()
        {
            _page = await CreatePageAsync();
            await NavigateToMainWindowAsync(_page);
            
            // Navigate to avatar customization
            var customizeButton = await _page.QuerySelectorAsync("[data-testid='customize-avatar-button']");
            await customizeButton.ClickAsync();
            await WaitForElementAsync(_page, "[data-testid='avatar-customization-dialog']");
        }

        [TestCleanup]
        public async Task Cleanup()
        {
            await _page.CloseAsync();
        }

        [TestMethod]
        public async Task CustomizationDialog_Loads_DisplaysAllOptions()
        {
            // Assert
            var skinTonePicker = await _page.QuerySelectorAsync("[data-testid='skin-tone-picker']");
            var hairColorPicker = await _page.QuerySelectorAsync("[data-testid='hair-color-picker']");
            var eyeColorPicker = await _page.QuerySelectorAsync("[data-testid='eye-color-picker']");
            var outfitPicker = await _page.QuerySelectorAsync("[data-testid='outfit-picker']");

            skinTonePicker.Should().NotBeNull();
            hairColorPicker.Should().NotBeNull();
            eyeColorPicker.Should().NotBeNull();
            outfitPicker.Should().NotBeNull();
        }

        [TestMethod]
        public async Task PreviewAvatar_ChangeOptions_UpdatesPreview()
        {
            // Arrange
            var skinTonePicker = await _page.QuerySelectorAsync("[data-testid='skin-tone-picker']");
            var avatarPreview = await _page.QuerySelectorAsync("[data-testid='avatar-preview']");

            // Act
            await skinTonePicker.SelectOptionAsync(new[] { "dark" });

            // Assert
            await _page.WaitForTimeoutAsync(500); // Wait for preview update
            var previewSrc = await avatarPreview.GetAttributeAsync("src");
            previewSrc.Should().Contain("dark");
        }

        [TestMethod]
        public async Task SaveChanges_ValidInput_ClosesDialog()
        {
            // Arrange
            var skinTonePicker = await _page.QuerySelectorAsync("[data-testid='skin-tone-picker']");
            var saveButton = await _page.QuerySelectorAsync("[data-testid='save-avatar-button']");

            // Act
            await skinTonePicker.SelectOptionAsync(new[] { "medium" });
            await saveButton.ClickAsync();

            // Assert
            await WaitForElementToDisappearAsync(_page, "[data-testid='avatar-customization-dialog']");
            
            var dialog = await _page.QuerySelectorAsync("[data-testid='avatar-customization-dialog']");
            dialog.Should().BeNull();
        }

        [TestMethod]
        public async Task CancelChanges_DoesNotSave()
        {
            // Arrange
            var skinTonePicker = await _page.QuerySelectorAsync("[data-testid='skin-tone-picker']");
            var cancelButton = await _page.QuerySelectorAsync("[data-testid='cancel-avatar-button']");

            // Act
            await skinTonePicker.SelectOptionAsync(new[] { "dark" });
            await cancelButton.ClickAsync();

            // Assert
            await WaitForElementToDisappearAsync(_page, "[data-testid='avatar-customization-dialog']");
            
            // Verify changes were not saved by checking if success message doesn't appear
            var successMessage = await _page.QuerySelectorAsync("[data-testid='success-message']");
            successMessage.Should().BeNull();
        }
    }
}
