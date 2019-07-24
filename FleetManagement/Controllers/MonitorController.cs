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
using ViewModel.Monitor;
using ViewModel.Share;
using ViewModel.Trace;

namespace FleetManagement.Controllers
{
	[LogActionFilter]
	public class MonitorController : BaseController
    {
		private ILogger _logger = Log.Logger;
		readonly ILastLocationService _lastLocationService;
		readonly IAspNetUsersService _aspNetUsersService;
		readonly ITraceService _traceService;

		public MonitorController()
		{
			_lastLocationService = new LastLocationService();
			_aspNetUsersService = new AspNetUsersService();
			_traceService = new TraceService();
		}

		/// <summary>
		/// 即時監控 首頁
		/// </summary>
		/// <returns></returns>
		public ActionResult Index()
        {
			ResponseViewModel result = new ResponseViewModel();
			if (!User.Identity.IsAuthenticated)
			{
				result.IsOk = false;
				result.HttpStatusCode = HttpStatusCode.Unauthorized;
				result.Message = "逾時登入，請重新登入";
				_logger.Information("Index", JsonConvert.SerializeObject(result));
				return RedirectToAction("Login", "Account");
			}

			var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);

			StatusListCollention collention = new StatusListCollention();
			collention.CStatuSstatisticsList = _lastLocationService.GetCStatuSstatisticsList(user.CompanyId);
			collention.GroupVehicleStatusList = _lastLocationService.GetGroupVehicleStatusList(user.CompanyId);
			return View(collention);
        }

		/// <summary>
		/// 監控資料: 群組車輛資訊
		/// </summary>
		/// <param name="sort">排序: 1司機,2車號,3狀態</param>
		/// <returns></returns>
		[HttpGet]
		public async Task<JsonResult> GetMonitorData()
		{
			_logger.Information("Monitor_GetMonitorData. ");
			ResponseViewModel result = new ResponseViewModel();

			if (!User.Identity.IsAuthenticated)
			{
				result.IsOk = false;
				result.HttpStatusCode = HttpStatusCode.Unauthorized;
				result.Message = "逾時登入，請重新登入";
				_logger.Information("Monitor_GetMonitorData_Result({0}) ", JsonConvert.SerializeObject(result));
				return Json(result, JsonRequestBehavior.AllowGet);
			}

			try
			{
				var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
				List<MonitorVehicleGroupModel> carGroupList = await _lastLocationService.GetByAllForMonitor(user.CompanyId);

				result.IsOk = true;
				result.Message = "地圖監控群組車輛";
				result.Data = new
				{
					CarGroups = carGroupList
				};
				result.HttpStatusCode = HttpStatusCode.OK;
			}
			catch (Exception ex)
			{
				result.IsOk = false;
				result.Exception = ex;
				result.Message = MessageResource.UnexpectedErrorOccurred;
				result.Data = new { };
				result.HttpStatusCode = HttpStatusCode.InternalServerError;
			}

			result.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			_logger.Information("Monitor_GetMonitorData_Result({0}) ", JsonConvert.SerializeObject(result));
			return Json(result, JsonRequestBehavior.AllowGet);
		}

		/// <summary>
		/// 監控資料: 指定單一司機車輛查詢最近位置資訊
		/// </summary>
		/// <param name="driverid">司機帳號UserId</param>
		/// <returns></returns>
		[HttpGet]
		public JsonResult GetSignleInfo(string driverid)
		{
			_logger.Information("Monitor_GetSignleInfo: driverId= {0}", driverid);
			ResponseViewModel result = new ResponseViewModel();

			#region 方便 Postman 測試用 暫時先Marked
			//if (!User.Identity.IsAuthenticated)
			//{
			//    result.Success = false;
			//    result.HttpStatusCode = (HttpStatusCode)401;
			//    result.Message = "逾時登入，請重新登入";
			//    _logger.Information("Monitor_GetMonitorData_Result({0}) ", JsonConvert.SerializeObject(result));
			//    return Json(result, JsonRequestBehavior.AllowGet);
			//}
			#endregion

			MonitorSignleInfoModel signleinfo = new MonitorSignleInfoModel();
			try
			{
				signleinfo = _lastLocationService.GetBySignleMonitor(driverid);
				result.IsOk = true;
				result.Message = "地圖監控單筆司機車輛資訊";
				result.Data = signleinfo;
				result.HttpStatusCode = HttpStatusCode.OK;
			}
			catch (Exception ex)
			{
				result.IsOk = false;
				result.Exception = ex;
				result.Message = MessageResource.UnexpectedErrorOccurred;
				result.Data = signleinfo;
				result.HttpStatusCode = HttpStatusCode.InternalServerError;
			}

			result.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			_logger.Information("Monitor_GetSignleInfo_Result({0}) ", JsonConvert.SerializeObject(result));
			return Json(result, JsonRequestBehavior.AllowGet);
		}

		/// <summary>
		/// 開啟單一司機檢視軌跡(當日)
		/// </summary>
		/// <param name="model"></param>
		/// <returns></returns>
		[HttpGet]
		public async Task<ActionResult> SingleTraceView(SearchTraceModel model)
		{
			_logger.Information("Monitor_SingleTraceView({0}) ", JsonConvert.SerializeObject(model));
			ResponseViewModel result = new ResponseViewModel();
			List<TraceRecordsModel> convertList = new List<TraceRecordsModel>();
			try
			{
				TraceRecordViewModel trace = new TraceRecordViewModel();
				trace.BeginDateTimeString = string.Format("{0:yyyy/MM/dd HH:mm:ss}", model.BeginDateTime);
				trace.EndDateTimeString = string.Format("{0:yyyy/MM/dd HH:mm:ss}", model.EndDateTime);
				trace.VehicleId = model.VehicleId;
				trace.DriverId = model.DriverId;
				
				var mongotrack = await GetTraceDataFromMongoDB(model);
				_logger.Information("Monitor_SingleTraceView_MongoDBAPI: {0} ", JsonConvert.SerializeObject(mongotrack));

				convertList = _traceService.ConvertToTraceView(mongotrack, model.DriverId, model.VehicleId);
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
			_logger.Information("Monitor_SingleTraceView_Result({0}) ", JsonConvert.SerializeObject(result));
			return View("SingleTraceView", convertList);
		}
	}
}