import { PrintType } from '../Shared/module';
import * as vehicleSchedule from './service';
import { RelativePath } from '../Shared/enum';
let service = new vehicleSchedule.VehicleSchedulesService();

$(document).ready(async function () {

    var SearchWord = sessionStorage.getItem('SearchWord');
    service.SearchResult({
        SearchWord: SearchWord
    });

    //關鍵字搜尋
    $("#SearchBtn").click(function () {
        let searchWord: string = <string>$("#SearchWord").val();

        sessionStorage.setItem('SearchWord', searchWord);

        service.SearchResult({
            SearchWord: searchWord
        });
    });

    //新增路線按鈕
    $("#CreateScheduleBtn").click(function () {
        window.location.href = "VehicleSchedules/Create?ClickFrom=index";
    });

    //service.ExportExcelOrPDF(PrintType.landscape);

    /**列印*/
    $("#PrintBtn").click(function () {
        service.Print();
    });
});

//路線列表 按鈕功能
$("#SearchResult").on("click", "div button", function () {

    let driverId: string = <string>($(this).attr("DriverId"));
    if (driverId != undefined) {
        window.location.href = RelativePath.ConstName + "VehicleSchedules/ViewMySchedules?DriverId=" + driverId;
    }
});