import * as vehicleSchedule from './createService';
let service = new vehicleSchedule.CreateService();

$(document).ready(async function () {

    let driverId: string = <string>$("#DriverId").val();
    let searchWord: string = <string>$("#SearchWord").val();

    service.SearchMyVehicleSchedulesResult({
        SearchWord: searchWord,
        DriverId: driverId
    });

    //新增路線按鈕
    $("#CreateScheduleBtn").click(function () {
        window.location.href = "Create?ClickFrom=viewMySchedules&DriverId=" + driverId;
    });

    //關鍵字搜尋
    $("#SearchBtn").click(function () {

        let driverId: string = <string>$("#DriverId").val();
        let searchWord: string = <string>$("#SearchWord").val();

        service.SearchMyVehicleSchedulesResult({
            SearchWord: searchWord,
            DriverId: driverId
        });
    });
});


//我的路線列表 按鈕功能
$("#SearchResult").on("click", "div button", function () {

    //編輯
    let editVehicleSchedulesId: number = parseInt($(this).attr("editVehicleSchedulesId"));
    if (editVehicleSchedulesId.toString() != "NaN") {
        window.location.href = "Edit?Id=" + editVehicleSchedulesId;
    }

    //刪除
    let delVehicleSchedulesId: number = parseInt($(this).attr("delVehicleSchedulesId"));
    if (delVehicleSchedulesId.toString() != "NaN") {
        var isConfirm = confirm("確定刪除該路線？");
        if (isConfirm) {
            service.DeleteVehicleSchedule(
            {
                Id: delVehicleSchedulesId
            });
        }
    }
});