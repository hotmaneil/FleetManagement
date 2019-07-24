using Newtonsoft.Json;
using Serilog;
using Services.Interface;
using Services.Service;
using System;
using System.Collections.Generic;
using System.Net;
using System.Web.Mvc;
using ViewModel.Company;
using ViewModel.Share;

namespace FleetManagement.Controllers
{
	public class BrandManagementController : Controller
    {
		private ILogger _logger = Log.Logger;

		readonly IAspNetUsersService _aspNetUsersService;
		readonly IUserVehiclesService _userVehiclesService;
		readonly IVehicleService _vehicleService;
		readonly ICompanyService _companyService;
		readonly ICompanyGroupService _companyGroupService;
		readonly ICompanyGroupsVehiclesService _companyGroupsVehiclesService;

		public BrandManagementController()
		{
			_aspNetUsersService = new AspNetUsersService();
			_userVehiclesService = new UserVehiclesService();
			_vehicleService = new VehicleService();
			_companyService = new CompanyService();
			_companyGroupService = new CompanyGroupService();
			_companyGroupsVehiclesService = new CompanyGroupsVehiclesService();
		}

		// GET: BrandManagement
		public ActionResult Index()
        {
            return View();
        }

		/// <summary>
		/// 編輯公司司機車輛 頁面
		/// </summary>
		/// <param name="DriverId"></param>
		/// <returns></returns>
		[LogActionFilter]
		public ActionResult EditCompanyDriverVehicles(int CompanyId, string DriverId, string Control)
		{
			CompanyDriverVehicleViewModel viewModel = new CompanyDriverVehicleViewModel();
			viewModel = SetCompanyDriverVehicleViewModel(CompanyId, DriverId);
			Session["Control"] = Control;
			return View(viewModel);
		}

		/// <summary>
		/// 編輯公司司機車輛
		/// </summary>
		/// <param name="model"></param>
		/// <param name="sourceUserVehicleList"></param>
		/// <returns></returns>
		[LogActionFilter]
		[HttpPost]
		public ActionResult UpdateDriverVehicles(CompanyDriverVehicleViewModel model, List<int> sourceUserVehicleList)
		{
			_logger.Information($"UpdateDriverVehicles model : { JsonConvert.SerializeObject(model)}");

			ResponseViewModel result = new ResponseViewModel();

			try
			{
				model.VehicleIds = sourceUserVehicleList;
				result = _userVehiclesService.UpdateUserVehicles(model);
			}
			catch (Exception ex)
			{
				_logger.Information($"UpdateDriverVehicles exception : { JsonConvert.SerializeObject(result)}");
				throw ex;
			}

			result.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			_logger.Information($"UpdatetGroupVehicles_Result : { JsonConvert.SerializeObject(result)}");

			CompanyDriverVehicleViewModel viewModel = new CompanyDriverVehicleViewModel();
			viewModel = SetCompanyDriverVehicleViewModel(model.CompanyId, model.DriverId);
			viewModel.SaveResult = result.IsOk;
			return View("EditCompanyDriverVehicles", viewModel);
		}

		/// <summary>
		/// 公司司機車輛 給值
		/// </summary>
		/// <param name="CompanyId"></param>
		/// <param name="DriverId"></param>
		/// <returns></returns>
		private CompanyDriverVehicleViewModel SetCompanyDriverVehicleViewModel(int CompanyId, string DriverId)
		{
			CompanyDriverVehicleViewModel viewModel = new CompanyDriverVehicleViewModel();

			List<SelectListItem> selectListItems = new List<SelectListItem>();
			viewModel.CompanyId = CompanyId;
			viewModel.DriverId = DriverId;
			viewModel.DriverName = _aspNetUsersService.QueryUsersByID(DriverId).RealName;
			selectListItems = _userVehiclesService.GetCompanyDriverVehicle(DriverId);
			viewModel.CompanyDriverVehicleSelectListItemList = selectListItems;
			ViewBag.VehicleList = _vehicleService.GetVehicleBy(CompanyId);

			return viewModel;
		}

		/// <summary>
		/// 公司群組頁
		/// </summary>
		/// <param name="CompanyId"></param>
		/// <returns></returns>

		public ActionResult CompanyGroup(int CompanyId)
		{
			CompanyGroupCollection collection = new CompanyGroupCollection();

			try
			{
				collection.Company = _companyService.GetCompanyDetail(CompanyId);
				collection.CompanyGroupList = _companyGroupService.GetGroupByCompany(CompanyId);
			}
			catch (Exception ex)
			{
				throw ex;
			}
			return View(collection);
		}

		/// <summary>
		/// 新增公司群組
		/// </summary>
		/// <param name="item"></param>
		/// <returns></returns>
		[LogActionFilter]
		[HttpPost]
		public JsonResult CreateCompanyGroup(CreateCompanyGroupModel item)
		{
			ResponseViewModel result = new ResponseViewModel();
			result.IsOk = true;
			try
			{
				_companyGroupService.CreateCompanyGroup(item);
				result.IsOk = true;
				result.Message = string.Format("Success");
				result.HttpStatusCode = HttpStatusCode.OK;
				_logger.Information($"CompanyGroup_Create_Success : { result.Message}");
				result.Data = item;
			}
			catch (Exception ex)
			{
				result.IsOk = false;
				result.Exception = ex;
				result.Message = string.Format("False");
				result.HttpStatusCode = HttpStatusCode.InternalServerError;
				result.Data = item;
			}
			result.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			_logger.Information($"CompanyGroup_Create_Success : { JsonConvert.SerializeObject(result)}");
			return Json(result, JsonRequestBehavior.DenyGet);
		}

		/// <summary>
		/// 修改公司群組
		/// </summary>
		/// <param name="item"></param>
		/// <returns></returns>
		[LogActionFilter]
		[HttpPost]
		public JsonResult UpdateCompanyGroup(CompanyGroupViewModel item)
		{
			ResponseViewModel result = new ResponseViewModel();
			result.IsOk = true;
			try
			{
				if (_companyGroupService.UpdateCompanyGroup(item))
				{
					result.IsOk = true;
					result.Message = string.Format("Success");
					result.HttpStatusCode = HttpStatusCode.OK;
					_logger.Information($"CompanyGroup_Update_Success : { result.Message}");
					result.Data = item;
				}
				else
				{
					result.IsOk = false;
					result.Message = string.Format("GroupId找不到對應物件");
					result.HttpStatusCode = HttpStatusCode.InternalServerError;
					_logger.Information($"CompanyGroup_Update_Success : { result.Message}");
					result.Data = item;
				}
			}
			catch (Exception ex)
			{
				result.IsOk = false;
				result.Exception = ex;
				result.Message = string.Format("False");
				result.HttpStatusCode = HttpStatusCode.InternalServerError;
				result.Data = item;
			}
			result.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			_logger.Information($"CompanyGroup_Update_Success : { JsonConvert.SerializeObject(result)}");
			return Json(result, JsonRequestBehavior.DenyGet);
		}

		/// <summary>
		/// 刪除公司群組
		/// </summary>
		/// <param name="item"></param>
		/// <returns></returns>
		[LogActionFilter]
		[HttpPost]
		public JsonResult DeleteCompanyGroup(int companyGroupId)
		{
			ResponseViewModel result = new ResponseViewModel();
			result.IsOk = true;
			try
			{
				if (_companyGroupService.DeleteCompanyGroup(companyGroupId))
				{
					result.IsOk = true;
					result.Message = string.Format("Success");
					result.HttpStatusCode = HttpStatusCode.OK;
					_logger.Information($"CompanyGroup_Delete_Success : { result.Message}");
					result.Data = companyGroupId;
				}
				else
				{
					result.IsOk = false;
					result.Message = string.Format("GroupId找不到對應物件");
					result.HttpStatusCode = HttpStatusCode.InternalServerError;
					_logger.Information($"CompanyGroup_Delete_Success : { result.Message}");
					result.Data = companyGroupId;
				}
			}
			catch (Exception ex)
			{
				result.IsOk = false;
				result.Exception = ex;
				result.Message = string.Format("False");
				result.HttpStatusCode = HttpStatusCode.InternalServerError;
				result.Data = companyGroupId;
			}
			result.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			_logger.Information($"CompanyGroup_Delete_Success : { JsonConvert.SerializeObject(result)}");
			return Json(result, JsonRequestBehavior.DenyGet);
		}

		/// <summary>
		/// 依照群組(車隊)編輯車輛頁面
		/// </summary>
		/// <param name="GroupId"></param>
		/// <returns></returns>
		[LogActionFilter]
		public ActionResult EditGroupVehicle(int CompanyId, int GroupId, string Control)
		{
			GroupVehiclesViewModel viewModel = new GroupVehiclesViewModel();
			viewModel = SetGroupVehiclesViewModel(CompanyId, GroupId);
			Session["Control"] = Control;
			return View(viewModel);
		}

		/// <summary>
		/// GroupVehiclesViewModel 給值
		/// </summary>
		/// <param name="CompanyId"></param>
		/// <param name="GroupId"></param>
		/// <returns></returns>
		private GroupVehiclesViewModel SetGroupVehiclesViewModel(int CompanyId, int GroupId)
		{
			GroupVehiclesViewModel viewModel = new GroupVehiclesViewModel();
			List<SelectListItem> selectListItems = new List<SelectListItem>();
			viewModel.CompanyId = CompanyId;
			viewModel.CompanyName = _companyService.GetCompanyName(CompanyId);
			viewModel.GroupId = GroupId;
			viewModel.GroupName = _companyGroupService.GetCompanyGroupName(GroupId);
			selectListItems = _companyGroupsVehiclesService.GetVehicleByCompanyGroup(CompanyId, GroupId);
			viewModel.GroupVehicleSelectListItemList = selectListItems;
			ViewBag.VehicleList = _vehicleService.GetVehicleBy(CompanyId);

			return viewModel;
		}

		/// <summary>
		/// 更新車隊車輛
		/// </summary>
		/// <param name="model"></param>
		/// <returns></returns>
		[LogActionFilter]
		[HttpPost]
		public ActionResult UpdatetGroupVehicles(GroupVehiclesViewModel model, List<int> sourceUserVehicleList)
		{
			_logger.Information($"UpdatetGroupVehicles model : { JsonConvert.SerializeObject(model)}");
			ResponseViewModel result = new ResponseViewModel();

			try
			{
				AssignVehicleForGroupModel updateModel = new AssignVehicleForGroupModel();
				updateModel.CompanyId = model.CompanyId;
				updateModel.GroupId = model.GroupId;
				updateModel.VehicleIds = sourceUserVehicleList;
				_companyGroupsVehiclesService.AssignVehicleForGroup(updateModel);
				result.IsOk = true;
			}
			catch (Exception ex)
			{
				result.IsOk = false;
				result.Exception = ex;
				_logger.Information($"UpdatetGroupVehicles exception: { JsonConvert.SerializeObject(ex)}");
				throw ex;
			}

			result.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			_logger.Information($"UpdatetGroupVehicles_Result : { JsonConvert.SerializeObject(result)}");

			GroupVehiclesViewModel viewModel = SetGroupVehiclesViewModel(model.CompanyId, model.GroupId);
			viewModel.SaveResult = result.IsOk;
			return View("EditGroupVehicle", viewModel);
		}
	}
}