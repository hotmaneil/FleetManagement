using Newtonsoft.Json;
using ResourceLibrary;
using Serilog;
using Services.Interface;
using Services.Service;
using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Utility.Extensions;
using ViewModel.Booking;
using ViewModel.Enum;
using ViewModel.Push;
using ViewModel.Share;
using ViewModel.VerifyViewModel;

namespace FleetManagement.Controllers
{
	/// <summary>
	/// 任務調派
	/// </summary>
	public class DispatchController : BaseController
	{
		private ILogger _logger = Log.Logger;

		readonly ICodeDetailService _codeDetailService;
		readonly IBookingService _bookingService;
		readonly IAspNetUsersService _aspNetUsersService;

		public DispatchController()
		{
			_codeDetailService = new CodeDetailService();
			_bookingService = new BookingService();
			_aspNetUsersService = new AspNetUsersService();
		}

		#region Session
		/// <summary>
		/// 網路搶單搜尋 ViewModel Session Property
		/// </summary>
		private DispatchSearchViewModel _sessionDispatchSearchModel;

		/// <summary>
		/// 網路搶單 Session
		/// </summary>
		public DispatchSearchViewModel SessionDispatchSearchModel
		{
			get
			{
				var sessionSearchModel = Session.GetDataFromSession<DispatchSearchViewModel>("sessionDispatchSearchModel");
				if (sessionSearchModel == null)
				{
					DispatchSearchViewModel _sessionNewSearchModel = new DispatchSearchViewModel();
					_sessionNewSearchModel.ProcessStatusList.Add((byte)BookingProcessStatusEnum.Quote);
					return _sessionNewSearchModel;
				}
				else
				{
					_sessionDispatchSearchModel = sessionSearchModel;
					return _sessionDispatchSearchModel;
				}
			}

			set
			{
				if (_sessionDispatchSearchModel != value)
				{
					_sessionDispatchSearchModel = value;
					Session.SetDataToSession<DispatchSearchViewModel>("sessionDispatchSearchModel", _sessionDispatchSearchModel);
				}
			}
		}
		#endregion

		/// <summary>
		/// 任務調派首頁
		/// </summary>
		/// <returns></returns>
		public ActionResult Index()
        {
			if (!User.Identity.IsAuthenticated)
				return RedirectToAction("Login", "Account");

			IntialDropDownList();
			return View(SessionDispatchSearchModel);
        }

		/// <summary>
		/// 傳回 訂單 List JsonResult
		/// </summary>
		/// <param name="SearchViewModel"></param>
		/// <returns></returns>
		[LogActionFilter]
		public JsonResult GetOrderList(DispatchSearchViewModel SearchViewModel)
		{
			if (SessionDispatchSearchModel != null)
			{
				if (SearchViewModel != SessionDispatchSearchModel)
					SessionDispatchSearchModel = SearchViewModel;
				else
					SearchViewModel = SessionDispatchSearchModel;
			}

			ResponseViewModel result = new ResponseViewModel();

			try
			{
				//限制只能為公司報價的
				var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
				SearchViewModel.QuotedCompanyId = user.CompanyId;

				result.Data = _bookingService.GetDispatchBookingList(SearchViewModel);
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

			string beginDateTime = SessionDispatchSearchModel.BeginDateTime.HasValue ? SessionDispatchSearchModel.BeginDateTime.Value.ToString("yyyy/MM/dd") : string.Empty;
			string endDateTime = SessionDispatchSearchModel.EndDateTime.HasValue ? SessionDispatchSearchModel.EndDateTime.Value.ToString("yyyy/MM/dd") : string.Empty;
			string postalName = string.Empty;
			if (SessionDispatchSearchModel.PostalCode.HasValue)
			{
				var queryPostal = _codeDetailService.GetLabel("PostalCode", SessionDispatchSearchModel.PostalCode.Value);
				if (!string.IsNullOrEmpty(queryPostal))
					postalName = queryPostal;
			}

			string searchText = string.Format("任務調派查詢條件：起訖時間({0}~{1}),地區({2}),車主({3})", beginDateTime, endDateTime, postalName, SessionDispatchSearchModel.DriverName);

			//限制只能為公司報價的
			var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
			SessionDispatchSearchModel.QuotedCompanyId = user.CompanyId;
			
			orderData = _bookingService.GetDispatchBookingList(SessionDispatchSearchModel);

			string searchDateStr = "任務調派報表_" + DateTime.Now.ToString("yyyyMMddHHmm");
			var fileStream = _bookingService.GenerateDispatchOrderXlsx(orderData, "任務調派報表", searchText, searchDateStr + ".xlsx");
			return File(fileStream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "QueryOrderData.xlsx");
		}

		/// <summary>
		/// 任務調派頁面
		/// </summary>
		/// <param name="MessageId"></param>
		/// <returns></returns>
		public ActionResult Dispatch(string MessageId)
		{
			if (!User.Identity.IsAuthenticated)
				return RedirectToAction("Login", "Account");

			BookingQuoteCollection data = new BookingQuoteCollection();

			//限制只能為公司報價的
			var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
			data = _bookingService.GetBookingQuote(MessageId, user.CompanyId);

			CommonGoodsOwnerDriverVehicleDropdownList(user.CompanyId);

			return View(data);
		}

		/// <summary>
		/// 資料儲存
		/// </summary>
		/// <param name="model"></param>
		/// <param name="goodsPhotoUpload"></param>
		/// <returns></returns>
		[LogActionFilter]
		[HttpPost]
		public async Task<ActionResult> Save(BookingQuoteCollection model, HttpPostedFileBase[] goodsPhotoUpload)
		{
			VerityBookingResult result = new VerityBookingResult();
			if (ModelState.IsValid)
			{
				try
				{
					var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
					result = await _bookingService.UpdateBookingQuote(model, user.Id, user.CompanyId);

					if (result.IsOk)
					{
						int count = 1;
						if (goodsPhotoUpload != null)
						{
							foreach (HttpPostedFileBase file in goodsPhotoUpload)
							{
								VerityResult uploadResult = new VerityResult();
								bool isUpload = FileUploadVerify(file);
								if (isUpload)
									uploadResult = await UploadImageFile(file, result.GoodOwnerId, result.MessageId, count);

								count++;
							}
						}
						
						TempData["SaveResult"] = result.Message;

						#region 推播通知原車主取消、新車主新任務
						//原車主
						var queryOriginDriver = _aspNetUsersService.GetUserModel(model.DriverQuotePrice.OldDriverId);
						string originDriver = string.Empty;
						if (!string.IsNullOrEmpty(queryOriginDriver.Sex))
							originDriver = StringExt.AppellationName(queryOriginDriver.RealName, queryOriginDriver.Sex.Trim());
						else
							originDriver = queryOriginDriver.RealName;

						string title = "原" + Resource.Driver + originDriver + MessageResource.CancelMission;
						string body = string.Empty;

						PushMessageViewModel pushMsg = RunPushApi(title, body, user.Id, model.DriverQuotePrice.OldDriverId, 10, model.Booking.MessageId.ToString());
						await RunPushApiAsync(pushMsg);

						//新車主
						var queryNewDriver = _aspNetUsersService.GetUserModel(model.DriverQuotePrice.DriverId);
						string newDriver = string.Empty;
						if (!string.IsNullOrEmpty(queryNewDriver.Sex))
							newDriver = StringExt.AppellationName(queryNewDriver.RealName, queryNewDriver.Sex.Trim());
						else
							newDriver = queryNewDriver.RealName;

						string newTitle = "新" + Resource.Driver + newDriver + MessageResource.HadNewMission;
						string newBody = string.Empty;

						PushMessageViewModel newPushMsg = RunPushApi(newTitle, newBody, user.Id, model.DriverQuotePrice.DriverId, 10, model.Booking.MessageId.ToString());
						await RunPushApiAsync(newPushMsg);
						#endregion

						#region 推播通知貨主變更司機
						//貨主
						var queryGoodsOwner = _aspNetUsersService.GetUserModel(model.Booking.GoodOwnerId);
						string goodsOwner = string.Empty;
						if (!string.IsNullOrEmpty(queryGoodsOwner.Sex))
							goodsOwner = StringExt.AppellationName(queryGoodsOwner.RealName, queryGoodsOwner.Sex.Trim());
						else
							goodsOwner = queryNewDriver.RealName;

						string forgoodsOwnerTitle = "原" + Resource.Driver + originDriver + "變更為新" + Resource.Driver + newDriver;
						PushMessageViewModel goodsOwnerPushMsg = RunPushApi(forgoodsOwnerTitle, null, user.Id, model.Booking.GoodOwnerId, 10, model.Booking.MessageId.ToString());
						await RunPushApiAsync(goodsOwnerPushMsg);
						#endregion

						return RedirectToAction("Index");
					}
					else
						TempData["SaveResult"] = result.Message;
				}
				catch (Exception ex)
				{
					TempData["SaveResult"] = result.Message;
					_logger.Information($"Save BookingViewModel error : { JsonConvert.SerializeObject(ex)}");
					throw ex;
				}
			}
			return View("Create", model);
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
		}
	}
}