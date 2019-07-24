using FleetManagement.Models;
using Microsoft.AspNet.Identity;
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
using ViewModel.Share;
using ViewModel.User;

namespace FleetManagement.Controllers
{
	/// <summary>
	/// 帳號管理功能(註冊使用者)
	/// </summary>
	public class WebAccountController : BaseController
    {
		private ILogger _logger = Log.Logger;

		private AuthRepository _repository;

		readonly ICodeDetailService _codeDetailService;
		readonly IAspNetUsersService _aspNetUsersService;
		readonly IAspNetRolesService _aspNetRolesService;

		public WebAccountController()
		{
			_repository = new AuthRepository();

			_codeDetailService = new CodeDetailService();
			_aspNetUsersService = new AspNetUsersService();
			_aspNetRolesService = new AspNetRolesService();
		}

		#region Session
		/// <summary>
		/// 帳號搜尋 ViewModel Session Property
		/// </summary>
		private AccountSearchViewModel _sessionAccountSearchViewModel;

		/// <summary>
		/// 帳號 Session
		/// </summary>
		public AccountSearchViewModel SessionAccountSearchViewModel
		{
			get
			{
				var sessionSearchModel = Session.GetDataFromSession<AccountSearchViewModel>("sessionAccountSearchViewModel");
				if (sessionSearchModel == null)
				{
					AccountSearchViewModel _sessionNewSearchModel = new AccountSearchViewModel();
					return _sessionNewSearchModel;
				}
				else
				{
					_sessionAccountSearchViewModel = sessionSearchModel;
					return _sessionAccountSearchViewModel;
				}
			}

			set
			{
				if (_sessionAccountSearchViewModel != value)
				{
					_sessionAccountSearchViewModel = value;
					Session.SetDataToSession<AccountSearchViewModel>("sessionAccountSearchViewModel", _sessionAccountSearchViewModel);
				}
			}
		}
		#endregion

		/// <summary>
		/// 帳號管理首頁
		/// </summary>
		/// <returns></returns>
		public ActionResult Index()
        {
			if (!User.Identity.IsAuthenticated)
			{
				return RedirectToAction("Index", "Home");
			}

			CommonDropDownList(true);
			return View(SessionAccountSearchViewModel);
		}

		/// <summary>
		/// 傳回帳號管理List JsonResult
		/// </summary>
		/// <param name="SearchViewModel"></param>
		/// <returns></returns>
		[LogActionFilter]
		public JsonResult GetAccountManageList(AccountSearchViewModel SearchViewModel)
		{
			if (SessionAccountSearchViewModel != null)
			{
				if (SearchViewModel != SessionAccountSearchViewModel)
					SessionAccountSearchViewModel = SearchViewModel;
				else
					SearchViewModel = SessionAccountSearchViewModel;
			}

			ResponseViewModel result = new ResponseViewModel();
			if (User.Identity.IsAuthenticated)
			{
				try
				{
					var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
					result.Data = _aspNetUsersService.GetAccountManageList(SearchViewModel, user);
					result.IsOk = true;
					result.Message = string.Format("Success");
					result.HttpStatusCode = HttpStatusCode.OK;
					_logger.Information($"GetAccountManageList_Success : { result.Message}");
				}
				catch (Exception ex)
				{
					result.IsOk = false;
					result.Exception = ex;
					result.Message = string.Format("False");
					result.HttpStatusCode = HttpStatusCode.InternalServerError;
					result.Data = new List<AccountManageViewModel>();

					_logger.Information($"GetAccountManageList_Exception : { JsonConvert.SerializeObject(result)}");
				}
			}
			else
			{
				result.IsOk = false;
				result.Message = MessageResource.Unauthorized;
				result.HttpStatusCode = HttpStatusCode.Unauthorized;
			}
			result.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			return Json(result, JsonRequestBehavior.DenyGet);
		}

		/// <summary>
		/// 編輯帳號與查看明細
		/// </summary>
		/// <param name="UserId"></param>
		/// <returns></returns>
		[LogActionFilter]
		public ActionResult EditAccount(string UserId)
		{
			UserModel data = new UserModel();
			data = _aspNetUsersService.GetUserModel(UserId);
			CommonDropDownList(false);
			return View(data);
		}

		/// <summary>
		/// 儲存更新帳號
		/// </summary>
		/// <param name="model"></param>
		/// <returns></returns>
		public async Task<ActionResult> Save(UserModel model)
		{
			_logger.Information($"UpdateAccount : { JsonConvert.SerializeObject(model)}");

			ResponseViewModel result = new ResponseViewModel();

			try
			{
				result = await _aspNetUsersService.UpdateUser(model);
				if (result.IsOk)
				{
					TempData["SaveResult"] = result;
					return RedirectToAction("Index");
				}
			}
			catch (Exception ex)
			{
				_logger.Information($"UpdateAccount exception: { JsonConvert.SerializeObject(ex)}");
				throw ex;
			}
			return RedirectToAction("EditAccount", model);
		}

		/// <summary>
		/// 新增帳號
		/// </summary>
		/// <param name="model"></param>
		/// <returns></returns>
		[LogActionFilter]
		[HttpPost]
		public async Task<JsonResult> CreateAccount(UserModel model)
		{
			_logger.Information($"CreateAccount : { JsonConvert.SerializeObject(model)}");

			ResponseViewModel responseResult = new ResponseViewModel();

			try
			{
				bool isExists = _aspNetUsersService.IsExistUserByUserName(model.PhoneNumber);
				if (isExists)
				{
					responseResult.IsOk = false;
					responseResult.Message = string.Format("{0} 手機號碼已註冊", model.PhoneNumber);
					responseResult.Data = model;
					responseResult.HttpStatusCode = HttpStatusCode.BadRequest;
					_logger.Information($"Company_Create_Success : { JsonConvert.SerializeObject(responseResult)}");
					return Json(responseResult, JsonRequestBehavior.DenyGet);
				}
				else
				{
					IdentityResult result = await _repository.RegisterUser(model);

					if (result.Succeeded)
					{
						responseResult.IsOk = true;
						responseResult.HttpStatusCode = HttpStatusCode.OK;
					}
					else
						responseResult.IsOk = false;
				}
			}
			catch (Exception ex)
			{
				_logger.Information($"CreateAccount exception: { JsonConvert.SerializeObject(ex)}");
				responseResult.IsOk = false;
				responseResult.Exception = ex;
				responseResult.HttpStatusCode = HttpStatusCode.InternalServerError;
				throw ex;
			}
			return Json(responseResult, JsonRequestBehavior.DenyGet);
		}

		/// <summary>
		/// 共用下拉選單List
		/// </summary>
		private void CommonDropDownList(bool IsAddPleaseSelect)
		{
			List<SelectListItem> AreaSelectListItem = new List<SelectListItem>();
			List<SelectListItem> RoleSelectListItem = new List<SelectListItem>();

			int? areaId = null;
			
			if (IsAddPleaseSelect)
			{
				if (!areaId.HasValue)
					AreaSelectListItem.Add(new SelectListItem { Text = "全部", Value = "NULL" });

				RoleSelectListItem.Add(new SelectListItem { Text = "全部", Value = " " });
			}

			AreaSelectListItem.AddRange(_codeDetailService.GetItemByTypeCode("Area"));

			var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
			var selectRoleList = _aspNetRolesService.GetRolesDescriptionList(null);
			RoleSelectListItem.AddRange(selectRoleList);
			ViewBag.SelectAreaList = AreaSelectListItem;
			ViewBag.SelectRoleList = RoleSelectListItem;

			List<SelectListItem> createAreaSelectListItem = new List<SelectListItem>();
			createAreaSelectListItem.Add(new SelectListItem { Text = "不選擇", Value = "NULL" });
			createAreaSelectListItem.AddRange(_codeDetailService.GetItemByTypeCode("Area"));

			ViewBag.AreaList = createAreaSelectListItem;
			ViewBag.RoleList = _aspNetRolesService.GetRolesDescriptionList("FleetManager");

			List<SelectListItem> companySelectListItem = new List<SelectListItem>();
			companySelectListItem = GetCompanySelectListItemByRole("不選擇");
			ViewBag.CompanyList = companySelectListItem;
		}
	}
}