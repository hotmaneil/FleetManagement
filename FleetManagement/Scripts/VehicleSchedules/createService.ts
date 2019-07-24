import { ICreateService, SearchDriverKeyWordModel, VehicleScheduleIdModel, MyVehicleSchedulesResultList } from "./module";
import { AjaxOption, DoAjax, HttpStatusCode, CreateMessage, InfoType } from "../Shared/module";

/**
宣告String,以擴充屬性Empty
*/
declare const String: StringExtensions;
interface StringExtensions extends StringConstructor {
    empty: '';
}

export class CreateService implements ICreateService {

  /**
   * 搜尋司機自己的路線班表
   * @param input
   */
    SearchMyVehicleSchedulesResult(input: SearchDriverKeyWordModel) {
        let setting: AjaxOption = {
            url: '/VehicleSchedules/GetVehicleScheduleList',
            type: 'POST',
            dataType: 'json',
            cache: false,
            data: {
                SearchWord: input.SearchWord,
                DriverId: input.DriverId
            }
        };

        DoAjax(setting,
            function (res) {
                SUCCESS("SearchMyVehicleSchedulesResult", res);
            },
            function (res) { ERROR("SearchMyVehicleSchedulesResult", res); },
            function () { BeforeSend("SearchMyVehicleSchedulesResult", '#dataTable'); },
            null);
    }

    /**
     * 刪除路線班表
     * @param input
     */
    DeleteVehicleSchedule(input: VehicleScheduleIdModel) {

        let setting: AjaxOption = {
            url: '/VehicleSchedules/DeleteVehicleSchedule',
            type: 'POST',
            dataType: 'json',
            cache: false,
            data: {
                Id: input.Id
            }
        };

        DoAjax(setting,
            function (res) {
                SUCCESS("DeleteVehicleSchedule", res);
                location.reload();
            },
            function (res) { ERROR("DeleteVehicleSchedule", res); },
            function () { BeforeSend("DeleteVehicleSchedule", ''); },
            null);
    }
}

/*列舉流程步驟*/
type flowStep = "SearchMyVehicleSchedulesResult" | "DeleteVehicleSchedule";

/**
 * 回傳成功結果
 * @param Step
 * @param res
 */
function SUCCESS(Step: flowStep, res: any) {

    let _this = this;

    switch (res.HttpStatusCode) {

        case HttpStatusCode.OK:
            switch (Step) {
                case "SearchMyVehicleSchedulesResult":
                    GenerateMyVehicleSchedulesList(res.Data);
                    break;

                case "DeleteVehicleSchedule":
                    toastr['success']('刪除成功!');

                    break;
            }
            break;
    }
}

/**
 * 回傳失敗結果
 * @param Step
 * @param res
 */
function ERROR(Step: flowStep, res: any) {

    let message: string = String.empty;

    switch (res.HttpStatusCode) {
        case HttpStatusCode.NOT_FOUND:
            window.location.href = '@Url.Action("NotFound", "Error")';
        case HttpStatusCode.INTERNAL_SERVER_ERROR:
            let tableMessage: string = CreateMessage(InfoType.error, "", "", res.Message);
            switch (Step) {
                case "SearchMyVehicleSchedulesResult":
                    toastr["error"](res.Message);
                    $("#SearchResult").empty().append(tableMessage);
                    break;
            }
            break;
        case HttpStatusCode.UNAUTHORIZED:
            switch (Step) {
                case "DeleteVehicleSchedule":
                    toastr['success']('刪除失敗!');
                    break;
            }
            break;
    }
}

/**
 * 送出前
 * @param Step
 * @param selector
 */
function BeforeSend(Step: flowStep, selector: string) {
    let skeleton: string = String.empty;
    switch (Step) {

    }
    $(selector).empty().append(skeleton);
}


/**
 * 司機的路線資料列表
 * @param Data
 */
export function GenerateMyVehicleSchedulesList(Data: MyVehicleSchedulesResultList) {

    var table = new Tabulator("#SearchResult", {
        height: "60vh",
        fitColumns: true,
        layout: "fitColumns",
        layoutColumnsOnNewData: true,
        pagination: "local",
        paginationSize: 10,
        placeholder: "沒有資料",
        columns: [
            { title: "序號", field: "Id", sorter: "number", width: 50, formatter: "rownum" },
            { title: "車號", field: "VehicleLicenseNumber", sorter: "string" },
            { title: "接貨地區", field: "StartPostalName", sorter: "string" },
            { title: "送貨地區", field: "TargetPostalName", sorter: "string" },
            { title: "頻率", field: "Frequency", sorter: "string" },
            { title: "時間", field: "DateTimeInfo", sorter: "string" },
            { title: "期望報價", field: "QuotedPrice", sorter: "number" },

            {
                title: "編輯", formatter: function (cell, formatterParams) {
                    let vehicleSchedulesId = cell.getRow().getData().Id;
                    return `<button type="button" class="ui basic button circular teal" editVehicleSchedulesId="${vehicleSchedulesId}">編輯</button>`;
                }
            },

            {
                title: "刪除", formatter: function (cell, formatterParams) {
                    let vehicleSchedulesId = cell.getRow().getData().Id;
                    return `<button type="button" class="ui basic button circular red" delVehicleSchedulesId="${vehicleSchedulesId}">刪除</button>`;
                }
            }
        ]
    });
    table.setData(Data);
}
