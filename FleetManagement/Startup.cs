using Microsoft.Owin;
using Owin;
using Serilog;
using System.IO;
using System.Web.Hosting;

[assembly: OwinStartupAttribute(typeof(FleetManagement.Startup))]
namespace FleetManagement
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
			//Serilog Configuration
			var logPath = HostingEnvironment.MapPath("~") + @"App_Data\";
			var logConfig = new LoggerConfiguration()
				.MinimumLevel.Debug()
				.WriteTo.RollingFile(Path.Combine(logPath, @"Logs\log-{Date}.txt"), fileSizeLimitBytes: 52428800, retainedFileCountLimit: 200)
				.WriteTo.LiterateConsole();
			Log.Logger = logConfig.CreateLogger();

			ConfigureAuth(app);
        }
    }
}
