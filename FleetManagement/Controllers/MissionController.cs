using Services.Interface;
using Services.Service;
using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using System.Web.Mvc;
using Utility.Extensions;
using ViewModel.Booking;
using ViewModel.Mission;
using ViewModel.Share;

namespace FleetManagement.Controllers
{
	public class MissionController : Controller
    {
		readonly IBookingService _bookingService;
		readonly IAspNetUsersService _aspNetUsersService;

		public MissionController()
		{
			_bookingService = new BookingService();
			_aspNetUsersService = new AspNetUsersService();
		}

		#region Session
		/// <summary>
		/// 任務搜尋 ViewModel Session Property
		/// </summary>
		private MissionSearchViewModel _sessionMissionSearchViewModel;

		/// <summary>
		/// 任務 Session
		/// </summary>
		public MissionSearchViewModel SessionMissionSearchViewModel
		{
			get
			{
				var sessionSearchModel = Session.GetDataFromSession<MissionSearchViewModel>("sessionMissionSearchViewModel");
				if (sessionSearchModel == null)
				{
					MissionSearchViewModel _sessionNewSearchModel = new MissionSearchViewModel();
					return _sessionNewSearchModel;
				}
				else
				{
					_sessionMissionSearchViewModel = sessionSearchModel;
					return _sessionMissionSearchViewModel;
				}
			}

			set
			{
				if (_sessionMissionSearchViewModel != value)
				{
					_sessionMissionSearchViewModel = value;
					Session.SetDataToSession<MissionSearchViewModel>("sessionMissionSearchViewModel", _sessionMissionSearchViewModel);
				}
			}
		}
		#endregion

		/// <summary>
		/// 任務管理首頁
		/// </summary>
		/// <returns></returns>
		public ActionResult Index()
        {
			if (!User.Identity.IsAuthenticated)
				return RedirectToAction("Login", "Account");

			return View(SessionMissionSearchViewModel);
        }

		/// <summary>
		/// 傳回 任務管理 List JsonResult
		/// </summary>
		/// <param name="SearchViewModel"></param>
		/// <returns></returns>
		[LogActionFilter]
		public JsonResult GetMissionList(MissionSearchViewModel SearchViewModel)
		{
			if (SessionMissionSearchViewModel != null)
			{
				if (SearchViewModel != SessionMissionSearchViewModel)
					SessionMissionSearchViewModel = SearchViewModel;
				else
					SearchViewModel = SessionMissionSearchViewModel;
			}

			TabulatorJsonViewModel result = new TabulatorJsonViewModel();

			try
			{
				//限制只能為自己的公司
				var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
				SearchViewModel.SearchCompanyId = user.CompanyId;

				int pageCount = 0;
				result.data = _bookingService.GetMissionPageList(SearchViewModel,ref pageCount);
				result.last_page = pageCount;

			}
			catch (Exception ex)
			{
				result.IsOk = false;
				result.Exception = ex;
				result.HttpStatusCode = HttpStatusCode.InternalServerError;
			}

			return Json(result, JsonRequestBehavior.AllowGet);
		}

		/// <summary>
		/// 下載Excel
		/// </summary>
		/// <returns></returns>
		[HttpPost]
		public ActionResult DownLoadExcel()
		{
			List<MissionListViewModel> listData = new List<MissionListViewModel>();

			string beginDateTime = SessionMissionSearchViewModel.BeginDateTime.HasValue ? SessionMissionSearchViewModel.BeginDateTime.Value.ToString("yyyy/MM/dd") : string.Empty;
			string endDateTime = SessionMissionSearchViewModel.EndDateTime.HasValue ? SessionMissionSearchViewModel.EndDateTime.Value.ToString("yyyy/MM/dd") : string.Empty;
			string searchText = string.Format("任務管理查詢條件：起訖時間({0}~{1}),車號({2}),車主({3})",
				beginDateTime, endDateTime, SessionMissionSearchViewModel.VehicleNumber, SessionMissionSearchViewModel.DriverName);

			//限制只能為自己的公司
			var user = _aspNetUsersService.GetUserModelByName(User.Identity.Name);
			SessionMissionSearchViewModel.SearchCompanyId = user.CompanyId;

			listData = _bookingService.GetMissionList(SessionMissionSearchViewModel);

			string searchDateStr = "任務管理_" + DateTime.Now.ToString("yyyyMMddHHmm");
			var fileStream = _bookingService.GenerateMissionListXlsx(listData, "任務管理報表", searchText, searchDateStr + ".xlsx");
			return File(fileStream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "QueryOrderData.xlsx");
		}

		/// <summary>
		/// 明細
		/// </summary>
		/// <param name="MessageId"></param>
		/// <param name="ControllerName"></param>
		/// <returns></returns>
		[LogActionFilter]
		public async Task<ActionResult> Detail(string MessageId,string ControllerName)
		{
			BookingViewModel model = new BookingViewModel();
			model = await _bookingService.GetBookingDetail(MessageId);

			ViewBag.ControllerName = ControllerName;

			return View(model);
		}
	}
}