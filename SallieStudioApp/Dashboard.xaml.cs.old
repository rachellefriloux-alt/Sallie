using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using SallieStudioApp.Helpers;
using System;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace SallieStudioApp
{
    public sealed partial class Dashboard : UserControl
    {
        public Dashboard()
        {
            this.InitializeComponent();
            StartLoop();
        }

        private async void StartLoop()
        {
            while (true)
            {
                try
                {
                    UpdateStatus();
                    UpdateMetrics();
                }
                catch
                {
                    // Swallow to keep loop alive; consider logging in future module
                }
                await Task.Delay(2000);
            }
        }

        private void UpdateStatus()
        {
            var status = StatusProbe.GetStatus();

            // Backend
            if (status.Backend8000Online || status.Backend8010Online)
            {
                BackendStatusPill.Background = new SolidColorBrush(Microsoft.UI.Colors.ForestGreen);
                BackendStatusText.Text = "Backend: Online";
            }
            else
            {
                BackendStatusPill.Background = new SolidColorBrush(Microsoft.UI.Colors.IndianRed);
                BackendStatusText.Text = "Backend: Offline";
            }

            // Docker
            if (status.DockerContainers.Any())
            {
                DockerStatusPill.Background = new SolidColorBrush(Microsoft.UI.Colors.ForestGreen);
                DockerStatusText.Text = "Docker: Running";
            }
            else
            {
                DockerStatusPill.Background = new SolidColorBrush(Microsoft.UI.Colors.IndianRed);
                DockerStatusText.Text = "Docker: Stopped";
            }

            // Frontend
            if (status.NodePids.Any())
            {
                FrontendStatusPill.Background = new SolidColorBrush(Microsoft.UI.Colors.ForestGreen);
                FrontendStatusText.Text = "Frontend: Running";
            }
            else
            {
                FrontendStatusPill.Background = new SolidColorBrush(Microsoft.UI.Colors.IndianRed);
                FrontendStatusText.Text = "Frontend: Stopped";
            }

            // Lists
            DockerList.ItemsSource = status.DockerContainers;
            AgentList.ItemsSource = new[] { "Core Agent", "Memory Agent", "Brain Agent" };
        }

        private void UpdateMetrics()
        {
            var cpu = GetCpuUsage();
            var ram = GetRamUsage();
            var disk = GetDiskUsage();

            CpuBar.Value = cpu;
            CpuText.Text = $"{cpu:F1}%";

            RamBar.Value = ram;
            RamText.Text = $"{ram:F1}%";

            DiskBar.Value = disk;
            DiskText.Text = $"{disk:F1}%";
        }

        private double GetCpuUsage()
        {
            using var cpu = new PerformanceCounter("Processor", "% Processor Time", "_Total");
            cpu.NextValue();
            Task.Delay(200).Wait();
            return cpu.NextValue();
        }

        private double GetRamUsage()
        {
            using var ram = new PerformanceCounter("Memory", "% Committed Bytes In Use");
            return ram.NextValue();
        }

        private double GetDiskUsage()
        {
            using var disk = new PerformanceCounter("PhysicalDisk", "% Disk Time", "_Total");
            disk.NextValue();
            Task.Delay(200).Wait();
            return disk.NextValue();
        }
    }
}
