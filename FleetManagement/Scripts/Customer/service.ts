import { ICustomerService, CustomerSearchModel, SearchResultList, CreateCustomerModel } from "./module";
import { AjaxOption, DoAjax, HttpStatusCode, CreateMessage, InfoType } from "../Shared/module";

/**
宣告String,以擴充屬性Empty
*/
declare const String: StringExtensions;
interface StringExtensions extends StringConstructor {
    empty: '';
}

var table;

/**
 * CustomerService 客戶 服務
 * */
export class CustomerService implements ICustomerService {

    /**
     * 搜尋客戶列表
     * @param input
     */
    SearchResult(input: CustomerSearchModel) {
        let setting: AjaxOption = {
            url: '/CustomerManage/GetCustomerList',
            type: 'POST',
            dataType: 'json',
            cache: false,
            data: {
                CompanyId: input.CompanyId,
                SearchTaxNumber: input.SearchTaxNumber
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

    /**
     * 新增客戶
     * @param input
     */
    CreateCustomer(input: CreateCustomerModel) {
        let _this = this;
        let setting: AjaxOption = {
            url: '/CustomerManage/CreateCustomer',
            type: 'POST',
            dataType: 'json',
            cache: false,
            data: {
                CompanyId: input.CompanyId,
                TaxNumber: input.TaxNumber,
                Name: input.Name,
                MainContacter: input.MainContacter,
                ContactPhoneNumber: input.ContactPhoneNumber,
                SubContacter: input.SubContacter,
                PersonInCharge: input.PersonInCharge
            }
        };

        DoAjax(setting,
            function (res) {
                SUCCESS("CreateCustomer", res);
                _this.SearchResult({
                    CompanyId: input.CompanyId,
                    SearchTaxNumber: null
                });
            },
            function (res) { ERROR("CreateCustomer", res); },
            function () { BeforeSend("CreateCustomer", '#CreateCustomerModal .content'); },
            null);
    }

    /**
     * 刪除客戶
     * @param Id
     */
    DeleteCustomer(Id: string) {
        let _this = this;

        let setting: AjaxOption = {
            url: '/CustomerManage/DeleteCustomer',
            type: 'POST',
            dataType: 'json',
            cache: false,
            data: { Id: Id }
        };

        DoAjax(setting,
            function (res) {
                SUCCESS("DeleteCustomer", res);
                _this.SearchResult({
                    CompanyId: null,
                    SearchTaxNumber: null
                });
            },
            function (res) { ERROR("DeleteCustomer", res); },
            function () { BeforeSend("DeleteCustomer", ''); },
            null);
    }
}

/*列舉流程步驟*/
type flowStep = "SearchResult" | "CreateCustomer" | "DeleteCustomer";

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
                    GenerateCustomerList(res.Data);
                    break;

                case "CreateCustomer":
                    $("#CreateCustomerModal").modal('hide');
                    toastr["success"]("新增成功");
                    break;

                case "DeleteCustomer":
                    toastr['success']('刪除成功!');
                    break;
            }
            break;

        case HttpStatusCode.INTERNAL_SERVER_ERROR:
            switch (Step) {
                
                case "CreateCustomer":
                    toastr["error"](res.Message);
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

                case "CreateCustomer":
                    toastr['error']('新增失敗!' + res.Message);
                    break;
            }
            break;
        case HttpStatusCode.UNAUTHORIZED:
            switch (Step) {
                case "DeleteCustomer":
                    toastr['error']('刪除失敗!');
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
        case "CreateCustomer":
            break;
    }
}

/**
 * 產生客戶資料列表
 * @param Data
 */
export function GenerateCustomerList(Data: SearchResultList[]) {

    table = new Tabulator("#dataTable", {
        height: "60vh",
        fitColumns: true,

        layout: "fitColumns",
        layoutColumnsOnNewData: true,
        pagination: "local",
        paginationSize: 10,
        history: true,
        placeholder: "無資料",
        columns: [
            { title: "序號", sorter: "number", width: 50, formatter: "rownum" },
            { title: "公司名稱", field: "Name", sorter: "string" },
            { title: "公司統編", field: "TaxNumber", sorter: "string" },
            { title: "聯絡人", field: "MainContacter", sorter: "string" },
            { title: "聯絡電話", field: "ContactPhoneNumber", sorter: "string" },
            { title: "公司負責人", field: "PersonInCharge", sorter: "string" },
            {
                title: "編輯",
                formatter: function (cell, formatterParams) {
                    let Id = cell.getRow().getData().Id;
                    return `<button type="button" class="ui basic button circular blue" editCustomerId="${Id}">編輯</button>`;
                }
            },
            {
                title: "刪除",
                formatter: function (cell, formatterParams) {
                    let Id = cell.getRow().getData().Id;
                    return `<button type="button" class="ui basic button circular red" delId="${Id}">刪除</button>`;
                }
            }
        ]
    });
    table.setData(Data);
}