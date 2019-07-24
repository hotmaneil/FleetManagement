import {
    RelativePath
} from '../Shared/enum';

$(document).ready(async function () {
    getDashboardData();
    setInterval(getDashboardData, 1000 * 60);
});

/**
 * 取得儀表板資訊
 */
function getDashboardData() {
    $.ajax({
        type: 'POST',
        url: RelativePath.ConstName + 'Home/GetDashBoardData',
        async: false,
        dataType: 'json',
        success: function (data) {

            //運費
            $("#TodayTotalOfferPrice").text(data.jsonData.TodayTransportationCharges);
            $("#ThisMonthTotalOfferPrice").text(data.jsonData.ThisMonthTransportationCharges);

            //任務數
            $("#TodayTaskSum").text(data.jsonData.TodayTaskSum);
            $("#ThisMonthTaskSum").text(data.jsonData.ThisMonthTaskSum);

            //已完成件數
            $("#TodayAlreadyFinishedTaskCount").text(data.jsonData.TodayAlreadyFinishedTaskCount);
            $("#ThisMonthFinishedTaskCount").text(data.jsonData.ThisMonthFinishedTaskCount);
        }
    })
}
