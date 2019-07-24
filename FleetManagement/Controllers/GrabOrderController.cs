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
using ViewModel.Enum;
using ViewModel.Push;
using ViewModel.Quote;
using ViewModel.Share;

namespace FleetManagement.Controllers
{
	/// <summary>
	/// 網路搶單 控制器
	/// </summary>
	public class GrabOrderController : BaseController
	{
		private ILogger _logger = Log.Logger;

		readonly ICodeDetailService _codeDetailService;
		readonly IAspNetUsersService _aspNetUsersService;
		readonly IVehicleService _vehicleService;
		readonly IBookingService _bookingService;

		public GrabOrderController()
		{
			_codeDetailService = new CodeDetailService();
			_aspNetUsersService = new AspNetUsersService();
			_vehicleService = new VehicleService();
			_bookingService = new BookingService();
		}

		#region Session
		/// <summary>
		/// 網路搶單搜尋 ViewModel Session Property
		/// </summary>
		private BaseBookingSearchModel _sessionOrderSearchModel;

		/// <summary>
		/// 網路搶單 Session
		/// </summary>
		public BaseBookingSearchModel SessionOrderSearchModel
		{
			get
			{
				var sessionSearchModel = Session.GetDataFromSession<BaseBookingSearchModel>("sessionOrderSearchModel");
				if (sessionSearchModel == null)
				{
					BaseBookingSearchModel _sessionNewSearchModel = new BaseBookingSearchModel();
					_sessionNewSearchModel.ProcessStatusList.Add((byte)BookingProcessStatusEnum.Quote);
					return _sessionNewSearchModel;
				}
				else
				{
					_sessionOrderSearchModel = sessionSearchModel;
					return _sessionOrderSearchModel;
				}
			}

			set
			{
				if (_sessionOrderSearchModel != value)
				{
					_sessionOrderSearchModel = value;
					Session.SetDataToSession<BaseBookingSearchModel>("sessionOrderSearchModel", _sessionOrderSearchModel);
				}
			}
		}
		#endregion

		/// <summary>
		/// 網路搶單 首頁
		/// </summary>
		/// <returns></returns>
		public ActionResult Index()
        {
			IntialDropDownList();
			return View(SessionOrderSearchModel);
        }

		/// <summary>
		/// 傳回 網路搶單 List JsonResult
		/// </summary>
		/// <param name="SearchViewModel"></param>
		/// <returns></returns>
		[LogActionFilter]
		public JsonResult GetOrderList(BaseBookingSearchModel SearchViewModel)
		{
			_logger.Debug("GetOrderList SearchViewModel:" + JsonConvert.SerializeObject(SearchViewModel));

			if (SessionOrderSearchModel != null)
			{
				if (SearchViewModel != SessionOrderSearchModel)
					SessionOrderSearchModel = SearchViewModel;
				else
					SearchViewModel = SessionOrderSearchModel;
			}

			ResponseViewModel result = new ResponseViewModel();

			try
			{
				//限制只能為公司報價的
				var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);

				//不能顯示公司下的訂單
				SearchViewModel.ExcludeCompanyId = user.CompanyId;

				SearchViewModel.QuotedCompanyId = user.CompanyId;
				SearchViewModel.ProcessStatusList.Add((byte)BookingProcessStatusEnum.Quote);
				SearchViewModel.IsAssignDriver = false;				   
				result.Data = _bookingService.GetOrderBookingList(SearchViewModel);
				result.IsOk = true;
				result.HttpStatusCode = HttpStatusCode.OK;
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
		/// 下載Excel
		/// </summary>
		/// <returns></returns>
		[HttpPost]
		public ActionResult DownLoadExcel()
		{
			List<OrderBookingListViewModel> orderData = new List<OrderBookingListViewModel>();
			ResponseViewModel result = new ResponseViewModel();

			string beginDateTime = SessionOrderSearchModel.BeginDateTime.HasValue ? SessionOrderSearchModel.BeginDateTime.Value.ToString("yyyy/MM/dd") : string.Empty;
			string endDateTime = SessionOrderSearchModel.EndDateTime.HasValue ? SessionOrderSearchModel.EndDateTime.Value.ToString("yyyy/MM/dd") : string.Empty;

			string postalName = string.Empty;
			if (SessionOrderSearchModel.PostalCode.HasValue)
			{
				var queryPostal = _codeDetailService.GetLabel("PostalCode", SessionOrderSearchModel.PostalCode.Value);
				if (!string.IsNullOrEmpty(queryPostal))
					postalName = queryPostal;
			}

			string searchText = string.Format("網路搶單查詢條件：起訖時間({0}~{1}),地區({2})", beginDateTime, endDateTime, postalName);

			// 限制只能為公司報價的
			var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);

			//不能顯示公司下的訂單
			SessionOrderSearchModel.ExcludeCompanyId = user.CompanyId;

			SessionOrderSearchModel.ProcessStatusList.Add((byte)BookingProcessStatusEnum.Quote);
			orderData = _bookingService.GetOrderBookingList(SessionOrderSearchModel);

			string searchDateStr = "網路搶單報表_" + DateTime.Now.ToString("yyyyMMddHHmm");
			var fileStream = _bookingService.GenerateGrabOrderXlsx(orderData, "網路搶單報表", searchText, searchDateStr + ".xlsx");
			return File(fileStream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "QueryOrderData.xlsx");
		}

		/// <summary>
		/// 報價
		/// </summary>
		/// <param name="Model"></param>
		/// <returns></returns>
		[LogActionFilter]
		public async Task<JsonResult> Quote(DriverQuotePriceViewModel Model)
		{
			_logger.Information($"Quote : { JsonConvert.SerializeObject(Model)}");

			ResponseViewModel responseResult = new ResponseViewModel();

			try
			{
				var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
				responseResult = await _bookingService.CreateOrUpdateQuotedRecords(Model, user.Id, null);

				if (responseResult.IsOk)
				{
					#region 報價推播通知
					var queryDriver = _aspNetUsersService.GetUserModel(Model.DriverId);
					string appellationDriver = string.Empty;
					if (!string.IsNullOrEmpty(queryDriver.Sex))
						appellationDriver = StringExt.AppellationName(queryDriver.RealName, queryDriver.Sex.Trim());
					else
						appellationDriver = queryDriver.RealName;
					
					string title = Resource.Driver + appellationDriver + string.Format(Resource.QuotedPrice, Model.QuotedPrice);
					string body = string.Empty;
					string goodsOwnerId = _bookingService.GetBooking(Model.MessageId).GoodOwnerId;

					PushMessageViewModel pushMsg = RunPushApi(title, body, user.Id, goodsOwnerId, 10, Model.MessageId.ToString());
					await RunPushApiAsync(pushMsg);
					#endregion
				}
			}
			catch (Exception ex)
			{
				_logger.Information($"Quote exception: { JsonConvert.SerializeObject(ex)}");
				responseResult.IsOk = false;
				responseResult.Message = ex.ToString();
				throw ex;
			}
			return Json(responseResult, JsonRequestBehavior.DenyGet);
		}

		/// <summary>
		/// 取得目前的報價
		/// </summary>
		/// <param name="model"></param>
		/// <returns></returns>
		public JsonResult GetCurrentQuote(QuoteCreaterViewModel model)
		{
			ResponseViewModel responseResult = new ResponseViewModel();

			try
			{
				var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
				model.CreaterId = user.Id;

				responseResult.Data = _bookingService.GetCurrentDriverQuotePrice(model);
				responseResult.IsOk = true;
				responseResult.HttpStatusCode= HttpStatusCode.OK;
			}
			catch (Exception ex)
			{
				responseResult.IsOk = false;
				responseResult.Exception = ex;
				responseResult.HttpStatusCode = HttpStatusCode.InternalServerError;
			}

			return Json(responseResult, JsonRequestBehavior.DenyGet);
		}

		/// <summary>
		/// 修改報價
		/// </summary>
		/// <param name="Model"></param>
		/// <returns></returns>
		public async Task<JsonResult> ModifyQuote(DriverQuotePriceViewModel Model)
		{
			_logger.Information($"ModifyQuote : { JsonConvert.SerializeObject(Model)}");

			ResponseViewModel responseResult = new ResponseViewModel();

			try
			{
				var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
				responseResult = await _bookingService.UpdateOrDeleteQuotedRecordsByCreater(Model, user.Id, "Update");

				if (responseResult.IsOk)
				{
					#region 修改報價推播通知
					var queryDriver = _aspNetUsersService.GetUserModel(Model.DriverId);
					string appellationDriver = string.Empty;
					if (!string.IsNullOrEmpty(queryDriver.Sex))
						appellationDriver = StringExt.AppellationName(queryDriver.RealName, queryDriver.Sex.Trim());
					else
						appellationDriver = queryDriver.RealName;

					string title = Resource.Driver + appellationDriver + string.Format(Resource.QuotedPrice, Model.QuotedPrice);
					string body = string.Empty;
					string goodsOwnerId = _bookingService.GetBooking(Model.MessageId).GoodOwnerId;

					PushMessageViewModel pushMsg = RunPushApi(title, body, user.Id, goodsOwnerId, 10, Model.MessageId.ToString());
					await RunPushApiAsync(pushMsg);
					#endregion
				}
			}
			catch (Exception ex)
			{
				_logger.Information($"Quote exception: { JsonConvert.SerializeObject(ex)}");
				responseResult.IsOk = false;
				responseResult.Message = ex.ToString();
				throw ex;
			}
			return Json(responseResult, JsonRequestBehavior.DenyGet);
		}

		/// <summary>
		/// 取消報價
		/// </summary>
		/// <param name="Model"></param>
		/// <returns></returns>
		public async Task<JsonResult> CancelQuote(DriverQuotePriceViewModel Model)
		{
			_logger.Information($"CancelQuote : { JsonConvert.SerializeObject(Model)}");

			ResponseViewModel responseResult = new ResponseViewModel();

			try
			{
				var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
				responseResult = await _bookingService.UpdateOrDeleteQuotedRecordsByCreater(Model, user.Id, "Delete");

			}
			catch (Exception ex)
			{
				_logger.Information($"CancelQuote exception: { JsonConvert.SerializeObject(ex)}");
				responseResult.IsOk = false;
				responseResult.Message = ex.ToString();
				throw ex;
			}
			return Json(responseResult, JsonRequestBehavior.DenyGet);
		}

		/// <summary>
		/// 初始下拉選單
		/// </summary>
		public void IntialDropDownList()
		{
			List<SelectListItem> PostalCodeSelectListItem = new List<SelectListItem>();
			PostalCodeSelectListItem.Add(new SelectListItem { Text = "不選擇", Value = " " });
			PostalCodeSelectListItem.AddRange(_codeDetailService.GetItemByTypeCode("PostalCode"));
			ViewBag.SelectPostalCodeList = PostalCodeSelectListItem;

			List<SelectListItem> driverSelectListItem = new List<SelectListItem>();
			List<int> driverLevels = new List<int>();
			driverLevels.Add((int)MemberLevelEnum.DriverLevel1);
			driverLevels.Add((int)MemberLevelEnum.DriverLevel2);
			driverLevels.Add((int)MemberLevelEnum.DriverLevel3);
			driverLevels.Add((int)MemberLevelEnum.DriverLevel4);

			//限制只能為自己的公司
			var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
			driverSelectListItem.Add(new SelectListItem { Text = "不選擇", Value = " " });
			driverSelectListItem.AddRange(_aspNetUsersService.GetUserSelectListItem(driverLevels, user.CompanyId, null));
			ViewBag.DriverList = driverSelectListItem;

			List<SelectListItem> vehicleSelectListItem = new List<SelectListItem>();
			vehicleSelectListItem.Add(new SelectListItem { Text = "不選擇", Value = " " });
			ViewBag.VehicleList = vehicleSelectListItem;

			List<SelectListItem> vehicleEditSelectListItem = new List<SelectListItem>();
			vehicleEditSelectListItem.Add(new SelectListItem { Text = "不選擇", Value = " " });
			vehicleEditSelectListItem.AddRange(_vehicleService.GetVehicleBy(user.CompanyId));
			ViewBag.EditVehicleList = vehicleEditSelectListItem;
		}
    }
}