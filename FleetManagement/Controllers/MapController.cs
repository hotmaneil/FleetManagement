﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FleetManagement.Controllers
{
    public class MapController : Controller
    {
		public ActionResult GoogleMapJS()
		{
			return PartialView();
		}
	}
}