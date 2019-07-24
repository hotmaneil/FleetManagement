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
using ViewModel.User;
using ViewModel.VerifyViewModel;

namespace FleetManagement.Controllers
{
	/// <summary>
	/// 訂車客服
	/// </summary>
	public class OrderClientServiceController : BaseController
    {
		private ILogger _logger = Log.Logger;

		readonly IBookingService _bookingService;
		readonly IAspNetUsersService _aspNetUsersService;
		readonly IVehicleService _vehicleService;
		readonly ICustomerService _customerService;

		public OrderClientServiceController()
		{
			_bookingService = new BookingService();
			_aspNetUsersService = new AspNetUsersService();
			_vehicleService = new VehicleService();
			_customerService = new CustomerService();
		}

		#region Session
		/// <summary>
		/// 任務搜尋 ViewModel Session Property
		/// </summary>
		private BaseBookingSearchModel _sessionOrderBookingSearchModel;

		/// <summary>
		/// 任務 Session
		/// </summary>
		public BaseBookingSearchModel SessionOrderBookingSearchModel
		{
			get
			{
				var sessionSearchModel = Session.GetDataFromSession<BaseBookingSearchModel>("sessionOrderBookingSearchModel");
				if (sessionSearchModel == null)
				{
					BaseBookingSearchModel _sessionNewSearchModel = new BaseBookingSearchModel();
					_sessionNewSearchModel.ProcessStatusList.Add((byte)BookingProcessStatusEnum.Quote);
					return _sessionNewSearchModel;
				}
				else
				{
					_sessionOrderBookingSearchModel = sessionSearchModel;
					return _sessionOrderBookingSearchModel;
				}
			}

			set
			{
				if (_sessionOrderBookingSearchModel != value)
				{
					_sessionOrderBookingSearchModel = value;
					Session.SetDataToSession<BaseBookingSearchModel>("sessionOrderBookingSearchModel", _sessionOrderBookingSearchModel);
				}
			}
		}
		#endregion

		/// <summary>
		/// 訂車客服首頁
		/// </summary>
		/// <returns></returns>
		public ActionResult Index()
        {
			if (!User.Identity.IsAuthenticated)
				return RedirectToAction("Login", "Account");

			return View(SessionOrderBookingSearchModel);
        }

		/// <summary>
		/// 傳回 訂車客服 List JsonResult
		/// </summary>
		/// <param name="SearchViewModel"></param>
		/// <returns></returns>
		[LogActionFilter]
		public JsonResult GetOrderList(BaseBookingSearchModel SearchViewModel)
		{
			if (SessionOrderBookingSearchModel != null)
			{
				if (SearchViewModel != SessionOrderBookingSearchModel)
					SessionOrderBookingSearchModel = SearchViewModel;
				else
					SearchViewModel = SessionOrderBookingSearchModel;
			}

			ResponseViewModel result = new ResponseViewModel();

			try
			{
				//限制只能為自己下訂的
				var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
				SearchViewModel.SearchCompanyId = user.CompanyId;
				SearchViewModel.IsAssignDriver = true;
				SearchViewModel.ProcessStatusList.Add((byte)BookingProcessStatusEnum.Quote);
				SearchViewModel.ProcessStatusList.Add((byte)BookingProcessStatusEnum.ConfirmTransaction);

				_logger.Debug("GetOrderList model:" + JsonConvert.SerializeObject(SearchViewModel));

				result.Data = _bookingService.GetOrderBookingList(SearchViewModel);
				result.IsOk = true;
				result.HttpStatusCode = HttpStatusCode.OK;
			}
			catch (Exception ex)
			{
				result.IsOk = false;
				result.Exception = ex;
				result.HttpStatusCode = HttpStatusCode.InternalServerError;
				_logger.Debug("GetOrderList ex:" + JsonConvert.SerializeObject(ex.Message));
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

			string beginDateTime = SessionOrderBookingSearchModel.BeginDateTime.HasValue ? SessionOrderBookingSearchModel.BeginDateTime.Value.ToString("yyyy/MM/dd") : string.Empty;
			string endDateTime= SessionOrderBookingSearchModel.EndDateTime.HasValue ? SessionOrderBookingSearchModel.EndDateTime.Value.ToString("yyyy/MM/dd") : string.Empty;
			string searchText = string.Format("訂車客服查詢條件：起訖時間({0}~{1})", beginDateTime, endDateTime);

			//限制只能為自己下訂的
			var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
			SessionOrderBookingSearchModel.SearchCompanyId = user.CompanyId;
			SessionOrderBookingSearchModel.ProcessStatusList.Add((byte)BookingProcessStatusEnum.Quote);
			SessionOrderBookingSearchModel.ProcessStatusList.Add((byte)BookingProcessStatusEnum.ConfirmTransaction);

			orderData = _bookingService.GetOrderBookingList(SessionOrderBookingSearchModel);

			string searchDateStr = "訂車客服報表_" + DateTime.Now.ToString("yyyyMMddHHmm");
			var fileStream = _bookingService.GenerateOrderBookingXlsx(orderData, "訂車客服報表", searchText, searchDateStr + ".xlsx");
			return File(fileStream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "QueryOrderData.xlsx");
		}

		/// <summary>
		/// 新增頁面
		/// </summary>
		/// <returns></returns>
		public ActionResult Create()
		{
			if (!User.Identity.IsAuthenticated)
				return RedirectToAction("Login", "Account");

			var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
			CommonGoodsOwnerDriverVehicleDropdownList(user.CompanyId);
			BookingViewModel data = new BookingViewModel();

			return View(data);
		}

		/// <summary>
		/// 編輯頁面
		/// </summary>
		/// <param name="MessageId"></param>
		/// <returns></returns>
		public ActionResult Edit(string MessageId)
		{
			if (!User.Identity.IsAuthenticated)
				return RedirectToAction("Login", "Account");

			BookingViewModel data = new BookingViewModel();
			data = _bookingService.GetBooking(MessageId);

			var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
			CommonGoodsOwnerDriverVehicleDropdownList(user.CompanyId);

			return View("Create", data);
		}

		/// <summary>
		/// 資料儲存
		/// </summary>
		/// <param name="model"></param>
		/// <param name="goodsPhotoUpload"></param>
		/// <returns></returns>
		[LogActionFilter]
		[HttpPost]
		public async Task<ActionResult> Save(BookingViewModel model,HttpPostedFileBase[] goodsPhotoUpload)
		{
			VerityBookingResult result = new VerityBookingResult();
			if (ModelState.IsValid)
			{
				try
				{
					var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
					result = await _bookingService.CreateOrUpdateBooking(model, user.Id, user.CompanyId);

					if (result.IsOk)
					{
						int count = 1;
						foreach (HttpPostedFileBase file in goodsPhotoUpload)
						{
							VerityResult uploadResult = new VerityResult();
							bool isUpload = FileUploadVerify(file);
							if (isUpload)
								uploadResult = await UploadImageFile(file, result.GoodOwnerId, result.MessageId, count);

							count++;
						}

						TempData["SaveResult"] = result.Message;

						#region 推播
						if (!string.IsNullOrEmpty(model.DriverId))
						{
							string appellationGoodsOwner = string.Empty;
							if (!string.IsNullOrEmpty(user.Sex))
								appellationGoodsOwner = StringExt.AppellationName(user.RealName, user.Sex.Trim());
							else
								appellationGoodsOwner = user.RealName;

							string title = Resource.GoodsOwner + appellationGoodsOwner + Resource.ConfirmTransaction;
							string body = model.BookingDate + " " + model.StartAddress + Resource.GoToward + model.TargetAddress;

							PushMessageViewModel pushMsg = RunPushApi(title, body, user.Id, model.DriverId, 3, result.MessageId.ToString());
							await RunPushApiAsync(pushMsg);
						}
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
		/// 取得貨主電話號碼
		/// </summary>
		/// <param name="GoodOwnerId"></param>
		/// <returns></returns>
		[HttpPost]
		public JsonResult GetGoodOwnerPhoneNumber(UserIdModel model)
		{
			string phoneNumber = string.Empty;
			
			var queryCustomer = _customerService.GetCustomerByUserId(model.UserId);
			if (queryCustomer != null)
				phoneNumber = queryCustomer.ContactPhoneNumber;
			else
			{
				var queryUser = _aspNetUsersService.QueryUsersByID(model.UserId);
				phoneNumber = queryUser.PhoneNumber;
			}
			return Json(phoneNumber);
		}
	}
}