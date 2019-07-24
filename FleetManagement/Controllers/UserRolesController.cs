using Newtonsoft.Json;
using ResourceLibrary;
using Serilog;
using Services.Interface;
using Services.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web.Mvc;
using ViewModel.Share;
using ViewModel.WebFunctions;

namespace FleetManagement.Controllers
{
	/// <summary>
	/// 角色管理
	/// </summary>
	public class UserRolesController : Controller
    {
		private ILogger _logger = Log.Logger;

		public IWebFunctionsService _webFunctionsService;
		public UserRolesController()
		{
			_webFunctionsService =new WebFunctionsService();
		}

		/// <summary>
		/// 角色 對應 功能項目 可使用資訊
		/// </summary>
		[HttpGet]
		public JsonResult FunctionsForRole(string roleid)
		{
			_logger.Information("UserRole_FunctionsForRole: roleid = {0}", roleid);
			ResponseViewModel result = new ResponseViewModel();
			List<RoleWebFunctionsModel> funs = new List<RoleWebFunctionsModel>();

			try
			{
				funs = _webFunctionsService.GetWebFunctionsForRole(roleid, false);

				result.IsOk = true;
				result.Message = "角色 對應功能項目使用權限";
				result.Data = funs.OrderBy(s => s.DefaultSort).ToList();
				result.HttpStatusCode = HttpStatusCode.OK;
			}
			catch (Exception ex)
			{
				result.IsOk = false;
				result.Message = MessageResource.UnexpectedErrorOccurred;
				result.HttpStatusCode = HttpStatusCode.InternalServerError;
				result.Exception = ex;
				result.Data = funs;
			}

			result.ResponseTime = string.Format("{0:yyyy/MM/dd HH:mm:ss}", DateTime.Now);
			_logger.Information("UserRole_FunctionsForRole_Return: {0}", JsonConvert.SerializeObject(result));
			return Json(result, JsonRequestBehavior.AllowGet);
		}
	}
}