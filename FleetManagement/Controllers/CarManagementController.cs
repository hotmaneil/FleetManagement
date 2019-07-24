using Newtonsoft.Json;
using Serilog;
using System;
using System.Collections.Generic;
using System.Net;
using System.Web.Mvc;
using Utility.Extensions;
using Services.Interface;
using Services.Service;
using ViewModel.Share;
using ViewModel.Vehicle;

namespace FleetManagement.Controllers
{
	/// <summary>
	/// 車輛管理功能
	/// </summary>
	public class CarManagementController : BaseController
	{
		private ILogger _logger = Log.Logger;

		readonly IVehicleService _vehicleService;
		readonly ICompanyService _companyService;
		readonly ICodeDetailService _codeDetailService;
		readonly ICompanyGroupService _companyGroupService;
		readonly IAspNetUsersService _aspNetUsersService;

		public CarManagementController()
		{
			_vehicleService = new VehicleService();
			_companyService = new CompanyService();
			_codeDetailService = new CodeDetailService();
			_companyGroupService = new CompanyGroupService();
			_aspNetUsersService = new AspNetUsersService();
		}

		#region Session
		/// <summary>
		/// 車輛搜尋 ViewModel Session Property
		/// </summary>
		private VehicleSearchViewModel _sessionVehicleSearchViewModel;

		/// <summary>
		/// 車輛 Session
		/// </summary>
		public VehicleSearchViewModel SessionVehicleSearchViewModel
		{
			get
			{
				var sessionSearchModel = Session.GetDataFromSession<VehicleSearchViewModel>("sessionVehicleSearchViewModel");
				if (sessionSearchModel == null)
				{
					VehicleSearchViewModel _sessionNewSearchModel = new VehicleSearchViewModel();
					return _sessionNewSearchModel;
				}
				else
				{
					_sessionVehicleSearchViewModel = sessionSearchModel;
					return _sessionVehicleSearchViewModel;
				}
			}

			set
			{
				if (_sessionVehicleSearchViewModel != value)
				{
					_sessionVehicleSearchViewModel = value;
					Session.SetDataToSession<VehicleSearchViewModel>("sessionVehicleSearchViewModel", _sessionVehicleSearchViewModel);
				}
			}
		}
		#endregion

		/// <summary>
		/// 車輛管理頁面
		/// </summary>
		/// <returns></returns>
		public ActionResult Index()
		{
			if (!User.Identity.IsAuthenticated)
			{
				return RedirectToAction("Login", "Account");
			}

			CommonDropDownList(null);
			return View(SessionVehicleSearchViewModel);
		}

		/// <summary>
		/// 新增頁面
		/// </summary>
		/// <returns></returns>
		public ActionResult Create()
		{
			VehicleViewModel viewModel = new VehicleViewModel();
			CommonDropDownList(null);
			return View(viewModel);
		}

		/// <summary>
		/// 傳回車輛管理 List JsonResult
		/// </summary>
		/// <param name="SearchViewModel"></param>
		/// <returns></returns>
		[LogActionFilter]
		public JsonResult GetVehicleList(VehicleSearchViewModel SearchViewModel)
		{
			if (SessionVehicleSearchViewModel != null)
			{
				if (SearchViewModel != SessionVehicleSearchViewModel)
					SessionVehicleSearchViewModel = SearchViewModel;
				else
					SearchViewModel = SessionVehicleSearchViewModel;
			}

			ResponseViewModel result = new ResponseViewModel();
			try
			{
				//限制只能為自己的公司
				var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
				SearchViewModel.SearchCompanyId = user.CompanyId;
				result.Data = _vehicleService.GetVehicles(SearchViewModel);
				result.IsOk = true;
				result.HttpStatusCode = HttpStatusCode.OK;
			}
			catch (Exception ex)
			{
				result.IsOk = false;
				result.Exception = ex;
				result.HttpStatusCode = HttpStatusCode.InternalServerError;
				result.Data = new List<VehicleListViewModel>();
			}
			result.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			return Json(result, JsonRequestBehavior.DenyGet);
		}

		/// <summary>
		/// 儲存
		/// </summary>
		/// <param name="model"></param>
		/// <returns></returns>
		[LogActionFilter]
		public ActionResult Save(VehicleViewModel model)
		{
			if (ModelState.IsValid)
			{
				if (!User.Identity.IsAuthenticated)
				{
					return RedirectToAction("Login", "Account");
				}

				_logger.Information($"Save VehicleViewModel model : { JsonConvert.SerializeObject(model)}");
				ResponseViewModel result = new ResponseViewModel();

				try
				{
					var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
					model.AspNetUserId = user.Id;
					result = _vehicleService.SaveVehicle(model);

					if (result.IsOk)
					{
						TempData["SaveResult"] = result.Message;
						return RedirectToAction("Index");
					}
					else
						TempData["SaveResult"] = result.Message;
				}
				catch (Exception ex)
				{
					_logger.Information($"Save VehicleViewModel error : { JsonConvert.SerializeObject(ex)}");
					throw ex;
				}
			}

			CommonDropDownList(model.CompanyIds);
			return View("Create", model);
		}

		/// <summary>
		/// 編輯車輛
		/// </summary>
		/// <param name="VehicleId"></param>
		/// <returns></returns>
		[LogActionFilter]
		public ActionResult Edit(int? VehicleId)
		{
			VehicleViewModel viewModel = null;
			if (VehicleId.HasValue && VehicleId.Value > 0)
			{
				try
				{
					viewModel = _vehicleService.GetVehicle(VehicleId.Value);
				}
				catch (Exception ex)
				{
					throw ex;
				}
			}

			if (null == viewModel)
			{
				return RedirectToAction("Index");
			}
			CommonDropDownList(viewModel.CompanyIds);
			return View("Create", viewModel);
		}
		
		/// <summary>
		/// 根據選取公司Id集合變更下拉選單List
		/// </summary>
		/// <param name="CompanyIds"></param>
		/// <returns></returns>
		[HttpPost]
		public JsonResult CompanyChangeGroupList(List<int> CompanyIds,int ? VehicleId)
		{
			List<SelectListItem> jsonData = _companyGroupService.GetCompanyGroupSelectListItem(CompanyIds, VehicleId);
			return Json(jsonData);
		}

		/// <summary>
		/// 共用下拉選單
		/// </summary>
		private void CommonDropDownList(List<int> CompnayIds)
		{
			ViewBag.CompanyList = GetCompanySelectListItemByRole("不選擇");
			ViewBag.CompanyGroupList = _companyGroupService.GetCompanyGroupSelectListItem(CompnayIds);
			ViewBag.LoadWeightList = _codeDetailService.GetItemByTypeCode("LoadWeight");

			List<SelectListItem> VehicleModelSelectListItem = new List<SelectListItem>();
			VehicleModelSelectListItem.Add(new SelectListItem { Text = "不選擇", Value = "0" });
			VehicleModelSelectListItem.AddRange(_codeDetailService.GetItemByTypeCode("VehicleModel"));
			ViewBag.VehicleModelList = VehicleModelSelectListItem;

			ViewBag.LoadConditionList = _codeDetailService.GetItemByTypeCode("LoadCondition");
		}
	}
}