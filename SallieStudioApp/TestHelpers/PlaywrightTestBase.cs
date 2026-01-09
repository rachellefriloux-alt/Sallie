using System;
using System.Threading.Tasks;
using Microsoft.Playwright;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace SallieStudioApp.TestHelpers
{
    public abstract class PlaywrightTestBase
    {
        protected IPlaywright _playwright;
        protected IBrowser _browser;
        protected IBrowserContext _context;

        [TestInitialize]
        public async Task PlaywrightSetup()
        {
            _playwright = await Playwright.CreateAsync();
            _browser = await _playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
            {
                Headless = false, // Set to true for CI/CD
                SlowMo = 100, // Slow down by 100ms
                Args = new[]
                {
                    "--disable-web-security",
                    "--disable-features=VizDisplayCompositor",
                    "--window-size=1920,1080"
                }
            });

            _context = await _browser.NewContextAsync(new BrowserNewContextOptions
            {
                ViewportSize = new ViewportSize { Width = 1920, Height = 1080 },
                IgnoreHTTPSErrors = true,
                UserAgent = "SallieStudioApp-Test/1.0"
            });
        }

        [TestCleanup]
        public async Task PlaywrightCleanup()
        {
            await _context?.CloseAsync();
            await _browser?.CloseAsync();
            _playwright?.Dispose();
        }

        protected async Task<IPage> CreatePageAsync()
        {
            return await _context.NewPageAsync();
        }

        protected async Task NavigateToMainWindowAsync(IPage page)
        {
            // Navigate to the desktop app URL (assuming it's hosted for testing)
            await page.GotoAsync("http://localhost:3000");
            
            // Wait for the main window to load
            await page.WaitForLoadStateAsync(LoadState.NetworkIdle);
            await page.WaitForSelectorAsync("[data-testid='main-app']");
        }

        protected async Task ExpectPageTitleAsync(IPage page, string expectedTitle)
        {
            var title = await page.TitleAsync();
            title.Should().Contain(expectedTitle);
        }

        protected async Task WaitForElementAsync(IPage page, string selector, int timeoutMs = 5000)
        {
            await page.WaitForSelectorAsync(selector, new PageWaitForSelectorOptions
            {
                Timeout = timeoutMs
            });
        }

        protected async Task WaitForElementToDisappearAsync(IPage page, string selector, int timeoutMs = 5000)
        {
            await page.WaitForSelectorAsync(selector, new PageWaitForSelectorOptions
            {
                State = WaitForSelectorState.Hidden,
                Timeout = timeoutMs
            });
        }

        protected async Task<bool> IsElementVisibleAsync(IPage page, string selector)
        {
            var element = await page.QuerySelectorAsync(selector);
            return element != null && await element.IsVisibleAsync();
        }

        protected async Task<string> GetElementTextAsync(IPage page, string selector)
        {
            var element = await page.QuerySelectorAsync(selector);
            return element != null ? await element.TextContentAsync() : null;
        }

        protected async Task ClickElementAsync(IPage page, string selector)
        {
            await page.ClickAsync(selector);
        }

        protected async Task FillInputAsync(IPage page, string selector, string value)
        {
            await page.FillAsync(selector, value);
        }

        protected async Task SelectDropdownAsync(IPage page, string selector, string value)
        {
            await page.SelectOptionAsync(selector, value);
        }

        protected async Task<bool> IsElementCheckedAsync(IPage page, string selector)
        {
            var element = await page.QuerySelectorAsync(selector);
            return element != null && await element.IsCheckedAsync();
        }

        protected async Task SetCheckboxAsync(IPage page, string selector, bool checked)
        {
            if (checked)
                await page.CheckAsync(selector);
            else
                await page.UncheckAsync(selector);
        }

        protected async Task HoverElementAsync(IPage page, string selector)
        {
            await page.HoverAsync(selector);
        }

        protected async Task PressKeyAsync(IPage page, string key)
        {
            await page.Keyboard.PressAsync(key);
        }

        protected async Task TypeTextAsync(IPage page, string selector, string text)
        {
            await page.TypeAsync(selector, text);
        }

        protected async Task TakeScreenshotAsync(IPage page, string fileName)
        {
            await page.ScreenshotAsync(new PageScreenshotOptions
            {
                Path = fileName,
                FullPage = true
            });
        }

        protected async Task MockApiResponseAsync(IPage page, string url, object response, int statusCode = 200)
        {
            await page.RouteAsync(url, async route =>
            {
                await route.FulfillAsync(
                    status: statusCode,
                    contentType: "application/json",
                    body: System.Text.Json.JsonSerializer.Serialize(response)
                );
            });
        }

        protected async Task MockApiErrorAsync(IPage page, string url, string error, int statusCode = 500)
        {
            await page.RouteAsync(url, async route =>
            {
                await route.FulfillAsync(
                    status: statusCode,
                    contentType: "application/json",
                    body: System.Text.Json.JsonSerializer.Serialize(new { error })
                );
            });
        }

        protected async Task WaitForNetworkIdleAsync(IPage page, int timeoutMs = 5000)
        {
            await page.WaitForLoadStateAsync(LoadState.NetworkIdle, new PageWaitForLoadStateOptions
            {
                Timeout = timeoutMs
            });
        }

        protected async Task<string> GetElementAttributeAsync(IPage page, string selector, string attribute)
        {
            var element = await page.QuerySelectorAsync(selector);
            return element != null ? await element.GetAttributeAsync(attribute) : null;
        }

        protected async Task<int> GetElementCountAsync(IPage page, string selector)
        {
            var elements = await page.QuerySelectorAllAsync(selector);
            return elements.Count;
        }

        protected async Task<bool> ElementExistsAsync(IPage page, string selector)
        {
            var element = await page.QuerySelectorAsync(selector);
            return element != null;
        }

        protected async Task ScrollToElementAsync(IPage page, string selector)
        {
            await page.ScrollIntoViewIfNeededAsync(selector);
        }

        protected async Task WaitForElementToBeEnabledAsync(IPage page, string selector, int timeoutMs = 5000)
        {
            await page.WaitForFunctionAsync(
                $"selector => !document.querySelector(selector).disabled",
                selector,
                new PageWaitForFunctionOptions { Timeout = timeoutMs }
            );
        }

        protected async Task<double> GetElementOpacityAsync(IPage page, string selector)
        {
            var element = await page.QuerySelectorAsync(selector);
            if (element == null) return 0;
            
            var opacity = await element.EvaluateAsync<string>("element => getComputedStyle(element).opacity");
            return double.TryParse(opacity, out var value) ? value : 0;
        }

        protected async Task<bool> IsElementInViewportAsync(IPage page, string selector)
        {
            var element = await page.QuerySelectorAsync(selector);
            if (element == null) return false;
            
            return await element.EvaluateAsync<bool>(@"element => {
                const rect = element.getBoundingClientRect();
                return (
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <= window.innerHeight &&
                    rect.right <= window.innerWidth
                );
            }");
        }

        protected async Task SimulateDragAndDropAsync(IPage page, string sourceSelector, string targetSelector)
        {
            var source = await page.QuerySelectorAsync(sourceSelector);
            var target = await page.QuerySelectorAsync(targetSelector);
            
            if (source != null && target != null)
            {
                await source.DragAsync(target);
            }
        }

        protected async Task RightClickElementAsync(IPage page, string selector)
        {
            await page.ClickAsync(selector, new PageClickOptions { Button = MouseButton.Right });
        }

        protected async Task DoubleClickElementAsync(IPage page, string selector)
        {
            await page.DblClickAsync(selector);
        }

        protected async Task<string> GetElementCssValueAsync(IPage page, string selector, string property)
        {
            var element = await page.QuerySelectorAsync(selector);
            if (element == null) return null;
            
            return await element.EvaluateAsync<string>($"element => getComputedStyle(element).{property}");
        }

        protected async Task WaitForElementTextToContainAsync(IPage page, string selector, string text, int timeoutMs = 5000)
        {
            await page.WaitForFunctionAsync(
                $"(selector, text) => document.querySelector(selector)?.textContent?.includes(text)",
                new object[] { selector, text },
                new PageWaitForFunctionOptions { Timeout = timeoutMs }
            );
        }

        protected async Task<bool> IsElementFocusedAsync(IPage page, string selector)
        {
            var element = await page.QuerySelectorAsync(selector);
            return element != null && await element.EvaluateAsync<bool>("element => document.activeElement === element");
        }

        protected async Task FocusElementAsync(IPage page, string selector)
        {
            await page.FocusAsync(selector);
        }

        protected async Task BlurElementAsync(IPage page, string selector)
        {
            await page.BlurAsync(selector);
        }
    }
}
