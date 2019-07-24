using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Newtonsoft.Json;
using Serilog;
using Services.Interface;
using Services.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using ViewModel.Share;
using ViewModel.WebFunctions;

namespace FleetManagement.Controllers
{
	public class HomeController : Controller
	{
		private ILogger _logger = Log.Logger;

		readonly IWebFunctionsService _webFunctionService;
		readonly IBookingService _bookingService;
		readonly IAspNetUsersService _aspNetUsersService;

		public HomeController()
		{
			_webFunctionService = new WebFunctionsService();
			_bookingService = new BookingService();
			_aspNetUsersService = new AspNetUsersService();
		}

		private ApplicationUserManager _userManager;
		//private ApplicationRoleManager _roleManager;

		public ApplicationUserManager UserManager
		{
			get
			{
				return _userManager ?? HttpContext.GetOwinContext().GetUserManager<ApplicationUserManager>();
			}
			private set
			{
				_userManager = value;
			}
		}

		/// <summary>
		///  平台功能項目資料(登入帳號取 可用項目)
		/// </summary>
		/// <returns></returns>
		public ActionResult WebFunctionListByUser()
		{
			List<WebFunctionListModel> rootnode = new List<WebFunctionListModel>();
			var user = UserManager.FindById(User.Identity.GetUserId());
			if (user == null)
			{
				return PartialView("_PartialPageFunctionList", rootnode);
			}
			
			try
			{
				rootnode = _webFunctionService.WebFunctionList(false, user.Id);
			}
			catch (Exception ex)
			{
				_logger.Information("Home_FunctionList_Exception: {0} ", JsonConvert.SerializeObject(ex));
			}

			ViewBag.servertime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			return PartialView("_PartialPageFunctionList", rootnode);
		}

		/// <summary>
		/// 平台功能項目資料
		/// </summary>
		/// <param name="realall">是否讀取全部, 預設:false </param>
		/// <returns></returns>
		public JsonResult WebFunctionList(bool realall = false)
		{
			ResponseViewModel res = new ResponseViewModel();
			IList<WebFunctionListModel> items = new List<WebFunctionListModel>();
			try
			{
				items = _webFunctionService.WebFunctionList(realall);
				res.IsOk = true;
				res.Message = "";
				res.Data = items;
				res.HttpStatusCode = (HttpStatusCode)200;
				res.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			}
			catch (Exception ex)
			{
				res.IsOk = false;
				res.Message = "發生未預期錯誤,請洽系統人員.";
				res.HttpStatusCode = (HttpStatusCode)500;
				res.Exception = ex;
			}
			_logger.Information("Role_RoleFunctions_Return: {0}", JsonConvert.SerializeObject(res));
			return Json(res, JsonRequestBehavior.AllowGet);
		}

		/// <summary>
		/// 登入首頁
		/// </summary>
		public ActionResult Index()
		{
			if (!User.Identity.IsAuthenticated)
			{
				return RedirectToAction("Login", "Account");
			}

			var user = UserManager.FindById(User.Identity.GetUserId());
			if (user == null)
			{
				return RedirectToAction("Login", "Account");
			}
			//string RoleName = _AspNetService.GetRoleNameByUserId();
			ViewBag.UserName = user.RealName;
			//ViewBag.RoleName = RoleName;
			return View();
		}

		/// <summary>
		/// 取得即時資料
		/// </summary>
		/// <returns></returns>
		[HttpPost]
		public JsonResult GetDashBoardData()
		{
			int companyId = 0;
			if (User.Identity.IsAuthenticated)
			{
				var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
				companyId = user.CompanyId;
			}

			var data = _bookingService.GetDashboardInfo(companyId);
			return Json(new { jsonData = data });
		}
	}
}