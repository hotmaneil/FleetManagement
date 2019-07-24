using Services.Interface;
using Services.Service;
using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using System.Web.Mvc;
using Utility.Extensions;
using ViewModel.Booking;
using ViewModel.Booking.Collection;
using ViewModel.Booking.ReportList;
using ViewModel.Booking.Search;
using ViewModel.Enum;
using ViewModel.Share;

namespace FleetManagement.Controllers
{
	/// <summary>
	/// 營業報表 控制器
	/// </summary>
	public class ReportController : Controller
    {
		readonly ICompanyService _companyService;
		readonly IAspNetUsersService _aspNetUsersService;
		readonly IVehicleService _vehicleService;
		readonly IBookingService _bookingService;

		public ReportController()
		{
			_companyService = new CompanyService();
			_aspNetUsersService = new AspNetUsersService();
			_vehicleService = new VehicleService();
			_bookingService = new BookingService();
		}

		#region Session

		/// <summary>
		/// 月報表搜尋 ViewModel Session Property
		/// </summary>
		private BookingReportMonthSearchModel _sessionBookingReportMonthSearchModel;

		/// <summary>
		/// 月報表 Session
		/// </summary>
		public BookingReportMonthSearchModel SessionBookingReportMonthSearchModel
		{
			get
			{
				var sessionSearchModel = Session.GetDataFromSession<BookingReportMonthSearchModel>("sessionBookingReportMonthSearchModel");
				if (sessionSearchModel == null)
				{
					BookingReportMonthSearchModel _sessionNewSearchModel = new BookingReportMonthSearchModel();
					return _sessionNewSearchModel;
				}
				else
				{
					_sessionBookingReportMonthSearchModel = sessionSearchModel;
					return _sessionBookingReportMonthSearchModel;
				}
			}

			set
			{
				if (_sessionBookingReportMonthSearchModel != value)
				{
					_sessionBookingReportMonthSearchModel = value;
					Session.SetDataToSession<BookingReportMonthSearchModel>("sessionBookingReportMonthSearchModel", _sessionBookingReportMonthSearchModel);
				}
			}
		}

		/// <summary>
		/// 月內日報表搜尋 ViewModel Session Property
		/// </summary>
		private BookingReportMonthSearchModel _sessionMonthDailySearchModel;

		/// <summary>
		/// 月內日報表 Session
		/// </summary>
		public BookingReportMonthSearchModel SessionMonthDailySearchModel
		{
			get
			{
				var sessionSearchModel = Session.GetDataFromSession<BookingReportMonthSearchModel>("sessionMonthDailySearchModel");
				if (sessionSearchModel == null)
				{
					BookingReportMonthSearchModel _sessionNewSearchModel = new BookingReportMonthSearchModel();
					return _sessionNewSearchModel;
				}
				else
				{
					_sessionMonthDailySearchModel = sessionSearchModel;
					return _sessionMonthDailySearchModel;
				}
			}

			set
			{
				if (_sessionMonthDailySearchModel != value)
				{
					_sessionMonthDailySearchModel = value;
					Session.SetDataToSession<BookingReportMonthSearchModel>("sessionMonthDailySearchModel", _sessionMonthDailySearchModel);
				}
			}
		}

		/// <summary>
		/// 明細報表搜尋 ViewModel Session Property
		/// </summary>
		private DayReportSearchViewModel _sessionDayReportSearchViewModel;

		/// <summary>
		/// 明細報表 Session
		/// </summary>
		public DayReportSearchViewModel SessionDayReportSearchViewModel
		{
			get
			{
				var sessionSearchModel = Session.GetDataFromSession<DayReportSearchViewModel>("sessionDayReportSearchViewModel");
				if (sessionSearchModel == null)
				{
					DayReportSearchViewModel _sessionNewSearchModel = new DayReportSearchViewModel();
					return _sessionNewSearchModel;
				}
				else
				{
					_sessionDayReportSearchViewModel = sessionSearchModel;
					return _sessionDayReportSearchViewModel;
				}
			}

			set
			{
				if (_sessionDayReportSearchViewModel != value)
				{
					_sessionDayReportSearchViewModel = value;
					Session.SetDataToSession<DayReportSearchViewModel>("sessionDayReportSearchViewModel", _sessionDayReportSearchViewModel);
				}
			}
		}
		#endregion

		/// <summary>
		/// 月報表
		/// </summary>
		/// <returns></returns>
		public ActionResult MonthReport()
		{
			if (!User.Identity.IsAuthenticated)
				return RedirectToAction("Login", "Account");

			//限制只能為自己的公司
			var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
			CommonGoodsOwnerDriverVehicleDropdownList(user.CompanyId);

			return View(SessionBookingReportMonthSearchModel);
		}

		/// <summary>
		/// 取得搜尋結果
		/// </summary>
		/// <param name="SearchViewModel"></param>
		/// <returns></returns>
		[LogActionFilter]
		[HttpPost]
		public JsonResult GetSearchResult(BookingReportMonthSearchModel SearchViewModel)
		{
			if (SessionBookingReportMonthSearchModel != null)
			{
				if (SearchViewModel != SessionBookingReportMonthSearchModel)
					SessionBookingReportMonthSearchModel = SearchViewModel;
				else
					SearchViewModel = SessionBookingReportMonthSearchModel;
			}

			ResponseViewModel result = new ResponseViewModel();

			DateTime parsedYearMonth = DateTime.Parse(SearchViewModel.SearchYearMonth);
			SearchViewModel.SearchYear = parsedYearMonth.Year;
			SearchViewModel.SearchMonth = parsedYearMonth.Month;

			try
			{
				result.Data = _bookingService.GetBookingReportMonthCollection(SearchViewModel);
				result.IsOk = true;
				result.HttpStatusCode = HttpStatusCode.OK;
			}
			catch (Exception ex)
			{
				result.IsOk = false;
				result.Exception = ex;
				result.HttpStatusCode = HttpStatusCode.InternalServerError;
			}

			result.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			return Json(result, JsonRequestBehavior.DenyGet);
		}

		/// <summary>
		/// 下載Excel
		/// </summary>
		/// <param name="TabType"></param>
		/// <returns></returns>
		[HttpPost]
		public ActionResult DownLoadExcel(string TabType)
		{
			BookingReportMonthCollection data = new BookingReportMonthCollection();

			DateTime parsedYearMonth = DateTime.Parse(SessionBookingReportMonthSearchModel.SearchYearMonth);
			SessionBookingReportMonthSearchModel.SearchYear = parsedYearMonth.Year;
			SessionBookingReportMonthSearchModel.SearchMonth = parsedYearMonth.Month;

			string companyName = string.Empty;
			if (SessionBookingReportMonthSearchModel.SearchCompanyId.HasValue)
			{
				var queryCompany = _companyService.GetCompanyName(SessionBookingReportMonthSearchModel.SearchCompanyId.Value);
				if (!string.IsNullOrEmpty(queryCompany))
					companyName = queryCompany;
			}

			string licenseNumber = string.Empty;
			if (SessionBookingReportMonthSearchModel.SearchVehicleId.HasValue)
			{
				var queryVehicle = _vehicleService.QueryVehicle(SessionBookingReportMonthSearchModel.SearchVehicleId.Value);
				licenseNumber = queryVehicle.LicenseNumber;
			}

			string driverName = string.Empty;
			if (!string.IsNullOrEmpty(SessionBookingReportMonthSearchModel.SearchDriverId))
			{
				var queryDriver = _aspNetUsersService.GetUserModel(SessionBookingReportMonthSearchModel.SearchDriverId);
				driverName = queryDriver.RealName;
			}

			string customerName = string.Empty;
			if (!string.IsNullOrEmpty(SessionBookingReportMonthSearchModel.SearchGoodOwnerId))
			{
				var queryCustomer= _aspNetUsersService.GetUserModel(SessionBookingReportMonthSearchModel.SearchGoodOwnerId);
				customerName = queryCustomer.RealName;
			}

			string tabTypeName = string.Empty;
			switch (TabType)
			{
				case "Driver":
					tabTypeName = "司機";
					break;

				case "Customer":
					tabTypeName = "客戶";
					break;

				case "Vehicle":
					tabTypeName = "車輛";
					break;
			}

			string searchText = string.Format("月報表({0})查詢條件：查詢月份({1}),車行({2}),車號({3}),車主({4}),客戶({5})",
				tabTypeName,
				SessionBookingReportMonthSearchModel.SearchYear + "/" + SessionBookingReportMonthSearchModel.SearchMonth,
				companyName, licenseNumber, driverName, customerName);

			data = _bookingService.GetBookingReportMonthCollection(SessionBookingReportMonthSearchModel);
			
			string searchDateStr = "月報表_" + DateTime.Now.ToString("yyyyMMddHHmm");
			var fileStream = _bookingService.GenerateMonthReportXlsx(data, TabType, "月報表_" + tabTypeName, searchText, searchDateStr + ".xlsx");
			return File(fileStream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "QueryOrderData.xlsx");
		}

		/// <summary>
		/// 月報表/司機/XXX XX年XX月 每日趟次統計頁面
		/// 月報表/客戶/XXX XX年XX月 每日趟次統計頁面
		/// </summary>
		/// <param name="YearMonth"></param>
		/// <param name="DriverId"></param>
		/// <param name="CustomerId"></param>
		/// <returns></returns>
		[HttpGet]
		public ActionResult DailyStatisticsPage(string YearMonth, string DriverId, string CustomerId)
		{
			BookingReportMonthSearchModel model = new BookingReportMonthSearchModel();
	
			if (!User.Identity.IsAuthenticated)
				return RedirectToAction("Login", "Account");

			model.SearchYearMonth = YearMonth;
			model.SearchDriverId = DriverId;
			model.SearchGoodOwnerId = CustomerId;

			DateTime parsedYearMonth = DateTime.Parse(YearMonth);

			if (!string.IsNullOrEmpty(DriverId))
				ViewBag.TitleChoose = "司機";
			else if (!string.IsNullOrEmpty(CustomerId))
				ViewBag.TitleChoose = "客戶";

			ViewBag.SubTitle = " " + parsedYearMonth.Year + "年" + parsedYearMonth.Month + "月 每日趟次統計";

			//限制只能為自己的公司
			var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
			CommonGoodsOwnerDriverVehicleDropdownList(user.CompanyId);

			return View(model);
		}

		/// <summary>
		/// 取得司機或客戶每日趟數運費列表
		/// </summary>
		/// <param name="SearchViewModel"></param>
		/// <returns></returns>
		[LogActionFilter]
		[HttpPost]
		public JsonResult GetBookingDailyList(BookingReportMonthSearchModel SearchViewModel)
		{
			ResponseViewModel result = new ResponseViewModel();

			DateTime parsedYearMonth = DateTime.Parse(SearchViewModel.SearchYearMonth);
			SearchViewModel.SearchYear = parsedYearMonth.Year;
			SearchViewModel.SearchMonth = parsedYearMonth.Month;

			if (SessionMonthDailySearchModel != null)
			{
				if (SearchViewModel != SessionMonthDailySearchModel)
					SessionMonthDailySearchModel = SearchViewModel;
				else
					SearchViewModel = SessionMonthDailySearchModel;
			}

			try
			{
				result.Data = _bookingService.GetBookingReportDailyCollection(SearchViewModel);
				result.IsOk = true;
				result.HttpStatusCode = HttpStatusCode.OK;
			}
			catch (Exception ex)
			{
				result.IsOk = false;
				result.Exception = ex;
				result.HttpStatusCode = HttpStatusCode.InternalServerError;
			}

			result.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			return Json(result, JsonRequestBehavior.DenyGet);
		}

		/// <summary>
		/// 下載月日報表Excel
		/// </summary>
		/// <param name="TabType"></param>
		/// <returns></returns>
		[HttpPost]
		public ActionResult DownLoadMonthDailyExcel()
		{
			List<BookingReportDailyModel> data = new List<BookingReportDailyModel>();

			DateTime parsedYearMonth = DateTime.Parse(SessionMonthDailySearchModel.SearchYearMonth);
			SessionMonthDailySearchModel.SearchYear = parsedYearMonth.Year;
			SessionMonthDailySearchModel.SearchMonth = parsedYearMonth.Month;

			string title = string.Empty;
			string tabTypeName = string.Empty;

			string commonName = string.Empty;
			if (!string.IsNullOrEmpty(SessionMonthDailySearchModel.SearchDriverId.Trim()))
			{
				var queryDriver = _aspNetUsersService.GetUserModel(SessionMonthDailySearchModel.SearchDriverId);
				commonName = queryDriver.RealName;

				tabTypeName = "司機";
				title = string.Format("月報表_{0}{1}_每日趟次統計", tabTypeName, commonName);
			}

			if (!string.IsNullOrEmpty(SessionMonthDailySearchModel.SearchGoodOwnerId.Trim()))
			{
				var queryCustomer = _aspNetUsersService.GetUserModel(SessionMonthDailySearchModel.SearchGoodOwnerId);
				commonName = queryCustomer.RealName;

				tabTypeName = "客戶";
				title = string.Format("月報表_{0}{1}_每日趟次統計", tabTypeName, commonName);
			}

			string searchText = string.Format("月報表>{0}>{1} {2}年{3}月 每日趟次統計",
				tabTypeName,
				commonName,
				SessionMonthDailySearchModel.SearchYear,
				SessionMonthDailySearchModel.SearchMonth);

			data = _bookingService.GetBookingReportDailyCollection(SessionMonthDailySearchModel).BookingReportDailyList;

			string searchDateStr = title + DateTime.Now.ToString("yyyyMMdd");
			var fileStream = _bookingService.GenerateMonthDailyReportXlsx(data, title + tabTypeName, searchText, searchDateStr + ".xlsx");
			return File(fileStream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "QueryOrderData.xlsx");
		}

		/// <summary>
		/// 車輛任務列表
		/// </summary>
		/// <returns></returns>
		public ActionResult VehicleMissionList(string YearMonth, int VehicleId)
		{
			BookingReportMonthSearchModel model = new BookingReportMonthSearchModel();

			if (!User.Identity.IsAuthenticated)
				return RedirectToAction("Login", "Account");

			model.SearchYearMonth = YearMonth;
			Session["YearMonth"] = YearMonth;
			model.SearchVehicleId = VehicleId;

			//限制只能為自己的公司
			var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
			CommonGoodsOwnerDriverVehicleDropdownList(user.CompanyId);
			return View(model);
		}

		/// <summary>
		/// 取得車輛任務報表 列表
		/// </summary>
		/// <param name="SearchViewModel"></param>
		/// <returns></returns>
		[LogActionFilter]
		[HttpPost]
		public JsonResult GetVehicleMissionReportList(BookingReportMonthSearchModel SearchViewModel)
		{
			ResponseViewModel result = new ResponseViewModel();

			DateTime parsedYearMonth = DateTime.Parse(SearchViewModel.SearchYearMonth);
			SearchViewModel.SearchYear = parsedYearMonth.Year;
			SearchViewModel.SearchMonth = parsedYearMonth.Month;

			if (SessionMonthDailySearchModel != null)
			{
				if (SearchViewModel != SessionMonthDailySearchModel)
					SessionMonthDailySearchModel = SearchViewModel;
				else
					SearchViewModel = SessionMonthDailySearchModel;
			}

			try
			{
				result.Data = _bookingService.GetVehicleMissionReportList(SearchViewModel);
				result.IsOk = true;
				result.HttpStatusCode = HttpStatusCode.OK;
			}
			catch (Exception ex)
			{
				result.IsOk = false;
				result.Exception = ex;
				result.HttpStatusCode = HttpStatusCode.InternalServerError;
			}

			result.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			return Json(result, JsonRequestBehavior.DenyGet);
		}

		/// <summary>
		/// 下載車輛任務報表Excel
		/// </summary>
		/// <returns></returns>
		[HttpPost]
		public ActionResult DownLoadVehicleMissionExcel()
		{
			List<VehicleMissionReportListViewModel> data = new List<VehicleMissionReportListViewModel>();

			DateTime parsedYearMonth = DateTime.Parse(SessionMonthDailySearchModel.SearchYearMonth);
			SessionMonthDailySearchModel.SearchYear = parsedYearMonth.Year;
			SessionMonthDailySearchModel.SearchMonth = parsedYearMonth.Month;

			string title = string.Empty;

			string companyName = string.Empty;
			string licenseNumber = string.Empty;
			if (SessionMonthDailySearchModel.SearchCompanyId.HasValue)
			{
				var queryCompany = _companyService.GetCompanyName(SessionMonthDailySearchModel.SearchCompanyId.Value);
				if (!string.IsNullOrEmpty(queryCompany))
					companyName = queryCompany;
			}

			if (SessionMonthDailySearchModel.SearchVehicleId.HasValue)
			{
				var queryVehicle = _vehicleService.GetVehicle(SessionMonthDailySearchModel.SearchVehicleId.Value);
				if (queryVehicle != null)
					licenseNumber = queryVehicle.LicenseNumber;
			}

			title = string.Format("月報表_({0}){1}_任務明細列表", companyName, licenseNumber);

			string searchText = string.Format("月報表>{0}{1}>任務明細列表",
				companyName,
				licenseNumber);

			data = _bookingService.GetVehicleMissionReportList(SessionMonthDailySearchModel);

			string searchDateStr = title + DateTime.Now.ToString("yyyyMMdd");
			var fileStream = _bookingService.GenerateVehicleMissionReportXlsx(data, title, searchText, searchDateStr + ".xlsx");
			return File(fileStream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "QueryOrderData.xlsx");
		}

		/// <summary>
		/// 車輛任務明細
		/// </summary>
		/// <returns></returns>
		[LogActionFilter]
		public async Task<ActionResult> VehicleMissionDetail(string MessageId)
		{
			BookingViewModel model = new BookingViewModel();
			model = await _bookingService.GetBookingDetail(MessageId);
			ViewBag.YearMonth = Session["YearMonth"];
			return View(model);
		}

		/// <summary>
		/// 日報表
		/// </summary>
		/// <returns></returns>
		public ActionResult DayReport()
		{
			//限制只能為自己的公司
			var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
			CommonGoodsOwnerDriverVehicleDropdownList(user.CompanyId);
			return View();
		}

		/// <summary>
		/// 取得司機每日趟數列表
		/// </summary>
		/// <param name="SearchViewModel"></param>
		/// <returns></returns>
		[LogActionFilter]
		[HttpPost]
		public JsonResult GetDriverDayTimesReportList(DayReportSearchViewModel SearchViewModel)
		{
			ResponseViewModel result = new ResponseViewModel();

			try
			{
				result.Data = _bookingService.GetDriverDayTimesReportList(SearchViewModel);
				result.IsOk = true;
				result.HttpStatusCode = HttpStatusCode.OK;

				Session["DayReportSearchViewModel"] = SearchViewModel;
			}
			catch (Exception ex)
			{
				result.IsOk = false;
				result.Exception = ex;
				result.HttpStatusCode = HttpStatusCode.InternalServerError;
			}

			result.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			return Json(result, JsonRequestBehavior.DenyGet);
		}

		/// <summary>
		/// 取得司機每日運費列表
		/// </summary>
		/// <param name="SearchViewModel"></param>
		/// <returns></returns>
		[LogActionFilter]
		[HttpPost]
		public JsonResult GetDriverDayChargeReportList(DayReportSearchViewModel SearchViewModel)
		{
			ResponseViewModel result = new ResponseViewModel();

			try
			{
				result.Data = _bookingService.GetDriverDayChargeReportList(SearchViewModel);
				result.IsOk = true;
				result.HttpStatusCode = HttpStatusCode.OK;

				Session["DayReportSearchViewModel"] = SearchViewModel;
			}
			catch (Exception ex)
			{
				result.IsOk = false;
				result.Exception = ex;
				result.HttpStatusCode = HttpStatusCode.InternalServerError;
			}

			result.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			return Json(result, JsonRequestBehavior.DenyGet);
		}

		/// <summary>
		/// 下載司機日報表Excel（趟次或運費）
		/// </summary>
		/// <param name="TypeName"></param>
		/// <returns></returns>
		[HttpPost]
		public ActionResult DownLoadDriverDayReportExcel(string TypeName)
		{
			DayReportSearchViewModel SearchViewModel = Session["DayReportSearchViewModel"] as DayReportSearchViewModel;

			List<DriverDayReportListViewModel> data = new List<DriverDayReportListViewModel>();

			string companyName = string.Empty;
			if (SearchViewModel.SearchCompanyId.HasValue)
			{
				var queryCompany = _companyService.GetCompanyName(SearchViewModel.SearchCompanyId.Value);
				if (!string.IsNullOrEmpty(queryCompany))
					companyName = queryCompany;
			}

			string licenseNumber = string.Empty;
			if (SearchViewModel.SearchVehicleId.HasValue)
			{
				var queryVehicle = _vehicleService.GetVehicle(SearchViewModel.SearchVehicleId.Value);
				if (queryVehicle != null)
					licenseNumber = queryVehicle.LicenseNumber;
			}

			string driverName = string.Empty;
			if (!string.IsNullOrEmpty(SearchViewModel.SearchDriverId))
			{
				var queryDriver = _aspNetUsersService.GetUserModel(SearchViewModel.SearchDriverId);
				driverName = queryDriver.RealName;
			}

			string customerName = string.Empty;
			if (!string.IsNullOrEmpty(SearchViewModel.SearchGoodOwnerId))
			{
				var queryCustomer = _aspNetUsersService.GetUserModel(SearchViewModel.SearchGoodOwnerId);
				customerName = queryCustomer.RealName;
			}

			string title = "日報表_"; 

			switch (TypeName)
			{
				case "Times":
					title += "司機趟次";
					data = _bookingService.GetDriverDayTimesReportList(SearchViewModel);
					break;
				case "Charge":
					title += "司機運費";
					data= _bookingService.GetDriverDayChargeReportList(SearchViewModel);
					break;
			}

			string searchText = string.Format("日報表條件查詢：開始時間({0}),結束時間({1}),車行({2}),車號({3}),車主({4}),客戶({5})",
				SearchViewModel.BeginDateTime.Value.ToString("yyyy/MM/dd"),
				SearchViewModel.EndDateTime.Value.ToString("yyyy/MM/dd"),
				companyName,
				licenseNumber,
				driverName,
				customerName);

			string searchDateStr = title + DateTime.Now.ToString("yyyyMMdd");
			string Month = SearchViewModel.BeginDateTime.Value.ToString("MM");
			int endDayNum = Convert.ToInt32(SearchViewModel.EndDateTime.Value.ToString("dd"));
			var fileStream = _bookingService.GenerateDriverDayReportListXlsx(data, title, searchText, searchDateStr + ".xlsx", Month, endDayNum, "司機姓名");
			return File(fileStream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "QueryOrderData.xlsx");
		}

		/// <summary>
		/// 取得車輛每日趟數列表
		/// </summary>
		/// <param name="SearchViewModel"></param>
		/// <returns></returns>
		[LogActionFilter]
		[HttpPost]
		public JsonResult GetVehicleDayTimesReportList(DayReportSearchViewModel SearchViewModel)
		{
			ResponseViewModel result = new ResponseViewModel();

			try
			{
				result.Data = _bookingService.GetVehicleDayTimesReportList(SearchViewModel);
				result.IsOk = true;
				result.HttpStatusCode = HttpStatusCode.OK;

				Session["DayReportSearchViewModel"] = SearchViewModel;
			}
			catch (Exception ex)
			{
				result.IsOk = false;
				result.Exception = ex;
				result.HttpStatusCode = HttpStatusCode.InternalServerError;
			}

			result.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			return Json(result, JsonRequestBehavior.DenyGet);
		}

		/// <summary>
		/// 取得車輛每日運費列表
		/// </summary>
		/// <param name="SearchViewModel"></param>
		/// <returns></returns>
		[LogActionFilter]
		[HttpPost]
		public JsonResult GetVehicleDayChargeReportList(DayReportSearchViewModel SearchViewModel)
		{
			ResponseViewModel result = new ResponseViewModel();

			try
			{
				result.Data = _bookingService.GetVehicleDayChargeReportList(SearchViewModel);
				result.IsOk = true;
				result.HttpStatusCode = HttpStatusCode.OK;

				Session["DayReportSearchViewModel"] = SearchViewModel;
			}
			catch (Exception ex)
			{
				result.IsOk = false;
				result.Exception = ex;
				result.HttpStatusCode = HttpStatusCode.InternalServerError;
			}

			result.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			return Json(result, JsonRequestBehavior.DenyGet);
		}

		/// <summary>
		/// 下載車輛日報表Excel（趟次或運費）
		/// </summary>
		/// <param name="TypeName"></param>
		/// <returns></returns>
		[HttpPost]
		public ActionResult DownLoadVehicleDayReportExcel(string TypeName)
		{
			DayReportSearchViewModel SearchViewModel = Session["DayReportSearchViewModel"] as DayReportSearchViewModel;

			List<VehicleDayReportListViewModel> data = new List<VehicleDayReportListViewModel>();

			string companyName = string.Empty;
			if (SearchViewModel.SearchCompanyId.HasValue)
			{
				var queryCompany = _companyService.GetCompanyName(SearchViewModel.SearchCompanyId.Value);
				if (!string.IsNullOrEmpty(queryCompany))
					companyName = queryCompany;
			}

			string licenseNumber = string.Empty;
			if (SearchViewModel.SearchVehicleId.HasValue)
			{
				var queryVehicle = _vehicleService.GetVehicle(SearchViewModel.SearchVehicleId.Value);
				if (queryVehicle != null)
					licenseNumber = queryVehicle.LicenseNumber;
			}

			string driverName = string.Empty;
			if (!string.IsNullOrEmpty(SearchViewModel.SearchDriverId))
			{
				var queryDriver = _aspNetUsersService.GetUserModel(SearchViewModel.SearchDriverId);
				driverName = queryDriver.RealName;
			}

			string customerName = string.Empty;
			if (!string.IsNullOrEmpty(SearchViewModel.SearchGoodOwnerId))
			{
				var queryCustomer = _aspNetUsersService.GetUserModel(SearchViewModel.SearchGoodOwnerId);
				customerName = queryCustomer.RealName;
			}

			string title = "日報表_";

			switch (TypeName)
			{
				case "Times":
					title += "車輛趟次";
					data = _bookingService.GetVehicleDayTimesReportList(SearchViewModel);
					break;
				case "Charge":
					title += "車輛運費";
					data = _bookingService.GetVehicleDayChargeReportList(SearchViewModel);
					break;
			}

			string searchText = string.Format("日報表條件查詢：開始時間({0}),結束時間({1}),車行({2}),車號({3}),車主({4}),客戶({5})",
				SearchViewModel.BeginDateTime.Value.ToString("yyyy/MM/dd"),
				SearchViewModel.EndDateTime.Value.ToString("yyyy/MM/dd"),
				companyName,
				licenseNumber,
				driverName,
				customerName);

			string searchDateStr = title + DateTime.Now.ToString("yyyyMMdd");
			string Month = SearchViewModel.BeginDateTime.Value.ToString("MM");
			int endDayNum = Convert.ToInt32(SearchViewModel.EndDateTime.Value.ToString("dd"));
			var fileStream = _bookingService.GenerateVehicleDayReportListXlsx(data, title, searchText, searchDateStr + ".xlsx", Month, endDayNum, "車號");
			return File(fileStream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "QueryOrderData.xlsx");
		}

		/// <summary>
		/// 取得客戶每日趟數列表
		/// </summary>
		/// <param name="SearchViewModel"></param>
		/// <returns></returns>
		[LogActionFilter]
		[HttpPost]
		public JsonResult GetCustomerDayTimesReportList(DayReportSearchViewModel SearchViewModel)
		{
			ResponseViewModel result = new ResponseViewModel();

			try
			{
				result.Data = _bookingService.GetCustomerDayTimesReportList(SearchViewModel);
				result.IsOk = true;
				result.HttpStatusCode = HttpStatusCode.OK;

				Session["DayReportSearchViewModel"] = SearchViewModel;
			}
			catch (Exception ex)
			{
				result.IsOk = false;
				result.Exception = ex;
				result.HttpStatusCode = HttpStatusCode.InternalServerError;
			}

			result.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			return Json(result, JsonRequestBehavior.DenyGet);
		}

		/// <summary>
		/// 取得客戶每日運費列表
		/// </summary>
		/// <param name="SearchViewModel"></param>
		/// <returns></returns>
		[LogActionFilter]
		[HttpPost]
		public JsonResult GetCustomerDayChargeReportList(DayReportSearchViewModel SearchViewModel)
		{
			ResponseViewModel result = new ResponseViewModel();

			try
			{
				result.Data = _bookingService.GetCustomerDayChargeReportList(SearchViewModel);
				result.IsOk = true;
				result.HttpStatusCode = HttpStatusCode.OK;

				Session["DayReportSearchViewModel"] = SearchViewModel;
			}
			catch (Exception ex)
			{
				result.IsOk = false;
				result.Exception = ex;
				result.HttpStatusCode = HttpStatusCode.InternalServerError;
			}

			result.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			return Json(result, JsonRequestBehavior.DenyGet);
		}

		/// <summary>
		/// 下載客戶日報表Excel（趟次或運費）
		/// </summary>
		/// <param name="TypeName"></param>
		/// <returns></returns>
		[HttpPost]
		public ActionResult DownLoadCustomerDayReportExcel(string TypeName)
		{
			DayReportSearchViewModel SearchViewModel = Session["DayReportSearchViewModel"] as DayReportSearchViewModel;

			List<CustomerDayReportListViewModel> data = new List<CustomerDayReportListViewModel>();

			string companyName = string.Empty;
			if (SearchViewModel.SearchCompanyId.HasValue)
			{
				var queryCompany = _companyService.GetCompanyName(SearchViewModel.SearchCompanyId.Value);
				if (!string.IsNullOrEmpty(queryCompany))
					companyName = queryCompany;
			}

			string licenseNumber = string.Empty;
			if (SearchViewModel.SearchVehicleId.HasValue)
			{
				var queryVehicle = _vehicleService.GetVehicle(SearchViewModel.SearchVehicleId.Value);
				if (queryVehicle != null)
					licenseNumber = queryVehicle.LicenseNumber;
			}

			string driverName = string.Empty;
			if (!string.IsNullOrEmpty(SearchViewModel.SearchDriverId))
			{
				var queryDriver = _aspNetUsersService.GetUserModel(SearchViewModel.SearchDriverId);
				driverName = queryDriver.RealName;
			}

			string customerName = string.Empty;
			if (!string.IsNullOrEmpty(SearchViewModel.SearchGoodOwnerId))
			{
				var queryCustomer = _aspNetUsersService.GetUserModel(SearchViewModel.SearchGoodOwnerId);
				customerName = queryCustomer.RealName;
			}

			string title = "日報表_";

			switch (TypeName)
			{
				case "Times":
					title += "客戶趟次";
					data = _bookingService.GetCustomerDayTimesReportList(SearchViewModel);
					break;
				case "Charge":
					title += "客戶運費";
					data = _bookingService.GetCustomerDayChargeReportList(SearchViewModel);
					break;
			}

			string searchText = string.Format("日報表條件查詢：開始時間({0}),結束時間({1}),車行({2}),車號({3}),車主({4}),客戶({5})",
				SearchViewModel.BeginDateTime.Value.ToString("yyyy/MM/dd"),
				SearchViewModel.EndDateTime.Value.ToString("yyyy/MM/dd"),
				companyName,
				licenseNumber,
				driverName,
				customerName);

			string searchDateStr = title + DateTime.Now.ToString("yyyyMMdd");
			string Month = SearchViewModel.BeginDateTime.Value.ToString("MM");
			int endDayNum = Convert.ToInt32(SearchViewModel.EndDateTime.Value.ToString("dd"));
			var fileStream = _bookingService.GenerateCustomerDayReportListXlsx(data, title, searchText, searchDateStr + ".xlsx", Month, endDayNum, "姓名");
			return File(fileStream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "QueryOrderData.xlsx");
		}


		/// <summary>
		/// 依照日報表搜尋 ViewModel取得總趟次與運費
		/// </summary>
		/// <param name="SearchViewModel"></param>
		/// <returns></returns>
		[LogActionFilter]
		[HttpPost]
		public JsonResult GetBaseBookingReportMonth(DayReportSearchViewModel SearchViewModel)
		{
			ResponseViewModel result = new ResponseViewModel();

			try
			{
				result.Data = _bookingService.GetBaseBookingReportMonth(SearchViewModel);
				result.IsOk = true;
				result.HttpStatusCode = HttpStatusCode.OK;
			}
			catch (Exception ex)
			{
				result.IsOk = false;
				result.Exception = ex;
				result.HttpStatusCode = HttpStatusCode.InternalServerError;
			}

			result.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			return Json(result, JsonRequestBehavior.DenyGet);
		}

		/// <summary>
		/// 明細報表
		/// </summary>
		/// <returns></returns>
		public ActionResult DetailReport()
		{
			//限制只能為自己的公司
			var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
			CommonGoodsOwnerDriverVehicleDropdownList(user.CompanyId);
			return View(SessionDayReportSearchViewModel);
		}

		/// <summary>
		/// 取得明細報表 列表
		/// </summary>
		/// <param name="SearchViewModel"></param>
		/// <returns></returns>
		[LogActionFilter]
		[HttpPost]
		public JsonResult GetDetailReportList(DayReportSearchViewModel SearchViewModel)
		{
			if (SessionDayReportSearchViewModel != null)
			{
				if (SearchViewModel != SessionDayReportSearchViewModel)
					SessionDayReportSearchViewModel = SearchViewModel;
				else
					SearchViewModel = SessionDayReportSearchViewModel;
			}

			ResponseViewModel result = new ResponseViewModel();

			try
			{
				result.Data = _bookingService.GetDriverMissionReportList(SessionDayReportSearchViewModel);
				result.IsOk = true;
				result.HttpStatusCode = HttpStatusCode.OK;
			}
			catch (Exception ex)
			{
				result.IsOk = false;
				result.Exception = ex;
				result.HttpStatusCode = HttpStatusCode.InternalServerError;
			}

			result.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			return Json(result, JsonRequestBehavior.DenyGet);
		}

		/// <summary>
		/// 下載明細報表Excel
		/// </summary>
		/// <returns></returns>
		[HttpPost]
		public ActionResult DownLoadDetailReportExcel()
		{
			List<DriverMissionReportListViewModel> data = new List<DriverMissionReportListViewModel>();

			data = _bookingService.GetDriverMissionReportList(SessionDayReportSearchViewModel);

			string companyName = string.Empty;
			if (SessionDayReportSearchViewModel.SearchCompanyId.HasValue)
			{
				var queryCompany = _companyService.GetCompanyName(SessionDayReportSearchViewModel.SearchCompanyId.Value);
				if (!string.IsNullOrEmpty(queryCompany))
					companyName = queryCompany;
			}

			string licenseNumber = string.Empty;
			if (SessionDayReportSearchViewModel.SearchVehicleId.HasValue)
			{
				var queryVehicle = _vehicleService.QueryVehicle(SessionDayReportSearchViewModel.SearchVehicleId.Value);
				licenseNumber = queryVehicle.LicenseNumber;
			}

			string driverName = string.Empty;
			if (!string.IsNullOrEmpty(SessionDayReportSearchViewModel.SearchDriverId))
			{
				var queryDriver = _aspNetUsersService.GetUserModel(SessionDayReportSearchViewModel.SearchDriverId);
				driverName = queryDriver.RealName;
			}

			string customerName = string.Empty;
			if (!string.IsNullOrEmpty(SessionDayReportSearchViewModel.SearchGoodOwnerId))
			{
				var queryCustomer = _aspNetUsersService.GetUserModel(SessionDayReportSearchViewModel.SearchGoodOwnerId);
				customerName = queryCustomer.RealName;
			}

			string searchText = string.Format("明細報表查詢條件：開始時間({0}),結束時間({1}),車行({2}),車號({3}),車主({4}),客戶({5})",
				SessionDayReportSearchViewModel.BeginDateTime.HasValue ?
				SessionDayReportSearchViewModel.BeginDateTime.Value.ToString("yyyy/MM/dd") : string.Empty,
				SessionDayReportSearchViewModel.EndDateTime.HasValue ?
				SessionDayReportSearchViewModel.EndDateTime.Value.ToString("yyyy/MM/dd") : string.Empty,
				companyName,
				licenseNumber,
				driverName,
				customerName);

			string title = "明細報表";
			string searchDateStr = title + DateTime.Now.ToString("yyyyMMdd");
			var fileStream = _bookingService.GenerateDriverMissionReportXlsx(data, title , searchText, searchDateStr + ".xlsx");
			return File(fileStream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "QueryOrderData.xlsx");
		}

		/// <summary>
		/// 共用公司、貨主、車主、車輛下拉選單
		/// </summary>
		/// <param name="CompanyId"></param>
		private void CommonGoodsOwnerDriverVehicleDropdownList(int ? CompanyId)
		{
			List<SelectListItem> companySelectListItem = new List<SelectListItem>();
			if (!CompanyId.HasValue)
				companySelectListItem.Add(new SelectListItem { Text = "不限", Value = " " });

			companySelectListItem.AddRange(_companyService.GetCompanyList(CompanyId));
			ViewBag.CompanyList = companySelectListItem;

			List<SelectListItem> goodOwnerSelectListItem = new List<SelectListItem>();
			List<int> goodOwnerLevels = new List<int>();
			goodOwnerLevels.Add((int)MemberLevelEnum.GoodsOwner);
			goodOwnerLevels.Add((int)MemberLevelEnum.DriverLevel1);
			goodOwnerLevels.Add((int)MemberLevelEnum.DriverLevel2);
			goodOwnerLevels.Add((int)MemberLevelEnum.DriverLevel3);
			goodOwnerLevels.Add((int)MemberLevelEnum.DriverLevel4);
			goodOwnerSelectListItem.Add(new SelectListItem { Text = "不限", Value = " " });
			goodOwnerSelectListItem.AddRange(_aspNetUsersService.GetUserSelectListItem(goodOwnerLevels, null, null));
			ViewBag.GoodOwnerList = goodOwnerSelectListItem;

			List<SelectListItem> driverSelectListItem = new List<SelectListItem>();
			List<int> driverLevels = new List<int>();
			driverLevels.Add((int)MemberLevelEnum.DriverLevel1);
			driverLevels.Add((int)MemberLevelEnum.DriverLevel2);
			driverLevels.Add((int)MemberLevelEnum.DriverLevel3);
			driverLevels.Add((int)MemberLevelEnum.DriverLevel4);

			driverSelectListItem.Add(new SelectListItem { Text = "不限", Value = " " });
			driverSelectListItem.AddRange(_aspNetUsersService.GetUserSelectListItem(driverLevels, CompanyId, null));
			ViewBag.DriverList = driverSelectListItem;

			List<SelectListItem> vehicleLicenseNumberSelectListItem = new List<SelectListItem>();
			vehicleLicenseNumberSelectListItem.Add(new SelectListItem { Text = "不限", Value = " " });
			vehicleLicenseNumberSelectListItem.AddRange(_vehicleService.GetVehicleBy(CompanyId));
			ViewBag.VehicleLicenseNumberList = vehicleLicenseNumberSelectListItem;
		}
	}
}