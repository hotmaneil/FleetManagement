using Newtonsoft.Json;
using Serilog;
using Services.Interface;
using Services.Service;
using System;
using System.Net;
using System.Threading.Tasks;
using System.Web.Mvc;
using Utility.Extensions;
using ViewModel.Customer;
using ViewModel.Share;

namespace FleetManagement.Controllers
{
	/// <summary>
	/// 客戶管理 控制器
	/// </summary>
	[LogActionFilter]
	public class CustomerManageController : Controller
    {
		private ILogger _logger = Log.Logger;
		readonly ICustomerService _customerService;
		readonly IAspNetUsersService _aspNetUsersService;

		public CustomerManageController()
		{
			_customerService = new CustomerService();
			_aspNetUsersService = new AspNetUsersService();
		}

		#region Session
		/// <summary>
		/// 帳號搜尋 ViewModel Session Property
		/// </summary>
		private CustomerSearchViewModel _sessionCustomerSearchViewModel;

		/// <summary>
		/// 帳號 Session
		/// </summary>
		public CustomerSearchViewModel SessionCustomerSearchViewModel
		{
			get
			{
				var sessionSearchModel = Session.GetDataFromSession<CustomerSearchViewModel>("sessionCustomerSearchViewModel");
				if (sessionSearchModel == null)
				{
					CustomerSearchViewModel _sessionNewSearchModel = new CustomerSearchViewModel();
					return _sessionNewSearchModel;
				}
				else
				{
					_sessionCustomerSearchViewModel = sessionSearchModel;
					return _sessionCustomerSearchViewModel;
				}
			}

			set
			{
				if (_sessionCustomerSearchViewModel != value)
				{
					_sessionCustomerSearchViewModel = value;
					Session.SetDataToSession<CustomerSearchViewModel>("sessionCustomerSearchViewModel", _sessionCustomerSearchViewModel);
				}
			}
		}
		#endregion

		/// <summary>
		/// 客戶管理 首頁
		/// </summary>
		/// <returns></returns>
		public ActionResult Index()
        {
			if (!User.Identity.IsAuthenticated)
				return RedirectToAction("Login", "Account");

			var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
			TempData["CompanyId"] = user.CompanyId;
			return View(SessionCustomerSearchViewModel);
        }

		/// <summary>
		/// 取得客戶列表
		/// </summary>
		/// <param name="SearchViewModel"></param>
		/// <returns></returns>
		[HttpPost]
		public JsonResult GetCustomerList(CustomerSearchViewModel SearchViewModel)
		{
			if (SessionCustomerSearchViewModel != null)
			{
				if (SearchViewModel != SessionCustomerSearchViewModel)
					SessionCustomerSearchViewModel = SearchViewModel;
				else
					SearchViewModel = SessionCustomerSearchViewModel;
			}

			ResponseViewModel result = new ResponseViewModel();

			try
			{
				//限制只能為公司
				var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
				SearchViewModel.CompanyId = user.CompanyId;

				result.Data = _customerService.GetCustomerList(SearchViewModel);
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
		/// 新增客戶
		/// </summary>
		/// <param name="model"></param>
		/// <returns></returns>
		[HttpPost]
		public async Task<ActionResult> CreateCustomer(CustomerViewModel model)
		{
			_logger.Information($"CreateCustomer: { JsonConvert.SerializeObject(model)}");
			ResponseViewModel result = new ResponseViewModel();

			try
			{
				var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
				result = await _customerService.CreateOrUpdateCustomer(model, user.Id);
			}
			catch (Exception ex)
			{
				_logger.Information($"CreateCustomer: { JsonConvert.SerializeObject(ex)}");
				throw ex;
			}
			return Json(result, JsonRequestBehavior.DenyGet);
		}

		/// <summary>
		/// 編輯頁面
		/// </summary>
		/// <param name="Id"></param>
		/// <returns></returns>
		public ActionResult Edit(string Id)
		{
			if (!User.Identity.IsAuthenticated)
				return RedirectToAction("Login", "Account");

			CustomerIdModel model = new CustomerIdModel();
			model.Id = Id;
			CustomerViewModel data = _customerService.GetCustomer(model);

			return View(data);
		}

		/// <summary>
		/// 資料儲存
		/// </summary>
		/// <param name="model"></param>
		/// <returns></returns>
		public async Task<ActionResult> Save(CustomerViewModel model)
		{
			_logger.Information($"Save: { JsonConvert.SerializeObject(model)}");
			ResponseViewModel result = new ResponseViewModel();

			try
			{
				var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
				result = await _customerService.CreateOrUpdateCustomer(model, user.Id);

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
				TempData["SaveResult"] = result.Message;
				_logger.Information($"Save BookingViewModel error : { JsonConvert.SerializeObject(ex)}");
				throw;
			}
			return View("Edit", model);
		}

		/// <summary>
		/// 刪除客戶
		/// </summary>
		/// <param name="Id"></param>
		/// <returns></returns>
		[LogActionFilter]
		[HttpPost]
		public async Task<JsonResult> DeleteCustomer(string Id)
		{
			ResponseViewModel result = new ResponseViewModel();

			try
			{
				result = await _customerService.DeleteCustomer(Id);
			}
			catch (Exception ex)
			{
				result.IsOk = false;
				result.Exception = ex;
				result.HttpStatusCode = HttpStatusCode.InternalServerError;
			}
			return Json(result, JsonRequestBehavior.DenyGet);
		}
	}
}