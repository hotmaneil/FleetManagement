using System;
using System.Data.Entity;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;

namespace FleetManagement.Models
{
    // 您可將更多屬性新增至 ApplicationUser 類別，藉此為使用者新增設定檔資料，如需深入了解，請瀏覽 https://go.microsoft.com/fwlink/?LinkID=317594。
    public class ApplicationUser : IdentityUser
    {
        public async Task<ClaimsIdentity> GenerateUserIdentityAsync(UserManager<ApplicationUser> manager)
        {
            // 注意 authenticationType 必須符合 CookieAuthenticationOptions.AuthenticationType 中定義的項目
            var userIdentity = await manager.CreateIdentityAsync(this, DefaultAuthenticationTypes.ApplicationCookie);
            // 在這裡新增自訂使用者宣告
            return userIdentity;
        }

		#region 擴充欄位
		/// <summary>
		/// 姓名
		/// </summary>
		public string RealName { get; set; }

		/// <summary>
		/// 地區
		/// </summary>
		public int Area { get; set; }

		/// <summary>
		/// 註冊日期
		/// </summary>
		public DateTime? RegisterDate { get; set; }

		/// <summary>
		/// 帳號建立者(UserId)
		/// </summary>
		public string CreateUser { get; set; }

		/// <summary>
		/// 會員等級
		/// 1：貨主  2～5：車主 （不同等級）
		/// </summary>
		public int? Level { get; set; }
		#endregion
	}

	public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext()
            : base("AuthConnection", throwIfV1Schema: false)
        {
        }

        public static ApplicationDbContext Create()
        {
            return new ApplicationDbContext();
        }

		protected override void OnModelCreating(DbModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);

			#region _解決Error: Oracle.ManagedDataAccess.EntityFramework - ORA-01918: user 'dbo' does not exist 
			//Configure default schema 
			modelBuilder.HasDefaultSchema("TRUCK"); //db username
			#endregion
		}
	}
}