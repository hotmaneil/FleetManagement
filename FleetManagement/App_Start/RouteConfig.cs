using System.Web.Mvc;
using System.Web.Routing;

namespace FleetManagement
{
	public class RouteConfig
	{
		public static void RegisterRoutes(RouteCollection routes)
		{
			routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

			// BotDetect Captch路由路徑維持原有路徑
			routes.IgnoreRoute("{*botdetect}",
			  new { botdetect = @"(.*)BotDetectCaptcha\.ashx" });

			routes.MapRoute(
				name: "Default",
				url: "{controller}/{action}/{id}",
				defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
			);
		}
	}
}
