using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Newtonsoft.Json;
using Serilog;
using System;
using System.Threading.Tasks;
using Services.Interface;
using OracleDB.Repositories;
using OracleDB.Models;
using Services.Service;
using ViewModel.User;
using ViewModel.Share;
using ViewModel.Enum;

namespace FleetManagement.Models
{
	public class AuthRepository : IDisposable
    {
        private ILogger _logger = Log.Logger;
        private ApplicationDbContext _ctx;
        private UserManager<ApplicationUser> _userManager;
        private string userId = System.Web.HttpContext.Current.User.Identity.GetUserId() == null ? "SYS" : System.Web.HttpContext.Current.User.Identity.GetUserId();
        private IAspNetUsersService _aspnetUsersService;
        private IGenericRepository<AspNetUserRoles> _aspnetUserRoles;

		public void Dispose()
        {
            _ctx.Dispose();
            _userManager.Dispose();
        }

        public AuthRepository()
        {
            _ctx = new ApplicationDbContext();
            _userManager = new UserManager<ApplicationUser>(new UserStore<ApplicationUser>(_ctx));
            _userManager.UserValidator = new UserValidator<ApplicationUser>(_userManager) { AllowOnlyAlphanumericUserNames = false };
            _aspnetUsersService = new AspNetUsersService();
            _aspnetUserRoles = new GenericRepository<AspNetUserRoles>();
		}

        /// <summary>
        /// 註冊: 新增使用者資料
        /// </summary>
        /// <param name="userModel"></param>
        /// <returns></returns>
        public async Task<IdentityResult> RegisterUser(UserModel userModel)
        {
            ApplicationUser newone = new ApplicationUser();
            newone.UserName = userModel.PhoneNumber;
            newone.RealName = userModel.RealName;
            newone.PhoneNumber = userModel.PhoneNumber;
            newone.RegisterDate = DateTime.Now;
            newone.CreateUser = userId;
            newone.Area = userModel.Area;
			newone.PhoneNumberConfirmed = true;

			newone.Level = (byte)MemberLevelEnum.DriverLevel1;//暫定以車主等級

			_logger.Information("AuthRepository_RegisterUser[ApplicationUser]: {0}", JsonConvert.SerializeObject(newone));
            try
            {
				IdentityResult result = await _userManager.CreateAsync(newone, userModel.Password);
                _logger.Information("AuthRepository_RegisterUser(Create OK): {0}", JsonConvert.SerializeObject(result));

				//帳號加入角色
				AspNetUserRoles ur = new AspNetUserRoles();
                ur.RoleId = userModel.RoleId;
                ur.UserId = newone.Id;
                ur.IsValid = true;
                _aspnetUserRoles.Create(ur);

                //CreateUserExtend
                userModel.Id = newone.Id;
                VerityResult verityResult = new VerityResult();
                verityResult = await _aspnetUsersService.CreateOrUpdateUserExtend(userModel);
                _logger.Information("AuthRepository_RegisterUser_[CreateOrUpdateUserExtend]_Result: {0}", JsonConvert.SerializeObject(verityResult));

                return result;
            }
            catch (Exception ex)
            {
                _logger.Information("AuthRepository_RegisterUser_Exception: {0}", JsonConvert.SerializeObject(ex.Message.ToString()));
                throw ex;
            }
        }

    }
}