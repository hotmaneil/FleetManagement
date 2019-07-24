using MongoDB.Bson;
using Newtonsoft.Json;
using Serilog;
using Services.Interface;
using Services.Service;
using SQLModel.MongoDBModels;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Utility.Image;
using ViewModel.Booking;
using ViewModel.Enum;
using ViewModel.Push;
using ViewModel.Share;
using ViewModel.Trace;
using ViewModel.User;

namespace FleetManagement.Controllers
{
	/// <summary>
	/// 基礎/共用Controller
	/// </summary>
	public class BaseController : Controller
    {
		private ILogger _logger = Log.Logger;
		string MongoAPIUrl = ConfigurationManager.AppSettings["MongoAPIUrl"].ToString();
		static string PushAPIUrl = ConfigurationManager.AppSettings["PushAPIUrl"].ToString();

		readonly IAspNetUsersService _aspNetUsersService;
		readonly IAspNetRolesService _aspNetRolesService;
		readonly ICompanyService _companyService;
		readonly IVehicleService _vehicleService;
		readonly IBookingService _bookingService;
		readonly IPhonePushMessageServicecs _phonePushMessageService;
		readonly IMobilePushKeyService _mobilePushKeyService;
		readonly ICustomerService _customerService;

		public BaseController()
		{
			_aspNetUsersService = new AspNetUsersService();
			_aspNetRolesService = new AspNetRolesService();
			_companyService = new CompanyService();
			_vehicleService = new VehicleService();
			_bookingService = new BookingService();
			_phonePushMessageService = new PhonePushMessageService();
			_mobilePushKeyService = new MobilePushKeyService();
			_customerService = new CustomerService();
		}

		#region MongoDB軌跡
		/// <summary>
		/// 軌跡MongoDB API
		/// </summary>
		/// <param name="model">>查詢軌跡參數: UTC起迄日期時間(必填), [司機UserId, VehicleId, TaskId(擇一)]</param>
		/// <param name="type">查詢軌跡條件: D-司機UserId(預設)、V-車輛Id、T-任務Id</param>
		public async Task<List<MongoAPIResponseModel>> GetTraceDataFromMongoDB(SearchTraceModel model)
		{
			_logger.Information("GetTraceDataFromMongoDB_: {0} ", JsonConvert.SerializeObject(model));

			string utcB = model.BeginDateTime.ToUniversalTime().ToString("yyyy'-'MM'-'dd HH':'mm':'ss");
			string utcE = model.EndDateTime.ToUniversalTime().ToString("yyyy'-'MM'-'dd HH':'mm':'ss");
			string requestUrl = string.Format("api/TrackLog/GetByDriverIdOrVehicleId?DriverId={0}&VehicleId={1}&utcStartTime={2}&utcTargetTime={3}", model.DriverId, model.VehicleId, utcB, utcE);

			_logger.Information("GetMongoDBTrace_mongoAPI : {0}{1} ", MongoAPIUrl, requestUrl);
			List<MongoAPIResponseModel> traceList = new List<MongoAPIResponseModel>();

			try
			{
				var client = new HttpClient();
				MongoAPIUrl = ConfigurationManager.AppSettings["MongoAPIUrl"].ToString();
				client.BaseAddress = new Uri(MongoAPIUrl);
				client.DefaultRequestHeaders.Accept.Clear();
				client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

				HttpResponseMessage response = await client.GetAsync(requestUrl);
				_logger.Information("GetMongoDBTrace_mongoAPI_Result: {0} ", JsonConvert.SerializeObject(response));
				if (response.IsSuccessStatusCode)
				{
					var mg = await response.Content.ReadAsAsync<IEnumerable<MongoAPIResponseModel>>();
					foreach (var i in mg)
					{
						traceList.Add(i);
					}
				}

				client.Dispose();
			}
			catch (Exception ex)
			{
				_logger.Error("GetTraceDataFromMongoDB_Exception: {0} ", JsonConvert.SerializeObject(ex));
			}

			_logger.Information("GetTraceDataFromMongoDB_Result: {0} ", JsonConvert.SerializeObject(traceList));
			return traceList;
		}

		/// <summary>
		/// 軌跡MongoDB API (MessageId)
		/// </summary>
		/// <param name="MessageId">預約Id</param>
		/// <returns></returns>
		public async Task<List<MongoAPIResponseModel>> GetTraceDataFromMongoDB(string MessageId)
		{
			_logger.Information("GetTraceDataFromMongoDB_: {0} ", JsonConvert.SerializeObject(MessageId));

			
			string requestUrl = string.Format("api/TrackLog/MessageId?MessageId={0}", MessageId);

			_logger.Information("GetMongoDBTrace_mongoAPI : {0}{1} ", MongoAPIUrl, requestUrl);
			List<MongoAPIResponseModel> traceList = new List<MongoAPIResponseModel>();

			try
			{
				var client = new HttpClient();
				MongoAPIUrl = ConfigurationManager.AppSettings["MongoAPIUrl"].ToString();
				client.BaseAddress = new Uri(MongoAPIUrl);
				client.DefaultRequestHeaders.Accept.Clear();
				client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

				HttpResponseMessage response = await client.GetAsync(requestUrl);
				_logger.Information("GetMongoDBTrace_mongoAPI_Result: {0} ", JsonConvert.SerializeObject(response));
				if (response.IsSuccessStatusCode)
				{
					var mg = await response.Content.ReadAsAsync<IEnumerable<MongoAPIResponseModel>>();
					foreach (var i in mg)
					{
						traceList.Add(i);
					}
				}

				client.Dispose();
			}
			catch (Exception ex)
			{
				_logger.Error("GetTraceDataFromMongoDB_Exception: {0} ", JsonConvert.SerializeObject(ex));
			}

			_logger.Information("GetTraceDataFromMongoDB_Result: {0} ", JsonConvert.SerializeObject(traceList));
			return traceList;
		}
		#endregion

		#region 共用
		/// <summary>
		/// 依照角色判斷公司下拉選單
		/// </summary>
		/// <returns></returns>
		public List<SelectListItem> GetCompanySelectListItemByRole(string FirstSelectItem)
		{
			var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
			var role = _aspNetRolesService.GetById(user.RoleId);

			List<SelectListItem> companySelectListItem = new List<SelectListItem>();

			if (role != null)
			{
				switch (role.Name)
				{
					case "FleetManager":
						companySelectListItem.AddRange(_companyService.GetCompanyList(user.CompanyId));
						break;

					default:
						companySelectListItem.Add(new SelectListItem { Text = FirstSelectItem, Value = "NULL" });
						companySelectListItem.AddRange(_companyService.GetCompanyList(user.CompanyId));
						break;
				}
			}

			return companySelectListItem;
		}

		/// <summary>
		/// 取得使用者車輛列表
		/// </summary>
		/// <param name="model"></param>
		/// <returns></returns>
		[HttpPost]
		public JsonResult GetOwnVehicleList(UserIdModel model)
		{
			List<SelectListItem> jsonData = _vehicleService.GetOwnVehicleSelectListItem(model.UserId);
			return Json(jsonData);
		}

		/// <summary>
		/// 共用貨主車主車輛下拉選單
		/// </summary>
		/// <param name="CompanyId"></param>
		public void CommonGoodsOwnerDriverVehicleDropdownList(int CompanyId)
		{
			List<int> goodOwnerLevels = new List<int>();
			goodOwnerLevels.Add((int)MemberLevelEnum.GoodsOwner);
			ViewBag.GoodOwnerList = _aspNetUsersService.GetUserSelectListItem(goodOwnerLevels, null, null);

			List<SelectListItem> driverSelectListItem = new List<SelectListItem>();

			//限制只能為自己的公司
			var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
			driverSelectListItem.Add(new SelectListItem { Text = "不選擇", Value = " " });
			var userSelectListItems = _aspNetUsersService.GetUserSelectListItemByRole(user.CompanyId, null, RoleNameEnum.CarOwner.ToString());
			driverSelectListItem.AddRange(userSelectListItems);
			ViewBag.DriverList = driverSelectListItem;

			List<SelectListItem> vehicleLicenseNumberSelectListItem = new List<SelectListItem>();
			vehicleLicenseNumberSelectListItem.Add(new SelectListItem { Text = "不選擇", Value = " " });
			vehicleLicenseNumberSelectListItem.AddRange(_vehicleService.GetVehicleBy(CompanyId));
			ViewBag.VehicleLicenseNumberList = vehicleLicenseNumberSelectListItem;

			ViewBag.CustomerList = _customerService.GetCustomerSelectListItem(user.CompanyId);
		}

		/// <summary>
		/// 刪除照片
		/// </summary>
		/// <param name="model"></param>
		/// <returns></returns>
		public async Task<JsonResult> DeletePhoto(BookingGoodsPhotoContainer model)
		{
			_logger.Information($"DeletePhoto model : { JsonConvert.SerializeObject(model)}");
			ResponseViewModel result = new ResponseViewModel();
			try
			{
				result = await _bookingService.DeleteBookingGoodsPhoto(model.Id);
				if (result.IsOk)
				{
					#region 從Server路徑刪除實體照片
					string externalDirectory = ConfigurationManager.AppSettings["UploadGoodsImagePath"];
					string externalPathString = Path.Combine(externalDirectory.ToString());
					string findExternalFileName = externalPathString + model.GoodOwnerId + "\\" + model.MessageId + "\\" + model.PhotoFileName;
					bool isExistExternalFile = System.IO.File.Exists(findExternalFileName);
					if (isExistExternalFile)
						System.IO.File.Delete(findExternalFileName);
					#endregion
				}
			}
			catch (Exception ex)
			{
				_logger.Information($"DeletePhoto error : { JsonConvert.SerializeObject(ex)}");
				throw ex;
			}
			return Json(result, JsonRequestBehavior.DenyGet);
		}
		#endregion

		#region fileupload function
		/// <summary>
		/// 檔案上傳格式驗證
		/// </summary>
		/// <param name="file"></param>
		/// <returns></returns>
		public bool FileUploadVerify(HttpPostedFileBase file)
		{
			//可上傳的檔案類型
			string[] imgTypes =
			{
				"image/jpg",
				"image/jpeg",
				"image/pjpeg",
				"image/gif",
				"image/x-png",
				"image/png",
				"image/bmp",
				"Application/Octet-Stream"
			};

			if (file != null && file.ContentLength > 0 && imgTypes.Contains(file.ContentType))
				return true;

			return false;
		}

		/// <summary>
		/// 上傳影像檔案與寫進貨物照片之DB操作
		/// </summary>
		/// <param name="file"></param>
		/// <param name="UserId"></param>
		/// <param name="MessageID"></param>
		/// <param name="Count"></param>
		/// <returns></returns>
		public async Task<VerityResult> UploadImageFile(HttpPostedFileBase file, string UserId, string MessageID, int Count)
		{
			VerityResult verityResult = new VerityResult();

			BookingGoodsPhotoViewModel goodsPhoto = new BookingGoodsPhotoViewModel();

			string filePath = string.Empty;
			string fileDirectory = ConfigurationManager.AppSettings["UploadGoodsImagePath"] + UserId + "\\" + MessageID;

			if (!Directory.Exists(fileDirectory))
				Directory.CreateDirectory(fileDirectory);

			string extension = Path.GetExtension(file.FileName);
			string customFileName = DateTime.Now.ToString("yyyyMMddHHmmss") + "_" + Count + extension;
			filePath = fileDirectory + "/" + customFileName;
			ReSizeImage.SaveThumb(800, 600, file.InputStream, filePath);

			goodsPhoto.MessageId = MessageID;
			goodsPhoto.PhotoFileName = customFileName;
			verityResult = await _bookingService.CreateOrUpdateBookingGoodsPhoto(goodsPhoto);

			return verityResult;
		}
		#endregion

		#region 推播
		/// <summary>
		/// 非同步執行推播API
		/// </summary>
		/// <param name="PushMsg"></param>
		/// <returns></returns>
		public async Task<Uri> RunPushApiAsync(PushMessageViewModel PushMsg)
		{
			_logger.Information("RunPushApiAsync model: " + JsonConvert.SerializeObject(PushMsg));

			HttpClient httpClient = new HttpClient();

			httpClient.BaseAddress = new Uri(PushAPIUrl);
			httpClient.DefaultRequestHeaders.Accept.Clear();
			httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

			try
			{
				#region 新增手機推播訊息紀錄
				VerityResult result = new VerityResult();
				PhonePushMessageLog log = new PhonePushMessageLog();
				log.MessageId = PushMsg.messageid;
				log.PushTime = BsonDateTime.Create(DateTime.Now);
				log.Title = PushMsg.title;
				log.Body = PushMsg.body;
				log.SenderId = PushMsg.senderid;
				log.ReaderId = PushMsg.readerid;
				log.KeyNumber = PushMsg.KeyNumber;
				log.MobileType = PushMsg.MobileType;
				log.Category = PushMsg.category;
				log.IsRead = false;
				log.IsDelete = false;

				result = await _phonePushMessageService.Create(log);
				#endregion

				HttpResponseMessage response = await httpClient.PostAsJsonAsync(
					"api/Push/PushNoticeMessage", PushMsg);
				response.EnsureSuccessStatusCode();

				// return URI of the created resource.
				return response.Headers.Location;
			}
			catch (Exception ex)
			{
				_logger.Information("RunPushApiAsync model: " + JsonConvert.SerializeObject(ex));
				throw ex;
			}
		}

		/// <summary>
		/// 填充推播API ViewModel
		/// </summary>
		/// <param name="Title"></param>
		/// <param name="Body"></param>
		/// <param name="SenderId"></param>
		/// <param name="ReaderId"></param>
		/// <param name="Category"></param>
		/// <param name="MessageId"></param>
		/// <returns></returns>
		public PushMessageViewModel RunPushApi(
			string Title,
			string Body,
			string SenderId,
			string ReaderId,
			int Category,
			string MessageId
			)
		{
			PushMessageViewModel pushMsg = new PushMessageViewModel();
			pushMsg.title = Title;
			pushMsg.body = Body;

			var queryMobilePushKey = _mobilePushKeyService.GetByUserID(ReaderId);
			if (queryMobilePushKey != null)
			{
				pushMsg.KeyNumber = queryMobilePushKey.KeyNumber;
				pushMsg.MobileType = queryMobilePushKey.MobileType.Trim();
			}

			pushMsg.category = Category;
			pushMsg.messageid = MessageId;
			pushMsg.senderid = SenderId;
			pushMsg.readerid = ReaderId;
			pushMsg.pushtime = DateTime.UtcNow;

			return pushMsg;
		}
		#endregion
	}
}