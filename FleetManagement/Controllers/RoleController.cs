using Newtonsoft.Json;
using OracleDB.Models;
using OracleDB.Repositories;
using ResourceLibrary;
using Serilog;
using Services.Interface;
using Services.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web.Mvc;
using ViewModel.Enum;
using ViewModel.RoleModels;
using ViewModel.Share;
using ViewModel.WebFunctions;

namespace FleetManagement.Controllers
{
	/// <summary>
	/// 角色與權限管理
	/// </summary>
	public class RoleController : Controller
    {
		private ILogger _logger = Log.Logger;

		private IGenericRepository<AspNetRoles> _AspNetRoles;
		readonly IAspNetRolesService _roleService;
		readonly IWebFunctionsService _webFunctionService;
		readonly IRoleFunctionService _roleFunctionService;
		readonly IAspNetUsersService _aspNetUsersService;

		public RoleController()
		{
			_roleService = new AspNetRolesService();
			_webFunctionService = new WebFunctionsService();
			_roleFunctionService = new RoleFunctionService();
			_aspNetUsersService = new AspNetUsersService();
		}

		/// <summary>
		/// 角色與權限管理 首頁
		/// </summary>
		/// <returns></returns>
		public ActionResult Index()
        {
			if (!User.Identity.IsAuthenticated)
				return RedirectToAction("Login", "Account");

			return View();
        }

		/// <summary>
		/// 符合此權限的帳戶頁面
		/// </summary>
		/// <param name="roleid">角色編碼(RoleId)</param>
		/// <returns></returns>
		public ActionResult UseAccountResult(string roleid)
		{
			return PartialView("_UseAccountResult");
		}

		/// <summary>
		/// 角色與權限管理首頁 : 角色(資訊)列表
		/// </summary>
		/// <returns></returns>
		//[OutputCache(Duration = 600, VaryByParam ="*")]
		public async Task<JsonResult> RoleCounters()
		{
			ResponseViewModel res = new ResponseViewModel();
			if (!User.Identity.IsAuthenticated)
			{
				res.IsOk = false;
				res.Message = MessageResource.Unauthorized;
				res.HttpStatusCode = HttpStatusCode.Unauthorized;
			}
			else
			{
				try
				{
					var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
					IList<RolesCounterModel> cnts = await _roleService.RolesCounter(user.CompanyId);
					res.IsOk = true;
					res.Message = "";
					res.Data = cnts;
					res.HttpStatusCode = HttpStatusCode.OK;

					if (!(cnts.Count() > 0))
					{
						res.Data = new List<RolesCounterModel>();
						res.Message = MessageResource.NoDataCurrent;
						res.HttpStatusCode = (HttpStatusCode)CustomHttpStatusCode.NoDataCurrent;
					}
				}
				catch (Exception ex)
				{
					res.IsOk = false;
					res.Message = MessageResource.UnexpectedErrorOccurred;
					res.Data = new List<RolesCounterModel>();
					res.HttpStatusCode = HttpStatusCode.InternalServerError;
					res.Exception = ex;
				}
			}
			
			res.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			_logger.Information("Role_RoleCounters_Reutn: {0}", JsonConvert.SerializeObject(res));
			return Json(res, JsonRequestBehavior.AllowGet);
		}

		/// <summary>
		/// 角色與權限管理首頁 : 新增角色
		/// </summary>
		/// <param name="model"></param>
		/// <returns>Json</returns>
		[HttpPost]
		[LogActionFilter]
		public JsonResult CreateRoleResult(RoleCrerateModel model)
		{
			_logger.Information("Role_CreateRoleResult({0}) ", JsonConvert.SerializeObject(model));
			ResponseViewModel result = new ResponseViewModel();
			if (!ModelState.IsValid)
			{
				result.IsOk = false;
				result.Message =MessageResource.FieldVerificationFailed;//"資料欄位驗證失敗(ModelState)";
				result.Data = model;
				result.HttpStatusCode = HttpStatusCode.BadRequest;
				result.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
				_logger.Information("Role_CreateRoleResult_Return: {0}", JsonConvert.SerializeObject(result));
				return Json(result, JsonRequestBehavior.AllowGet);
			}

			result = _roleService.CreateRole(model);
			result.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			_logger.Information("Role_CreateRoleResult_Return: {0}", JsonConvert.SerializeObject(result));
			return Json(result, JsonRequestBehavior.AllowGet);
		}

		/// <summary>
		/// 角色之帳號資料
		/// </summary>
		/// <param name="roleid">角色編號(RoleId)</param>
		/// <returns></returns>
		//[OutputCache(Duration = 60, VaryByParam = "*")]
		public async Task<JsonResult> RoleAccounts(string roleid)
		{
			ResponseViewModel res = new ResponseViewModel();
			if (!User.Identity.IsAuthenticated)
			{
				res.IsOk = false;
				res.Message = MessageResource.Unauthorized;
				res.HttpStatusCode = HttpStatusCode.Unauthorized;
			}
			else
			{
				try
				{
					var user= _aspNetUsersService.GetUserModelByName(User.Identity.Name);
					IList<RoleAccountsModel> acts = await _roleService.RoleAccounts(roleid, user.CompanyId);
					res.IsOk = true;
					res.Message = "";
					res.Data = acts;
					res.HttpStatusCode = HttpStatusCode.OK;
					if (!(acts.Count() > 0))
					{
						res.Message = MessageResource.NoDataCurrent;
						res.Data = new List<RoleAccountsModel>();
						res.HttpStatusCode = (HttpStatusCode)CustomHttpStatusCode.NoDataCurrent;
					}
				}
				catch (Exception ex)
				{
					res.IsOk = false;
					res.Message = MessageResource.UnexpectedErrorOccurred;
					res.Data = new List<RoleAccountsModel>();
					res.HttpStatusCode = HttpStatusCode.InternalServerError;
					res.Exception = ex;
				}
			}
	
			res.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			_logger.Information("Role_RoleAccounts_Return: {0}", JsonConvert.SerializeObject(res));
			return Json(res, JsonRequestBehavior.AllowGet);
		}

		/// <summary>
		/// 角色與平台功能項目對應
		/// </summary>
		/// <param name="roleid">角色編號(RoleId)</param>
		/// <returns></returns>
		//[OutputCache(Duration = 60, VaryByParam = "*")]
		public JsonResult RoleFunctions(string roleid)
		{
			ResponseViewModel res = new ResponseViewModel();
			try
			{
				IList<WebFunctionForRoleListModel> items = _webFunctionService.WebFunctionByRole(roleid);

				res.IsOk = true;
				res.Message = "";
				res.Data = items;
				res.HttpStatusCode = (HttpStatusCode)200;
				if (!(items.Count() > 0))
				{
					res.Message = MessageResource.NoDataCurrent;
					res.Data = new List<WebFunctionForRoleListModel>();
					res.HttpStatusCode = (HttpStatusCode)CustomHttpStatusCode.NoDataCurrent;
				}
			}
			catch (Exception ex)
			{
				res.IsOk = false;
				res.Message = MessageResource.UnexpectedErrorOccurred;
				res.Data = new List<WebFunctionForRoleListModel>();
				res.HttpStatusCode = (HttpStatusCode)500;
				res.Exception = ex;
			}

			res.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			_logger.Information("Role_RoleFunctions_Return: {0}", JsonConvert.SerializeObject(res));
			return Json(res, JsonRequestBehavior.AllowGet);
		}

		/// <summary>
		/// 角色可用平台功能項目 更新(Update)
		/// </summary>
		/// <returns></returns>
		[HttpPost]
		[LogActionFilter]
		public async Task<JsonResult> RoleFunctionsUpdate(RoleFunctionsViewModel model)
		{
			_logger.Information("Role_UpdataFunctions({0})", JsonConvert.SerializeObject(model));
			ResponseViewModel res = new ResponseViewModel();
			try
			{
				if (model.FunctionIds == null) { model.FunctionIds = new List<WebFunctionIdModel>(); }
				var r = await _roleFunctionService.UpdateOrCreate(model);
				if (r.IsOk)
				{
					res.IsOk = true;
					res.Message = "";
					//res.Data = model;
					res.HttpStatusCode = (HttpStatusCode)200;
				}
				else
				{
					res.IsOk = false;
					res.Message = r.Message;//string.Format(Resource.UpdateFailed, "角色功能項目清單 ");
					res.Data = model;
					res.HttpStatusCode = (HttpStatusCode)500;
				}
			}
			catch (Exception ex)
			{
				res.IsOk = false;
				res.Message = MessageResource.UnexpectedErrorOccurred;
				res.Data = model;
				res.HttpStatusCode = (HttpStatusCode)500;
				res.Exception = ex;
			}

			_logger.Information("Role_UpdataFunctions_Return: {0}", JsonConvert.SerializeObject(res));
			return Json(res, JsonRequestBehavior.AllowGet);
		}

	}
}