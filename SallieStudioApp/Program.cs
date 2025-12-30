using Microsoft.UI.Xaml;
using System;
using WinRT;

namespace SallieStudioApp
{
    public static class Program
    {
        [STAThread]
        public static void Main(string[] args)
        {
            ComWrappersSupport.InitializeComWrappers();
            Application.Start(_ => new App());
        }
    }
}
