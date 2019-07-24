/*pdfmake 自訂函式*/
import * as pdfMake from "pdfmake";
import * as pdfFonts from 'vfs_fonts';

/*載入語言檔*/
import { vfs} from '../Shared/vfs';
import { IRoleService, RoleListData, AccounrListData, FunctionListData, RoleCrerateModel, GetRoleFunctionListData } from './module';
import { HttpStatusCode, CreateMessage, InfoType, DoAjax, AjaxOption, PrintType } from '../Shared/module';
import { promise, PrintHtml } from "../Shared/function";
import { RelativePath } from "../Shared/enum";

/**宣告String,以擴充屬性Empty*/
declare const String: StringExtensions;
interface StringExtensions extends StringConstructor {
    empty: '';
}
var table;

/**
*Role服務
* @param data 角色列表呈現資訊
*/
export class RoleService implements IRoleService {
    private tempRoleId: string;
    private message: string;
    constructor() {
        this.message = CreateMessage(InfoType.info, '', '查詢中，請稍候', '');
        this.tempRoleId = String.empty;
    }

    /** [GET]角色列表(角色帳號數量)*/
    GetRoleCounters() {
        let _this = this;
        let setting: AjaxOption = {
            url: '/Role/RoleCounters', type: 'GET', dataType: 'json'
        };
        DoAjax(setting,
            function (res) { 
                SUCCESS('RoleCounters', res); 
            },
            function (res) { 
                ERROR('RoleCounters', res);
            },
            function () { 
                BeforeSend('RoleCounters', '#RoleListTable tbody');
            },
            null);
    }

    /**
     * [POST]新增角色
     * @param input
     */
    CreateRoleResult(input:RoleCrerateModel) {
        let _this = this;
        let setting: AjaxOption = {
            url: '/Role/CreateRoleResult', type: 'POST', dataType: 'json',
            data: { RoleName: input.RoleName, Description: input.Description }
        };
        DoAjax(setting,
            function (res) {
                SUCCESS('CreateRoleResult', res);
                _this.GetRoleCounters();
            },
            function (res) { ERROR('CreateRoleResult', res); },
            null,null);
    }

    /**
     * [GET] 符合角色之帳號列表
     * @param roleid 角色編號
     */
    RoleAccounts(roleid: string) {
        this.tempRoleId = roleid;
        let RoleId: string = '';
        if (this.tempRoleId != String.empty) {
            RoleId = this.tempRoleId;
        }
        let setting: AjaxOption = {
            url: RelativePath.ConstName + 'Role/RoleAccounts?roleid=' + roleid, type: 'GET', dataType: 'json'
        };
        DoAjax(setting,
            function (res) { console.log('成功取得角色'); },
            function (res) { console.log('取得角色失敗'); },
            function () { },
            null);  

        promise.then(success => {
            table = new Tabulator("#AccountList", {
                height: "55vh",
                layout: "fitDataFill",
                selectable: true,
                pagination: "local",
                paginationSize: 100,
                placeholder: "無資料",
                ajaxURL: RelativePath.ConstName + "Role/RoleAccounts",
                ajaxParams: {
                    roleid: roleid
                },
                ajaxConfig: "GET",
                ajaxContentType: "json",
                ajaxResponse: function (url, params, response) {
                    return response["Data"];
                },
                downloadDataFormatter: function (data) {
                    return data;
                },
                downloadComplete: function () {
                    toastr.success("下載完成");
                },
                columns: [
                    { title: "車隊", field: "CompanyName", sorter: "string" },
                    { title: "角色編碼", field: "RoleId", sorter: "string", visible: false },
                    { title: "使用者帳戶", field: "UserName", sorter: "string" },
                    { title: "姓名", field: "RealName", sorter: "string" },
                    { title: "行動電話", field: "PhoneNumber", sorter: "string" },
                    { title: "建立者", field: "CreateUser", sorter: "string", visible: false },
                    { title: "建立者姓名", field: "CreateRealName", sorter: "string" }
                ]
            });
        }).then(success => {

            $("#SearchWord").keyup(function () {
                let word: string = <string>$(this).val();
                updateFilter(word);
            });
            $("#PrintBtn").click(function () {
                let data = table.getData();
                let thead = `<thead><tr><th>車隊</th><th>使用者帳戶</th><th>姓名</th><th>行動電話</th><th>建立者姓名</th></tr></thead>`;
                let trs = "";
                $.each(data, function (key, list) {
                    let tr =
                        `<tr>
                            <td>${data[key]['CompanyName']}</td>
                            <td>${data[key]['UserName']}</td>
                            <td>${data[key]['RealName']}</td>
                            <td>${data[key]['PhoneNumber']}</td>
                            <td>${data[key]['CreateRealName']}</td>
                        </tr>`;

                    trs += tr;
                });
                let tablehtml = `<table>${thead}<tbody>${trs}</tbody></table>`;
                PrintHtml(`<h3>角色列表</h3>`, tablehtml);
            });
          });  
    }

    /**
     * 開放功能(平台功能項目清單,指定角色對應可使用權限)
     * @param roleid
     */
    RoleFunctions(roleid: string) {
        let setting: AjaxOption = {
            url: '/Role/RoleFunctions?roleid=' + roleid, type: 'GET', dataType: 'json'
        };
        DoAjax(setting,
            function (res) { SUCCESS('RoleFunctions', res); },
            function (res) { ERROR('RoleFunctions', res);},
            null, null);
    }

    /**
     * 開放功能(平台功能項目清單)
     * @param realall 讀取全部資料,選填。預設為false
     */
    WebFunctionList(realall: boolean) {
        let setting: AjaxOption = {
            url: '/Home/WebFunctionList', type: 'GET', dataType: 'json'
        };
        DoAjax(setting,
            function (res) { SUCCESS('WebFunctionList', res); },
            function (res) { ERROR('WebFunctionList', res); },
            function () { BeforeSend('WebFunctionList', '#FuncttionListPanel'); },
            null);    
    }

    /**
     * 異動角色可用功能項目
     * 角色編號已經由點擊事件取代
     * @param FunctionIds 功能勾選編號
     */
    RoleFunctionsUpdate(FunctionIds: number[]) {
        let _this = this;
        if (this.tempRoleId === String.empty) {
            toastr['warning']('還沒選擇角色!');
        } else {
            let setting: AjaxOption = {
                url: '/Role/RoleFunctionsUpdate', type: 'POST', dataType: 'json',
                data: { RoleId: this.tempRoleId, FunctionIds: FunctionIds }
            };
            DoAjax(setting,
                function (res) { SUCCESS('RoleFunctionsUpdate', res); },
                function (res) { ERROR('RoleFunctionsUpdate', res); },
                null,
                null);
        }
    }

    /**取得該角色所有的已選項目 */
    GetAllChecked() {
        let allcheck: any[] = GetCheckValue();
        return allcheck;
    }

    /**
     * 輸出Excel或PDF
     * @param filename
     * @param print
     */
    ExportExcelOrPDF(filename, print: PrintType) {
        $("#exportForm").on("submit", function (event) {
            event.preventDefault();
            let type = $("#exportType").closest(".dropdown").dropdown("get value");
            switch (type) {
                case "Excel":
                    table.download("xlsx", filename + ".xlsx", { sheetName: filename });
                    break;
                case "Pdf":
                    table.download("pdfmake", filename + ".pdf", {
                        pdfMake: pdfMake,
                        pdfFonts: pdfFonts,
                        vfs: vfs,
                        filename: filename,
                        orientation: print
                    });
                    break;
            }
        });
    }
}

/**列舉流程步驟*/type flowStep = 'RoleCounters' | 'CreateRoleResult' | 'RoleAccounts' | 'WebFunctionList' | 'RoleFunctions' |'RoleFunctionsUpdate';

function SUCCESS(Step: flowStep, res: any) {
    let message: string = String.empty;
    let trTemplete: string = String.empty;
    switch (res.HttpStatusCode) {
        case HttpStatusCode.OK:
            switch (Step) {
                case 'RoleCounters':
                    let roleList: string = CreateRoleListTable(res.Data);
                    $("#RoleListTable tbody").empty().append(roleList);
                    break;
                case 'CreateRoleResult':
                    toastr.success("成功新增角色!");
                    $("#CreateRoleModal form").trigger('reset');
                    $("#CreateRoleModal").modal('hide');
                    break;
                case 'RoleAccounts':
                    let accountList: string = CreateAccountListTable(res.Data);
                    $("#AccountListTable tbody").empty().append(accountList);
                    break;
                case 'WebFunctionList':
                    let functionList: string = CreateFunctionListPanel(res.Data);
                    $("#FuncttionListPanel").empty().append(functionList);
                    MasterCheckbox();
                    ChildCheckbox();
                    break;
                case 'RoleFunctions':
                    let listvalue: object = GetRoleFunctions(res.Data);
                    let numberArray: number[] = [];
                    for (var value in listvalue) { numberArray.push(listvalue[value]); }
                    $(".list .child.checkbox input:checkbox").each(function () {
                        let $parentCheckbox= $(this).parent(".checkbox");
                        let checkboxValue: number = Number($(this).val());
                        $parentCheckbox.checkbox('uncheck');
                        if (numberArray.indexOf(checkboxValue) > -1) {
                            $parentCheckbox.checkbox('check');
                        }
                    });
                    break;
                case 'RoleFunctionsUpdate':
                    if (res.Data["Success"]) {
                        toastr.success('儲存成功!');
                    } else {
                        toastr.error("儲存失敗!");
                    }
                    break;
                default:
                    break;
            }
            break;
        case HttpStatusCode.NoDataCurrent:
        case 'RoleAccounts':
            message= CreateMessage(InfoType.success, '', res.Message, '');
            trTemplete = `<tr><td colspan="7">${message}</td></tr>`;
            $("#AccountListTable tbody").empty().append(trTemplete);
                break;
         
        default:
            break;
    }
}

function ERROR(Step: flowStep, res: any) {
    let message: string = String.empty;
    let trTemplete: string = String.empty;
    switch (res.HttpStatusCode) {
        case HttpStatusCode.NOT_FOUND:
            window.location.href = '@Url.Action("NotFound", "Error")';
            break;
        case HttpStatusCode.INTERNAL_SERVER_ERROR:
            switch (Step) {
                case 'RoleCounters':
                    message = CreateMessage(InfoType.error, '', res.Message, '輸入的資訊錯誤');
                    trTemplete = `<tr><td colspan="5">${message}</td></tr>`;
                    $("#RoleListTable tbody").empty().append(trTemplete);
                    break;
                case 'RoleAccounts':
                    message = CreateMessage(InfoType.error, '', res.Message, '');
                    trTemplete = `<tr><td colspan="7">${message}</td></tr>`;
                    $("#AccountListTable tbody").empty().append(trTemplete);
                    break;
                case 'WebFunctionList':
                    message = CreateMessage(InfoType.error, '', res.Message, '');
                    $("#FuncttionListPanel").empty().append(message);
                    break;
                case 'RoleFunctions':
                    toastr['error']('無法取得此角色的功能項目!');
                    break;
                case 'RoleFunctionsUpdate':
                    toastr['error']('儲存失敗!');
                    break;
                default:
                    window.location.href = '@Url.Action("ServerError", "Error")';
                    break;
            }
            break;
        case HttpStatusCode.UNAUTHORIZED:
            switch (Step) {
                case 'CreateRoleResult':
                    message = CreateMessage(InfoType.error, '', res.Message, '');
                   break;
            }
            break;
        default:
            message = CreateMessage(InfoType.error, '', '要求失敗', '輸入的資訊錯誤');
            trTemplete = `<tr><td colspan="5">${message}</td></tr>`;
            $("#RoleListTable tbody").empty().append(trTemplete);
            break;
    }
}

function BeforeSend(Step: flowStep,selector:string) {
    let skeleton: string = String.empty;
    switch (Step) {
        case 'RoleCounters':
            skeleton = ` 
            <tr>
                <td colspan="5"><div class="ui placeholder">
                    <div class="full line"></div>
                    <div class="very long line"></div>
                    <div class="long line"></div>
                    <div class="full line"></div>
                    <div class="very long line"></div>
                    <div class="long line"></div>
                    </div>
                </td>
            </tr>`;
            break;
        case 'CreateRoleResult':
            skeleton = CreateMessage(InfoType.info, '', '系統執行中,請稍候', '');
            break;
        case 'RoleAccounts':
            skeleton = ` 
            <tr>
                <td colspan="7">
                    <div class="ui placeholder">
                        <div class="full line"></div>
                        <div class="very long line"></div>
                        <div class="long line"></div>
                        <div class="full line"></div>
                        <div class="very long line"></div>
                        <div class="long line"></div>
                    </div>
                </td>
            </tr>`;

            break;
        case 'WebFunctionList':
            skeleton = `
            <div class="ui fluid placeholder">
                <div class="paragraph">
                    <div class="image header">
                        <div class="line"></div>
                        <div class="line"></div>
                    </div>
                </div>
                <div class="paragraph">
                    <div class="image header">
                        <div class="line"></div>
                        <div class="line"></div>
                    </div>
                </div>
            </div>`;
            break;
        case 'RoleFunctions':
            break;
        default:
            break;
    }
    $(selector).empty().append(skeleton);
}

/**
*將Data插入角色列表
* @param data 角色列表呈現資訊
*/
function CreateRoleListTable(data:RoleListData[]) {
    let trs: string = String.empty;
    $.each(data, function (key, list) { 
        let tr = `<tr>
                      <td>${key + 1}</td>
                      <td>${data[key]['RoleName']}</td>
                      <td>${data[key]['Description']}</td>
                      <td><a href="#" data-RoleId="${data[key]['RoleId']}">${data[key]['AccountCounts']}</a></td>
                  </tr>`;    
     
        trs += tr;
    });
   return trs;
}

/**
 * 創建權限帳戶列表
 * @param data 權限帳戶列表呈現資訊
 */
function CreateAccountListTable(data:AccounrListData[]) {
    let trs: string = String.empty;
    $.each(data, function (key, list) {
        let tr = `<tr>
                      <td>${key + 1}</td>
                      <td>${data[key]['CompanyName']}</td>
                      <td>${data[key]['RoleId']}</td>
                      <td>${data[key]['UserName']}</td>
                      <td>${data[key]['RealName']}</td>
                      <td>${data[key]['PhoneNumber']}</td>
                      <td>${data[key]['CreateUser']}</td>
                  </tr>`; 
        trs += tr;
    });
    return trs;
}

/**
 * 取得平台功能項目清單
 * @param data
 */
function CreateFunctionListPanel(data:FunctionListData[]) {
    let items: string ='';
    $.each(data, function (key, list) {
        let subitems ='';
        let sublistData = data[key]['SubList'];
        const sublistLength: number = sublistData.length;
        if (sublistLength > 0) { 
        $.each(sublistData, function (key, list) {
            let subitem = `<div class="item">
                               <div class="ui child read-only checkbox">
                                   <input type="checkbox" name="function" value="${sublistData[key]['Id']}">
                                   <label>${sublistData[key]['FunctionName']}</label>
                               </div>
                          </div>`;
            subitems += subitem;
        });
        }
        //master
        let item = `
        <div class="item">
            <div class="ui master read-only checkbox">
                <input type="checkbox" name="mainfunction" value="${data[key]['Id']}">
                <label>${data[key]['FunctionName']}</label>
            </div>
            <div class="list">
                ${subitems}
            </div>
        </div>`;
        items += item;
    });
    return items;
}

/**
 * 取得目前選定角色可使用的功能,以顯示在勾選上
 */
function GetRoleFunctions(data: GetRoleFunctionListData[]) {
    let getallcheck: number[] = [];
    $.each(data, function (key, list) {
        let sublistData = data[key]['SubList'];
        const sublistLength: number = sublistData.length;
        if (sublistLength > 0) {
            $.each(sublistData, function (index, value) {
                if (sublistData[index]['Usable'] == true) {
                    let subitemValue: number = Number(sublistData[index]['Id']);
                    getallcheck.push(subitemValue);
                }
            });
        } else {
            if (data[key]['Usable']) {
                $(".master.checkbox:eq("+key+")").checkbox('check');
            } else {
                $(".master.checkbox:eq(" + key + ")").checkbox('uncheck');
            }
        }
    });
    return getallcheck;
}

function MasterCheckbox() {
    $('.list .master.checkbox').checkbox({
            //勾選所有子節點
            onChecked: function () {
                var $childCheckbox = $(this).closest('.checkbox').siblings('.list').find('.checkbox');
                $childCheckbox.checkbox('check');
            },
            //取消所有子節點的勾選
            onUnchecked: function () {
                var $childCheckbox = $(this).closest('.checkbox').siblings('.list').find('.checkbox');
                $childCheckbox.checkbox('uncheck');
            }
        });
}

function ChildCheckbox() {
    $('.list .child.checkbox').checkbox({
        fireOnInit: true,
        // 當任一子節點改變時,改變母節點狀態
        onChange: function () {
            var $listGroup = $(this).closest('.list'),
                $parentCheckbox = $listGroup.closest('.item').children('.checkbox'),
                $checkbox = $listGroup.find('.checkbox'),
                allChecked = true,
                allUnchecked = true;
            // 查看所有鄰居節點是否被勾選
            $checkbox.each(function () {
                if ($(this).checkbox('is checked')) {
                    allUnchecked = false;
                }else {
                    allChecked = false;
                }
            });
            if (allChecked) {
                $parentCheckbox.checkbox('set checked');
            }else if (allUnchecked) {
                $parentCheckbox.checkbox('set unchecked');
            }
            else {
                $parentCheckbox.checkbox('set indeterminate');
            }
        }
    });
}

/**
 * 取得所有勾選的功能項目值
 */
function GetCheckValue(): any[] {
    let allchecked = [];
    $(".master.checkbox.checked input:checkbox,.master.checkbox.indeterminate input:checkbox").each(function () {
        let checkvalue: number = Number($(this).val());
        allchecked.push({ Id: checkvalue });
    });
    $(".list .child.checkbox.checked input:checkbox").each(function () {
        let checkvalue: number = Number($(this).val());
        allchecked.push({ Id: checkvalue });
    });
    console.log(allchecked);
    return allchecked;
}

/**關鍵字過濾列表*/
export function updateFilter(word: string) {
    let filters = [];
    filters.push([
        { field: "CompanyName", type: "like", value: word },
        { field: "RoleId", type: "like", value: word },
        { field: "UserName", type: "like", value: word },
        { field: "RealName", type: "like", value: word },
        { field: "PhoneNumber", type: "like", value: word },
        { field: "CreateUser", type: "like", value: word },
    ]);
    table.setFilter(filters);
}

/**匯出excel,PDF*/
function ExportData() {
    /**匯出*/
   
        let roleName: string = $("#roleName").html();
        let type = $("#exportType").closest(".dropdown").dropdown("get value");
        let filename = `角色列表(${roleName})`;
        switch (type) {
            case "Excel":
                table.download("xlsx", filename + ".xlsx", { sheetName: filename });
                break;
            case "Pdf":
                table.download("pdfmake", filename + ".pdf", {
                    pdfMake: pdfMake,
                    pdfFonts: pdfFonts,
                    vfs: vfs,
                    filename: filename,
                    orientation: 'landscape'
                });
                break;
        }
}

