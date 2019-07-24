import {
    ICarManagementService,
    VehicleSearchModel,
    SearchResultList
} from './module';

import {
    HttpStatusCode,
    CreateMessage,
    InfoType,
    DoAjax,
    AjaxOption
} from '../Shared/module';

/**
宣告String,以擴充屬性Empty
*/
declare const String: StringExtensions;
interface StringExtensions extends StringConstructor {
    empty: '';
}

/**
 * CarManagementService 車輛管理 服務
 */
export class CarManagementService implements ICarManagementService {

    /**
     * 搜尋車輛結果
     * @param input
     */
    SearchResult(input: VehicleSearchModel) {
        let setting: AjaxOption = {
            url: '/CarManagement/GetVehicleList',
            type: 'POST',
            dataType: 'json',
            data: {
                SearchLicenseNumber: input.SearchLicenseNumber,
                SearchCompanyId: input.SearchCompanyId
            }
        };
        DoAjax(setting,
            function (res) {
                SUCCESS("SearchResult", res);
            },
            function (res) { ERROR("SearchResult", res); },
            function () { BeforeSend("SearchResult", '#dataTable'); },
            null);
    }
}

/*列舉流程步驟*/
type flowStep = "SearchResult";

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
                case "SearchResult":
                    let result = GenerateCarManagementList(res.Data);
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
            switch (Step) {
                case "SearchResult":
                    toastr["error"](res.Message);
                    let tableMessage: string = CreateMessage(InfoType.error, "", "", res.Message);
                    $("#dataTable").empty().append(tableMessage);
                    break;
            }
            break;
        case HttpStatusCode.UNAUTHORIZED:
            switch (Step) {
              
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
 * 產生車輛管理資料列表
 * @param Data
 */
function GenerateCarManagementList(Data: SearchResultList[]) {
    var table = new Tabulator("#dataTable", {
        height: "60vh",
        fitColumns: true,

        rowFormatter: function (row, data) {

            //找出已經按下編輯按鈕的session
            let editedVehicleId: Number = parseInt(sessionStorage.getItem('editedVehicleId'));
            var vehicleId = row.getData()['VehicleId'];

            if (editedVehicleId === vehicleId) {

                //看到哪列上次編輯過
                row.getElement().style.backgroundColor = "#A6A6DF";
            }
        },

        layout: "fitColumns",
        layoutColumnsOnNewData: true,
        pagination: "local",
        paginationSize: 10,
        history: true,
        placeholder: "無資料",
        columns: [
            { title: "車號", field: "LicenseNumber", sorter: "string" },
            { title: "車型", field: "VehicleModel", sorter: "string" },
            { title: "載重", field: "LoadWeight", sorter: "string" },
            { title: "廠商", field: "CompanyName", sorter: "string" },

            {
                title: "操作", field: "VehicleId", align: "center", sortable: false, formatter: function (cell, formatterParams) {
                    let value = cell.getValue();
                    let editBtn = `<button type="button" class="ui basic button circular cusgreen" name="edit" edit-Id="${value}">編輯</button>`;
                    return editBtn;
                }
            }
        ]
    });
    table.setData(Data);
}