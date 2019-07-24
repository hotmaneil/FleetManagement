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
using ViewModel.Enum;
using ViewModel.Share;
using ViewModel.VehicleSchedules;

namespace FleetManagement.Controllers
{
	/// <summary>
	/// 路線管理 控制器
	/// </summary>
	public class VehicleSchedulesController : Controller
    {
		private ILogger _logger = Log.Logger;
		readonly IVehicleScheduleService _vehicleScheduleService;
		readonly IAspNetUsersService _aspNetUsersService;
		readonly ICodeDetailService _codeDetailService;
		readonly IVehicleService _vehicleService;

		public VehicleSchedulesController()
		{
			_vehicleScheduleService = new VehicleScheduleService();
			_aspNetUsersService = new AspNetUsersService();
			_codeDetailService = new CodeDetailService();
			_vehicleService = new VehicleService();
		}

		#region Session
		/// <summary>
		/// 路線管理搜尋 ViewModel Session Property
		/// </summary>
		private VehicleSchedulesSearchViewModel _sessionVehicleSchedulesSearchModel;

		/// <summary>
		/// 路線管理 Session
		/// </summary>
		public VehicleSchedulesSearchViewModel SessionVehicleSchedulesSearchModel
		{
			get
			{
				var sessionSearchModel = Session.GetDataFromSession<VehicleSchedulesSearchViewModel>("sessionVehicleSchedulesSearchModel");
				if (sessionSearchModel == null)
				{
					VehicleSchedulesSearchViewModel _sessionNewSearchModel = new VehicleSchedulesSearchViewModel();
					return _sessionNewSearchModel;
				}
				else
				{
					_sessionVehicleSchedulesSearchModel = sessionSearchModel;
					return _sessionVehicleSchedulesSearchModel;
				}
			}

			set
			{
				if (_sessionVehicleSchedulesSearchModel != value)
				{
					_sessionVehicleSchedulesSearchModel = value;
					Session.SetDataToSession<VehicleSchedulesSearchViewModel>("sessionVehicleSchedulesSearchModel", _sessionVehicleSchedulesSearchModel);
				}
			}
		}
		#endregion

		/// <summary>
		/// 路線管理首頁
		/// </summary>
		/// <returns></returns>
		public ActionResult Index()
        {
			return View(SessionVehicleSchedulesSearchModel);
        }

		/// <summary>
		/// 取得路線管理之司機 列表
		/// </summary>
		/// <param name="SearchViewModel"></param>
		/// <returns></returns>
		[LogActionFilter]
		[HttpPost]
		public JsonResult GetDriverList(VehicleSchedulesSearchViewModel SearchViewModel)
		{
			if (SessionVehicleSchedulesSearchModel != null)
			{
				if (SearchViewModel != SessionVehicleSchedulesSearchModel)
					SessionVehicleSchedulesSearchModel = SearchViewModel;
				else
					SearchViewModel = SessionVehicleSchedulesSearchModel;
			}

			ResponseViewModel result = new ResponseViewModel();

			try
			{
				//限制只能為公司
				var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
				SearchViewModel.SearchCompanyId = user.CompanyId;

				result.Data = _vehicleScheduleService.GetDriverList(SearchViewModel);
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
		/// 取得 司機自己的路線管理 列表
		/// </summary>
		/// <param name="SearchViewModel"></param>
		/// <returns></returns>
		[LogActionFilter]
		[HttpPost]
		public JsonResult GetVehicleScheduleList(VehicleSchedulesDriverSearchViewModel SearchViewModel)
		{
			ResponseViewModel result = new ResponseViewModel();

			try
			{
				result.Data = _vehicleScheduleService.GetVehicleSchedulesList(SearchViewModel);
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
		/// 查看個人路線管理
		/// </summary>
		/// <returns></returns>
		[LogActionFilter]
		public ActionResult ViewMySchedules(string DriverId)
		{
			//限制只能為公司
			var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
			CommonDropDownList(user.CompanyId, DriverId);
			ViewBag.DriverId = DriverId;
			ViewBag.DriverName = _aspNetUsersService.QueryUsersByID(DriverId).RealName;
			return View();
		}

		/// <summary>
		/// 新增頁面
		/// </summary>
		/// <returns></returns>
		public ActionResult Create(string ClickFrom, string DriverId)
		{
			VehicleScheduleViewModel model = new VehicleScheduleViewModel();
			model.DriverId = DriverId;

			//限制只能為公司
			var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
			TempData["ClickFrom"] = ClickFrom;

			if (ClickFrom == "index")
				CommonDropDownList(user.CompanyId, null);
			else if (ClickFrom == "viewMySchedules")
				CommonDropDownList(user.CompanyId, DriverId);

			return View(model);
		}

		/// <summary>
		/// 編輯頁面
		/// </summary>
		/// <returns></returns>
		public ActionResult Edit(int Id)
		{
			VehicleScheduleIdModel findModel = new VehicleScheduleIdModel();
			findModel.Id = Id;

			VehicleScheduleViewModel data = _vehicleScheduleService.GetVehicleSchedule(findModel);

			//限制只能為公司
			var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
			CommonDropDownList(user.CompanyId, data.DriverId);
			TempData["ClickFrom"] = "viewMySchedules";

			return View("Create", data);
		}

		/// <summary>
		/// 資料儲存
		/// </summary>
		/// <param name="model"></param>
		/// <returns></returns>
		[LogActionFilter]
		public async Task<ActionResult> Save(VehicleScheduleViewModel model)
		{
			ResponseViewModel result = new ResponseViewModel();
			var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);

			try
			{
				result = await _vehicleScheduleService.CreateOrUpdateVehicleSchedule(model, user.Id);

				if (result.IsOk)
				{
					TempData["SaveResult"] = result.Message;
					return RedirectToAction("ViewMySchedules", new { model.DriverId });
					//return RedirectToAction("Index");
				}
				else
					TempData["SaveResult"] = result.Message;
			}
			catch (Exception ex)
			{
				TempData["SaveResult"] = result.Message;
				_logger.Information($"Save VehicleScheduleViewModel  error : { JsonConvert.SerializeObject(ex)}");
				throw ex;
			}

			CommonDropDownList(user.CompanyId, model.DriverId);
			return View("Create",model);
		}

		/// <summary>
		/// 刪除路線
		/// </summary>
		/// <param name="Id"></param>
		/// <returns></returns>
		[LogActionFilter]
		[HttpPost]
		public async Task<JsonResult> DeleteVehicleSchedule(int Id)
		{
			ResponseViewModel result = new ResponseViewModel();

			try
			{
				VehicleScheduleIdModel deleteModel = new VehicleScheduleIdModel();
				deleteModel.Id = Id;
				result =await _vehicleScheduleService.DeleteVehicleSchedule(deleteModel);
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
		/// 共用下拉選單List
		/// </summary>
		private void CommonDropDownList(int CompanyId, string DriverId)
		{
			List<SelectListItem> areaSelectListItem = new List<SelectListItem>();
			areaSelectListItem.Add(new SelectListItem { Text = "請選擇", Value = " " });
			areaSelectListItem.AddRange(_codeDetailService.GetItemByTypeCode("PostalCode"));
			ViewBag.SelectAreaList = areaSelectListItem;

			List<SelectListItem> driverSelectListItem = new List<SelectListItem>();
			driverSelectListItem.Add(new SelectListItem { Text = "請選擇", Value = " " });

			//限制只能為公司報價的
			var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
			List<int> driverLevels = new List<int>();
			driverLevels.Add((int)MemberLevelEnum.DriverLevel1);
			driverLevels.Add((int)MemberLevelEnum.DriverLevel2);
			driverLevels.Add((int)MemberLevelEnum.DriverLevel3);
			driverLevels.Add((int)MemberLevelEnum.DriverLevel4);
			var driverList = _aspNetUsersService.GetUserSelectListItem(driverLevels, user.CompanyId, DriverId);
			driverSelectListItem.AddRange(driverList);
			ViewBag.SelectDriverList = driverSelectListItem;

			List<SelectListItem> vehicleLicenseNumberSelectListItem = new List<SelectListItem>();
			vehicleLicenseNumberSelectListItem.Add(new SelectListItem { Text = "請選擇", Value = " " });
			vehicleLicenseNumberSelectListItem.AddRange(_vehicleService.GetOwnVehicleSelectListItem(DriverId));
			ViewBag.VehicleLicenseNumberList = vehicleLicenseNumberSelectListItem;
		}
	}
}