using Newtonsoft.Json;
using ResourceLibrary;
using Serilog;
using Services.Interface;
using Services.Service;
using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using System.Web.Mvc;
using Utility.Extensions;
using ViewModel.Booking;
using ViewModel.Share;
using ViewModel.Trace;

namespace FleetManagement.Controllers
{
	/// <summary>
	/// 軌跡查詢功能
	/// </summary>
	[LogActionFilter]
	public class TraceController : BaseController
    {
		private ILogger _logger = Log.Logger;

		readonly ITraceService _traceService;
		readonly ICommonService _commonService;
		readonly IAspNetUsersService _aspNetUsersService;
		readonly IVehicleService _vehicleService;

		public TraceController()
		{
			_traceService = new TraceService();
			_commonService = new CommonService();
			_aspNetUsersService = new AspNetUsersService();
			_vehicleService = new VehicleService();
		}

		#region Session
		/// <summary>
		/// 軌跡搜尋 ViewModel Session Property
		/// </summary>
		private SearchTraceModel _sessionSearchTraceModel;

		/// <summary>
		/// 軌跡 Session
		/// </summary>
		public SearchTraceModel SessionSearchTraceModel
		{
			get
			{
				var sessionSearchModel = Session.GetDataFromSession<SearchTraceModel>("sessionSearchTraceModel");
				if (sessionSearchModel == null)
				{
					SearchTraceModel _sessionNewSearchModel = new SearchTraceModel();
					return _sessionNewSearchModel;
				}
				else
				{
					_sessionSearchTraceModel = sessionSearchModel;
					return _sessionSearchTraceModel;
				}
			}

			set
			{
				if (_sessionSearchTraceModel != value)
				{
					_sessionSearchTraceModel = value;
					Session.SetDataToSession<SearchTraceModel>("sessionSearchTraceModel", _sessionSearchTraceModel);
				}
			}
		}
		#endregion

		/// <summary>
		/// 軌跡查詢首頁
		/// </summary>
		/// <returns></returns>
		public ActionResult Index()
        {
			if (!User.Identity.IsAuthenticated)
				return RedirectToAction("Login", "Account");

			List<SelectListItem> vehicleSelectListItems = new List<SelectListItem>();

			//限制只能為自己的公司
			var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);

			vehicleSelectListItems = _commonService.GetCompanyVehicles(user.CompanyId);
			vehicleSelectListItems.Insert(0, new SelectListItem { Text = "不限", Value = "null" });
			ViewBag.VehicleList = vehicleSelectListItems;

			List<SelectListItem> driverSelectListItems = new List<SelectListItem>();
			driverSelectListItems = _commonService.GetCompanyDrivers(user.CompanyId);
			driverSelectListItems.Insert(0, new SelectListItem { Text = "不限", Value = "null" });
			ViewBag.DriverList = driverSelectListItems;

			return View();
        }

		/// <summary>
		/// 查詢指定日期+司機/車輛 軌跡
		/// </summary>
		/// <param name="model"></param>
		/// <returns></returns>
		[HttpPost]
		public async Task<JsonResult> SearchTrace(SearchTraceModel model)
		{
			_logger.Information("Trace_SearchTrace({0}) ", JsonConvert.SerializeObject(model));

			if (SessionSearchTraceModel != null)
			{
				if (model != SessionSearchTraceModel)
					SessionSearchTraceModel = model;
				else
					model = SessionSearchTraceModel;
			}

			ResponseViewModel result = new ResponseViewModel();
			if (string.IsNullOrEmpty(model.DriverId) || model.DriverId == "null")
				model.DriverId = null;

			if (model.VehicleId == 0)
				model.VehicleId = null;
			
			try
			{
				TraceRecordViewModel trace = new TraceRecordViewModel();
				trace.BeginDateTimeString = string.Format("{0:yyyy/MM/dd HH:mm:ss}", model.BeginDateTime);
				trace.EndDateTimeString = string.Format("{0:yyyy/MM/dd HH:mm:ss}", model.EndDateTime);
				trace.VehicleId = model.VehicleId;
				trace.DriverId = model.DriverId;

				//直接從MongoDB擷取
				var trackLog = await _traceService.GetTrace(model);

				//從MongoDB API 擷取
				//var mongotrack = await GetTraceDataFromMongoDB(model);
				//_logger.Information("Trace_SearchTrace_MongoDBAPI: {0} ", JsonConvert.SerializeObject(mongotrack));

				var convertList = _traceService.ConvertToTraceView(trackLog, model.DriverId, model.VehicleId);
				trace.TraceList = convertList;

				result.IsOk = true;
				result.Message = "車輛軌跡查詢";
				result.Data = trace;
				result.HttpStatusCode = HttpStatusCode.OK;
			}
			catch (Exception ex)
			{
				result.IsOk = false;
				result.Exception = ex;
				result.Message = MessageResource.UnexpectedErrorOccurred;
				result.Data = null;
				result.HttpStatusCode = HttpStatusCode.InternalServerError;
			}

			result.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			_logger.Information("Trace_SearchTrace_Result({0}) ", JsonConvert.SerializeObject(result));
			return Json(result, JsonRequestBehavior.AllowGet);
		}

		/// <summary>
		/// 下載Excel
		/// </summary>
		/// <param name="model"></param>
		/// <returns></returns>
		[HttpPost]
		public async Task<ActionResult> DownLoadExcel()
		{
			//直接從MongoDB擷取
			var trackLog = await _traceService.GetTrace(SessionSearchTraceModel);
			var convertList = _traceService.ConvertToTraceView(trackLog, SessionSearchTraceModel.DriverId, SessionSearchTraceModel.VehicleId);

			string searchText = string.Format("軌跡查詢條件：起訖時間({0}~{1})", SessionSearchTraceModel.BeginDateTime, SessionSearchTraceModel.EndDateTime);
			if (!string.IsNullOrEmpty(SessionSearchTraceModel.DriverId))
			{
				var queryDriver = _aspNetUsersService.GetUserModel(SessionSearchTraceModel.DriverId);
				if (queryDriver != null)
					searchText += string.Format(", 司機({0})", queryDriver.RealName);
			}

			if (SessionSearchTraceModel.VehicleId.HasValue)
			{
				var queryVehicle = _vehicleService.GetVehicle(SessionSearchTraceModel.VehicleId.Value);
				if (queryVehicle != null)
					searchText += string.Format(", 車牌號碼({0})", queryVehicle.LicenseNumber);
			}

			string searchDateStr = "軌跡查詢_" + SessionSearchTraceModel.BeginDateTime.ToString("MMddHHmm") + "_" + SessionSearchTraceModel.EndDateTime.ToString("MMddHHmm");
			var fileStream = _traceService.GenerateXlsx(convertList, "軌跡查詢", searchText, searchDateStr + ".xlsx");
			return File(fileStream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "QueryTrace.xlsx");
		}

		/// <summary>
		/// 取得營業狀態列表
		/// </summary>
		/// <returns></returns>
		public JsonResult GetCStatusList()
		{
			ResponseViewModel result = new ResponseViewModel();
			try
			{
				result.IsOk = true;
				result.Data = _commonService.GetCStatusList();
				result.HttpStatusCode = HttpStatusCode.OK;
				result.Message = "營業狀態";
			}
			catch (Exception ex)
			{
				result.IsOk = false;
				result.Exception = ex;
				result.Message = MessageResource.UnexpectedErrorOccurred;
				result.Data = null;
				result.HttpStatusCode = HttpStatusCode.InternalServerError;
				_logger.Error("Trace_GetCStatus_Error({0}) ", JsonConvert.SerializeObject(result));
			}
			return Json(result, JsonRequestBehavior.AllowGet);
		}

		/// <summary>
		/// 依照訂單Id取得軌跡紀錄
		/// </summary>
		/// <param name="model"></param>
		/// <returns></returns>
		public async Task<JsonResult> GetTrace(BookingIDModel model)
		{
			ResponseViewModel result = new ResponseViewModel();

			try
			{
				List<TraceRecordsModel> data = new List<TraceRecordsModel>();
				data = await _traceService.GetTrace(model.MessageId);

				result.IsOk = true;
				result.Message = "載入訂單內的車輛軌跡";
				result.Data = data;
				result.HttpStatusCode = HttpStatusCode.OK;
			}
			catch (Exception ex)
			{
				result.IsOk = false;
				result.Exception = ex;
				result.Message = MessageResource.UnexpectedErrorOccurred;
				result.Data = null;
				result.HttpStatusCode = HttpStatusCode.InternalServerError;
			}
			return Json(result, JsonRequestBehavior.AllowGet);
		}
	}
}