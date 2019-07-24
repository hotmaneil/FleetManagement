using System.Web;
using System.Web.Optimization;

namespace FleetManagement
{
	public class BundleConfig
	{
		// 如需統合的詳細資訊，請瀏覽 https://go.microsoft.com/fwlink/?LinkId=301862
		public static void RegisterBundles(BundleCollection bundles)
		{
			bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
						"~/Content/bower_components/jQuery/jquery-3.3.1.min.js",
						"~/Content/bower_components/semanticUI/js/semantic.min.js",
						"~/Content/bower_components/toastrJS/toastr.min.js",
						"~/Content/bower_components/tabularJS/js/tabulator.js"

						//"~/Scripts/jquery-{version}.js"
						));

			bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
						"~/Scripts/jquery.validate*"));

			// 使用開發版本的 Modernizr 進行開發並學習。然後，當您
			// 準備好實際執行時，請使用 http://modernizr.com 上的建置工具，只選擇您需要的測試。
			bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
						"~/Scripts/modernizr-*"));

			bundles.Add(new StyleBundle("~/Content/css").Include(
					  "~/Content/bower_components/semanticUI/css/semantic.min.css",
					   "~/Content/bower_components/tabularJS/css/tabulator_semantic-ui.min.css",
					  "~/Content/bower_components/toastrJS/toastr.min.css",
					  "~/Content/bower_components/font-awesome/css/fontawesome-all.min.css",
					  "~/Content/common.min.css"));

			bundles.Add(new ScriptBundle("~/bundles/cusTabulatorDownload").Include(
				"~/Content/bower_components/pdfmake/build/pdfmake.min.js",
				"~/Content/bower_components/pdfmake/build/vfs_fonts.js",
				"~/Content/bower_components/tabularJS/js/xlsx.full.min.js",
				"~/Content/bower_components/moment/moment.js"
			 ));

			bundles.Add(new ScriptBundle("~/bundles/js").Include(
					 "~/Content/bower_components/jQuery/jquery-3.3.1.min.js",
					 "~/Content/bower_components/semanticUI/js/semantic.min.js",
					 "~/Content/bower_components/toastrJS/toastr.min.js",
					 "~/Content/bower_components/tabularJS/js/tabulator.js",
					 "~/Content/bower_components/semanticUI-Calendar/calendar.min.js"
			));

			bundles.Add(new StyleBundle("~/Content/lightsliderCss").Include(
				  "~/Content/bower_components/lightslider/css/lightslider.min.css"
				   ));

			bundles.Add(new ScriptBundle("~/bundles/lightsliderJs").Include(
			 "~/Content/bower_components/lightslider/js/lightslider.min.js"
			));

			bundles.Add(new StyleBundle("~/Content/DatepickerCss").Include(
				  "~/Content/bower_components/Datepicker/jquery-ui.min.css",
				  "~/Content/bower_components/Datepicker/jquery-ui.theme.css"
			));

			bundles.Add(new ScriptBundle("~/bundles/DatepickerJs").Include(
				"~/Content/bower_components/Datepicker/jquery-ui.js",
				"~/Content/bower_components/Datepicker/datepicker-zh-TW.js"
			));
		}
	}
}
