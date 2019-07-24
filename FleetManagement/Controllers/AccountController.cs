using BotDetect.Web.Mvc;
using FleetManagement.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using Newtonsoft.Json;
using Serilog;
using Services.Interface;
using Services.Service;
using System;
using System.Net;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using ViewModel.Share;
using ViewModel.User;

namespace FleetManagement.Controllers
{
	/// <summary>
	/// 帳號 控制器
	/// </summary>
	[Authorize]
    public class AccountController : Controller
    {
		private ILogger _logger = Log.Logger;
		readonly IAspNetUsersService _aspNetUsersService;

		private ApplicationSignInManager _signInManager;
        private ApplicationUserManager _userManager;
		IPasswordHasher _passwordHasher;

		public AccountController()
        {
			_aspNetUsersService = new AspNetUsersService();
			_passwordHasher = new PasswordHasher();
		}

        public AccountController(ApplicationUserManager userManager, ApplicationSignInManager signInManager )
        {
            UserManager = userManager;
            SignInManager = signInManager;
        }

        public ApplicationSignInManager SignInManager
        {
            get
            {
                return _signInManager ?? HttpContext.GetOwinContext().Get<ApplicationSignInManager>();
            }
            private set 
            { 
                _signInManager = value; 
            }
        }

        public ApplicationUserManager UserManager
        {
            get
            {
                return _userManager ?? HttpContext.GetOwinContext().GetUserManager<ApplicationUserManager>();
            }
            private set
            {
                _userManager = value;
            }
        }

		/// <summary>
		/// 登入頁面
		/// </summary>
		/// <param name="returnUrl"></param>
		/// <returns></returns>
        [AllowAnonymous]
        public ActionResult Login(string returnUrl)
        {
            ViewBag.ReturnUrl = returnUrl;
            return View();
        }

		/// <summary>
		/// 登入
		/// </summary>
		/// <param name="model"></param>
		/// <param name="returnUrl"></param>
		/// <returns></returns>
		[HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
		[CaptchaValidation("CaptchaCode", "captcha", "驗證碼錯誤!")]
		public async Task<ActionResult> Login(LoginViewModel model, string returnUrl)
        {
			try
			{
				MvcCaptcha.ResetCaptcha("captcha");

				if (!ModelState.IsValid)
				{
					return View(model);
				}

				// 這不會計算為帳戶鎖定的登入失敗
				// 若要啟用密碼失敗來觸發帳戶鎖定，請變更為 shouldLockout: true
				var result = await SignInManager.PasswordSignInAsync(model.Username, model.Password, model.RememberMe, shouldLockout: false);

				_logger.Information("Login_Model:{0}", JsonConvert.SerializeObject(model));
				_logger.Information("Login_Result:{0}", JsonConvert.SerializeObject(result));

				switch (result)
				{
					case SignInStatus.Success:
						var user = _aspNetUsersService.GetUserModelByName(model.Username);
						if (user.IsStopAuthority.HasValue)
						{
							if (user.IsStopAuthority.Value)
							{
								AuthenticationManager.SignOut(DefaultAuthenticationTypes.ApplicationCookie);
								ModelState.AddModelError("", "該帳號已停權!");
								TempData["LoginResult"] = "該帳號已停權!";
								return View("Login", model);
							}
							else
								return RedirectToLocal(returnUrl);
						}
						else
							return RedirectToLocal(returnUrl);

					case SignInStatus.LockedOut:
						return View("Lockout");
					case SignInStatus.RequiresVerification:
						return RedirectToAction("SendCode", new { ReturnUrl = returnUrl, RememberMe = model.RememberMe });
					case SignInStatus.Failure:
					default:
						ModelState.AddModelError("", "登入嘗試失敗。");
						TempData["LoginResult"] = "嘗試登入失敗！";
						return View(model);
				}
			}
			catch (Exception ex)
			{
				_logger.Information("Login_Error({0}) ", JsonConvert.SerializeObject(ex.Message));
				throw ex;
			}
        }

		/// <summary>
		/// 復權或停權該帳號
		/// </summary>
		/// <param name="model"></param>
		/// <returns></returns>
		[HttpPost]
		public async Task<JsonResult> OpenOrStopAccountAuthority(AuthorityModel model)
		{
			ResponseViewModel responseResult = new ResponseViewModel();

			try
			{
				responseResult = await _aspNetUsersService.OpenOrStopAuthority(model);
			}
			catch (Exception ex)
			{
				throw ex;
			}
			return Json(responseResult, JsonRequestBehavior.DenyGet);
		}

		/// <summary>
		/// 重設密碼
		/// </summary>
		/// <param name="model"></param>
		/// <returns></returns>
		[HttpPost]
		public async Task<JsonResult> RollbackPassword(UserPasswordModel model)
		{
			ResponseViewModel responseResult = new ResponseViewModel();

			try
			{
				model.NewPassword = _passwordHasher.HashPassword(model.NewPassword);
				responseResult = await _aspNetUsersService.RollbackPassword(model);
			}
			catch (Exception ex)
			{
				responseResult.IsOk = false;
				responseResult.Exception = ex;
				responseResult.HttpStatusCode = HttpStatusCode.InternalServerError;
				throw ex;
			}
			return Json(responseResult, JsonRequestBehavior.DenyGet);
		}

		/// <summary>
		/// 登出
		/// </summary>
		/// <returns></returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult LogOff()
        {
            AuthenticationManager.SignOut(DefaultAuthenticationTypes.ApplicationCookie);
            return RedirectToAction("Index", "Home");
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (_userManager != null)
                {
                    _userManager.Dispose();
                    _userManager = null;
                }

                if (_signInManager != null)
                {
                    _signInManager.Dispose();
                    _signInManager = null;
                }
            }

            base.Dispose(disposing);
        }

        #region Helper
        // 新增外部登入時用來當做 XSRF 保護
        private const string XsrfKey = "XsrfId";

        private IAuthenticationManager AuthenticationManager
        {
            get
            {
                return HttpContext.GetOwinContext().Authentication;
            }
        }

        private void AddErrors(IdentityResult result)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError("", error);
            }
        }

		/// <summary>
		/// 導向到首頁
		/// </summary>
		/// <param name="returnUrl"></param>
		/// <returns></returns>
        private ActionResult RedirectToLocal(string returnUrl)
        {
            if (Url.IsLocalUrl(returnUrl))
            {
                return Redirect(returnUrl);
            }
            return RedirectToAction("Index", "Home");
        }

        internal class ChallengeResult : HttpUnauthorizedResult
        {
            public ChallengeResult(string provider, string redirectUri)
                : this(provider, redirectUri, null)
            {
            }

            public ChallengeResult(string provider, string redirectUri, string userId)
            {
                LoginProvider = provider;
                RedirectUri = redirectUri;
                UserId = userId;
            }

            public string LoginProvider { get; set; }
            public string RedirectUri { get; set; }
            public string UserId { get; set; }

            public override void ExecuteResult(ControllerContext context)
            {
                var properties = new AuthenticationProperties { RedirectUri = RedirectUri };
                if (UserId != null)
                {
                    properties.Dictionary[XsrfKey] = UserId;
                }
                context.HttpContext.GetOwinContext().Authentication.Challenge(properties, LoginProvider);
            }
        }
        #endregion
    }
}