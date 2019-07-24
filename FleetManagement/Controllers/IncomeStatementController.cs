using Newtonsoft.Json;
using Serilog;
using Services.Interface;
using Services.Service;
using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using System.Web.Mvc;
using Utility.Extensions;
using ViewModel.IncomeStatement;
using ViewModel.Share;

namespace FleetManagement.Controllers
{
	/// <summary>
	/// 車輛收支管理
	/// </summary>
	public class IncomeStatementController : Controller
    {
		private ILogger _logger = Log.Logger;

		readonly IAspNetUsersService _aspNetUsersService;
		readonly IVehicleService _vehicleService;
		readonly ICodeDetailService _codeDetailService;
		readonly IIncomeStatementService _incomeStatementService;

		public IncomeStatementController()
		{
			_aspNetUsersService = new AspNetUsersService();
			_vehicleService = new VehicleService();
			_codeDetailService = new CodeDetailService();
			_incomeStatementService = new IncomeStatementService();
		}

		#region Session
		/// <summary>
		/// 車輛收支管理搜尋 ViewModel Session Property
		/// </summary>
		private IncomeStatementSearchViewModel _sessionIncomeStatementSearchViewModel;

		/// <summary>
		/// 車輛收支管理 Session
		/// </summary>
		public IncomeStatementSearchViewModel SessionIncomeStatementSearchViewModel
		{
			get
			{
				var sessionSearchModel = Session.GetDataFromSession<IncomeStatementSearchViewModel>("sessionIncomeStatementSearchViewModel");
				if (sessionSearchModel == null)
				{
					IncomeStatementSearchViewModel _sessionNewSearchModel = new IncomeStatementSearchViewModel();
					//_sessionNewSearchModel.CreateTime = DateTime.Now;
					return _sessionNewSearchModel;
				}
				else
				{
					_sessionIncomeStatementSearchViewModel = sessionSearchModel;
					return _sessionIncomeStatementSearchViewModel;
				}
			}

			set
			{
				if (_sessionIncomeStatementSearchViewModel != value)
				{
					_sessionIncomeStatementSearchViewModel = value;
					Session.SetDataToSession<IncomeStatementSearchViewModel>("sessionIncomeStatementSearchViewModel", _sessionIncomeStatementSearchViewModel);
				}
			}
		}

		/// <summary>
		/// 車輛收支報表搜尋 ViewModel Session Property
		/// </summary>
		private IncomeStatementReportSearchViewModel _sessionIncomeStatementReportSearchViewModel;

		/// <summary>
		/// 車輛收支報表 Session
		/// </summary>
		public IncomeStatementReportSearchViewModel SessionIncomeStatementReportSearchViewModel
		{
			get
			{
				var sessionSearchModel = Session.GetDataFromSession<IncomeStatementReportSearchViewModel>("sessionIncomeStatementReportSearchViewModel");
				if (sessionSearchModel == null)
				{
					IncomeStatementReportSearchViewModel _sessionNewSearchModel = new IncomeStatementReportSearchViewModel();
					return _sessionNewSearchModel;
				}
				else
				{
					_sessionIncomeStatementReportSearchViewModel = sessionSearchModel;
					return _sessionIncomeStatementReportSearchViewModel;
				}
			}

			set
			{
				if (_sessionIncomeStatementReportSearchViewModel != value)
				{
					_sessionIncomeStatementReportSearchViewModel = value;
					Session.SetDataToSession<IncomeStatementReportSearchViewModel>("sessionIncomeStatementReportSearchViewModel", _sessionIncomeStatementReportSearchViewModel);
				}
			}
		}
		#endregion

		/// <summary>
		/// 收支管理記帳本
		/// </summary>
		/// <returns></returns>
		public ActionResult Index()
        {
			if (!User.Identity.IsAuthenticated)
				return RedirectToAction("Login", "Account");

			CommonDropDownList();

			return View(SessionIncomeStatementSearchViewModel);
        }

		/// <summary>
		/// 傳回收支帳管理 List JsonResult
		/// </summary>
		/// <param name="SearchViewModel"></param>
		/// <returns></returns>
		[LogActionFilter]
		public JsonResult GetIncomeStatementList(IncomeStatementSearchViewModel SearchViewModel)
		{
			if (SessionIncomeStatementSearchViewModel != null)
			{
				if (SearchViewModel != SessionIncomeStatementSearchViewModel)
					SessionIncomeStatementSearchViewModel = SearchViewModel;
				else
					SearchViewModel = SessionIncomeStatementSearchViewModel;
			}

			ResponseViewModel result = new ResponseViewModel();
			try
			{
				//限制只能為自己的公司
				var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
				SearchViewModel.CompanyId = user.CompanyId;
				result.Data = _incomeStatementService.GetIncomeStatementList(SearchViewModel);
				result.IsOk = true;
				result.HttpStatusCode = HttpStatusCode.OK;
			}
			catch (Exception ex)
			{
				result.IsOk = false;
				result.Exception = ex;
				result.HttpStatusCode = HttpStatusCode.InternalServerError;
				result.Data = new List<IncomeStatementListViewModel>();
			}

			result.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			return Json(result, JsonRequestBehavior.DenyGet);
		}

		/// <summary>
		/// 下載收支帳管理Excel
		/// </summary>
		/// <returns></returns>
		[HttpPost]
		public ActionResult DownLoadIncomeStatementExcel()
		{
			List<IncomeStatementListViewModel> data = new List<IncomeStatementListViewModel>();

			string title = string.Empty;
			string tabTypeName = string.Empty;
			string licenseNumber = string.Empty;
			if (SessionIncomeStatementSearchViewModel.SearchVehicleId.HasValue)
			{
				var queryVehicle = _vehicleService.GetVehicle(SessionIncomeStatementSearchViewModel.SearchVehicleId.Value);
				if (queryVehicle != null)
					licenseNumber = queryVehicle.LicenseNumber;
			}

			string dateTime = SessionIncomeStatementSearchViewModel.CreateTime.HasValue ?
				SessionIncomeStatementSearchViewModel.CreateTime.Value.ToString("yyyy-MM-dd") : string.Empty;

			title = string.Format("{0}收支管理記帳本", dateTime);
			string searchText = string.Format("收支管理記帳本查詢條件:時間({0}),車號({1})", dateTime, licenseNumber);

			data = _incomeStatementService.GetIncomeStatementList(SessionIncomeStatementSearchViewModel);

			string searchDateStr = title + DateTime.Now.ToString("yyyyMMdd");
			var fileStream = _incomeStatementService.GenerateIncomeStatementXlsx(data, title, searchText, searchDateStr + ".xlsx");
			return File(fileStream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "QueryOrderData.xlsx");
		}

		/// <summary>
		/// 新增或編輯收支帳
		/// </summary>
		/// <param name="model"></param>
		/// <returns></returns>
		[LogActionFilter]
		[HttpPost]
		public async Task<ActionResult> CreateOrEditIncomeStatement(IncomeStatementViewModel model)
		{
			_logger.Information($"CreateOrEditIncomeStatement: { JsonConvert.SerializeObject(model)}");
			ResponseViewModel result = new ResponseViewModel();

			try
			{
				var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
				model.CompanyId = user.CompanyId;
				result = await _incomeStatementService.CreateOrUpdateIncomeStatement(model, user.Id);
			}
			catch (Exception ex)
			{
				_logger.Information($"CreateOrEditIncomeStatement: { JsonConvert.SerializeObject(ex)}");
				throw ex;
			}
			return Json(result, JsonRequestBehavior.DenyGet);
		}

		/// <summary>
		/// 取得收支帳JsonResult
		/// </summary>
		/// <param name="Id"></param>
		/// <returns></returns>
		[LogActionFilter]
		public JsonResult GetIncomeStatement(string Id)
		{
			ResponseViewModel result = new ResponseViewModel();

			try
			{
				result.Data = _incomeStatementService.GetIncomeStatement(Id);
				result.IsOk = true;
				result.HttpStatusCode = HttpStatusCode.OK;
			}
			catch (Exception ex)
			{
				result.IsOk = false;
				result.Exception = ex;
				result.HttpStatusCode = HttpStatusCode.InternalServerError;
				result.Data = new IncomeStatementViewModel();
			}

			result.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			return Json(result, JsonRequestBehavior.AllowGet);
		}

		/// <summary>
		/// 刪除收支帳
		/// </summary>
		/// <param name="Id"></param>
		/// <returns></returns>
		[LogActionFilter]
		[HttpPost]
		public async Task<JsonResult> DeleteIncomeStatement(string Id)
		{
			ResponseViewModel result = new ResponseViewModel();

			try
			{
				result = await _incomeStatementService.DeleteIncomeStatement(Id);
			}
			catch (Exception ex)
			{
				result.IsOk = false;
				result.Exception = ex;
				result.HttpStatusCode = HttpStatusCode.InternalServerError;
			}
			return Json(result, JsonRequestBehavior.DenyGet);
		}

		/// <summary>
		/// 收支管理報表
		/// </summary>
		/// <returns></returns>
		public ActionResult Report()
		{
			if (!User.Identity.IsAuthenticated)
				return RedirectToAction("Login", "Account");

			CommonDropDownList();
			return View(SessionIncomeStatementReportSearchViewModel);
		}

		/// <summary>
		/// 傳回收支帳報表 List JsonResult
		/// </summary>
		/// <param name="SearchViewModel"></param>
		/// <returns></returns>
		[LogActionFilter]
		[HttpPost]
		public JsonResult GetIncomeStatementReportList(IncomeStatementReportSearchViewModel SearchViewModel)
		{
			if (SessionIncomeStatementReportSearchViewModel != null)
			{
				if (SearchViewModel != SessionIncomeStatementReportSearchViewModel)
					SessionIncomeStatementReportSearchViewModel = SearchViewModel;
				else
					SearchViewModel = SessionIncomeStatementReportSearchViewModel;
			}

			ResponseViewModel result = new ResponseViewModel();
			try
			{
				//限制只能為自己的公司
				var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
				SearchViewModel.CompanyId = user.CompanyId;
				result.Data = _incomeStatementService.GetIncomeStatementReportList(SearchViewModel);
				result.IsOk = true;
				result.HttpStatusCode = HttpStatusCode.OK;
			}
			catch (Exception ex)
			{
				result.IsOk = false;
				result.Exception = ex;
				result.HttpStatusCode = HttpStatusCode.InternalServerError;
				result.Data = new List<IncomeStatementReportViewModel>();
			}

			result.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			return Json(result, JsonRequestBehavior.DenyGet);
		}

		/// <summary>
		/// 下載收支帳管理報表Excel
		/// </summary>
		/// <returns></returns>
		[HttpPost]
		public ActionResult DownLoadIncomeStatementReportExcel()
		{
			List<IncomeStatementReportViewModel> data = new List<IncomeStatementReportViewModel>();

			string title = string.Empty;
			string licenseNumber = string.Empty;

			if (SessionIncomeStatementReportSearchViewModel.SearchVehicleId.HasValue)
			{
				var queryVehicle = _vehicleService.GetVehicle(SessionIncomeStatementReportSearchViewModel.SearchVehicleId.Value);
				if (queryVehicle != null)
					licenseNumber = queryVehicle.LicenseNumber;
			}

			string queryBeginDate = SessionIncomeStatementReportSearchViewModel.BeginDateTime.HasValue ?
				SessionIncomeStatementReportSearchViewModel.BeginDateTime.Value.ToString("yyyy-MM-dd") : string.Empty;
			string queryEndDate =
				SessionIncomeStatementReportSearchViewModel.EndDateTime.HasValue ?
				SessionIncomeStatementReportSearchViewModel.EndDateTime.Value.ToString("yyyy-MM-dd") : string.Empty;

			title = string.Format("收支管理報表{0}~{1}",queryBeginDate, queryEndDate);

			string searchText = string.Format("收支管理報表:時間({0}~{1}),車號({2})", queryBeginDate, queryEndDate, licenseNumber);

			data = _incomeStatementService.GetIncomeStatementReportList(SessionIncomeStatementReportSearchViewModel);

			string searchDateStr = title + DateTime.Now.ToString("yyyyMMdd");
			var fileStream = _incomeStatementService.GenerateIncomeStatementReportXlsx(data, title, searchText, searchDateStr + ".xlsx");
			return File(fileStream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "QueryOrderData.xlsx");
		}

		/// <summary>
		/// 共用下拉選單
		/// </summary>
		private void CommonDropDownList()
		{
			//限制只能為自己的公司
			var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);

			List<SelectListItem> vehicleLicenseNumberSelectListItem = new List<SelectListItem>();
			vehicleLicenseNumberSelectListItem.Add(new SelectListItem { Text = "全部", Value = " " });
			vehicleLicenseNumberSelectListItem.AddRange(_vehicleService.GetVehicleBy(user.CompanyId));
			ViewBag.VehicleLicenseNumberList = vehicleLicenseNumberSelectListItem;

			List<SelectListItem> vehicleIdSelectListItem = new List<SelectListItem>();
			vehicleIdSelectListItem.Add(new SelectListItem { Text = "請選擇", Value = "0" });
			vehicleIdSelectListItem.AddRange(_vehicleService.GetVehicleBy(user.CompanyId));
			ViewBag.VehicleIdSelectList = vehicleIdSelectListItem;

			List<SelectListItem> statementSelectListItem = new List<SelectListItem>();
			statementSelectListItem.Add(new SelectListItem { Text = "請選擇", Value = "0" });

			//先IncomeItem
			statementSelectListItem.AddRange(_codeDetailService.GetItemByTypeCode("IncomeItem"));

			//再SpendItem
			statementSelectListItem.AddRange(_codeDetailService.GetItemByTypeCode("SpendItem"));

			ViewBag.SpendItemList = statementSelectListItem;

			List<SelectListItem> frequencySelectListItem = new List<SelectListItem>();
			frequencySelectListItem.Add(new SelectListItem { Text = "請選擇", Value = "0" });
			frequencySelectListItem.AddRange(_codeDetailService.GetItemByTypeCode("Frequence"));
			ViewBag.FrequencyList = frequencySelectListItem;
		}
	}
}