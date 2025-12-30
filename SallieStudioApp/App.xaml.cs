using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using System;
using System.IO;

namespace SallieStudioApp
{
    public partial class App : Application
    {
        public App()
        {
            this.InitializeComponent();
        }

        protected override void OnLaunched(LaunchActivatedEventArgs args)
        {
            var configPath = Path.Combine(AppContext.BaseDirectory, "config", "studio.json");
            Window window;

            if (!File.Exists(configPath))
            {
                window = new Window
                {
                    Title = "Sallie Studio — Setup",
                    Content = new SetupWizard()
                };
            }
            else
            {
                window = new MainWindow();
            }

            window.Activate();
        }
    }
}
