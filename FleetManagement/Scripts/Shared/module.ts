import { RelativePath } from "./enum";

/**訊息區塊的種類*/
export enum InfoType {

    /**一般訊息*/
    common = 'icon',

    /**提供資訊訊息*/
    info = 'info',

    /**成功訊息*/
    success = 'positive',

    /**錯誤訊息*/
    error = 'negative',

    /**警告訊息*/
    warning = 'yellow',

    /**黑色訊息*/
    black = 'black',

    /**加載中訊息*/
    loading = 'info'
}

/**HttpStatusCode狀態碼定義*/
export enum HttpStatusCode {

    /**請求已成功*/
    OK = 200,

    /**請求已經被實現，而且有一個新的資源已經依據請求的需要而建立*/
    CREATED = 201,

    /**伺服器已接受請求，但尚未處理。最終該請求可能會也可能不會被執行，並且可能在處理發生時被禁止。*/
    ACCEPTED = 202,

    /**伺服器成功處理了請求，沒有返回任何內容*/
    NO_CONTENT = 204,

    /**伺服器成功處理了請求，但沒有返回任何內容。與204回應不同，此回應要求請求者重設文件視圖。*/
    RESET_CONTENT = 205,

    /**用戶端錯誤，伺服器不會處理該請求*/
    BAD_REQUEST = 400,

    /**當前請求需要用戶驗證*/
    UNAUTHORIZED = 401,

    /**請求失敗，請求所希望得到的資源未被在伺服器上發現*/
    NOT_FOUND = 404,

    /**請求行中指定的請求方法不能被用於請求相應的資源*/
    METHOD_NOT_ALLOWED = 405,

    /**在請求頭Expect中指定的預期內容無法被伺服器滿足*/
    EXPECTATION_FAILED = 417,

    /**伺服器錯誤*/
    INTERNAL_SERVER_ERROR = 500,

    /**伺服器不支援當前請求所需要的某個功能*/
    NOT_IMPLEMENTED = 501,

    /**由於臨時的伺服器維護或者過載，伺服器當前無法處理請求*/
    SERVICE_UNAVAILABLE = 503,

    /**用戶端需要進行身分驗證才能獲得網路存取權限*/
    NETWORK_AUTHENTICATION_REQUIRED = 511,

    /**目前查無資料*/
    NoDataCurrent = 477,
}

/**列印類型*/
export enum PrintType {
    portrait = "portrait",
    landscape = "landscape"
}

/**共用的後端返回Modal*/
export interface ResponseViewModel {

     /**HttpStatusCode狀態碼*/
    HttpStatusCode: number; 

     /**是否成功*/
    Success: boolean;

     /**訊息，可為空值*/
    Message?: string;

     /**資料,不限格式，可為空值*/
    Data?: any;

     /**例外狀況，可為空值*/
    Exception?: string,

     /**反應時間*/
    ResponseTime: string
}

/**
 *創建訊息區塊
 * @param infoType 訊息種類
 * @param iconClass 符號的css class
 * @param header 訊息的標題(最明顯)
 * @param message 訊息
 */
export function CreateMessage(infoType: InfoType, iconClass: string, header: string, message: string, ) {
    switch (infoType) {
        case InfoType.success:
            iconClass = 'check';
            break;
        case InfoType.error:
            iconClass = 'close';
            break;
        case InfoType.info:
            iconClass = 'info circle';
            break;
        case InfoType.loading:
            iconClass = 'notched circle loading';
            break;
        default:
            break;
      }
    let div: string = `<div class="ui ${infoType} message"><i class="${iconClass}"></i><div class="content"><div class="header">${header}</div><p>${message}</p></div></div>`;
    return div;
}

/**傳輸方法*/
type ajaxType = 'POST' | 'GET' | 'DELETE' | 'UPDATE';

/**資料型態*/
type ajaxDataType = 'xml' | 'json' | 'script' | 'html';

/**AJAX參數*/
export interface AjaxOption {

    /**傳輸路徑*/
    url: string;

    /**資料方法*/
    type: ajaxType;

    /**資料型態*/
    dataType: ajaxDataType;

    /**傳輸資料*/
    data?: string[] | object;

    /**是否快取 */
    cache?: boolean | false;
}

/**
 * 包裝AJAX函數
 * @param Ajaxopion 設定Ajax參數
 * @param successCallback 成功函數
 * @param errorCallback 失敗函數
 * @param beforeCallback 提交前函數(可為空值)
 * @param completeCallback 完成時函數(可為空值)
 */
export function DoAjax(Ajaxopion: AjaxOption, successCallback: Function, errorCallback:Function, beforeCallback?:Function, completeCallback?:Function) {
    $.ajax({
        url: RelativePath.ConstName + Ajaxopion.url,
        type: Ajaxopion.type,
        contentType: "application/json; charset=utf-8",
        dataType: Ajaxopion.dataType,
        cache: Ajaxopion.cache,
        data: JSON.stringify(Ajaxopion.data),
        beforeSend: function () {
            if (typeof beforeCallback === "function") {
                beforeCallback();
            }
        },
        success: function (res) {
            successCallback(res);
        },
        error: function (res) {
            errorCallback(res);
        },
        complete: function () {
            if (typeof completeCallback === "function") {
                completeCallback();
            }
        }
    });
}

/**定義MQTT服務*/
export interface IMQTTService {

    /**開始進行連線*/
    DoConnect(mqttHost: string, mqttport: number, mqttuseSSL: boolean, subscribeName: string);

     /**當客戶端連接時*/
    onConnect(subscribeName: string);

     /**當客戶端失去連接時調用*/
    onConnectionLost(responseObject);

     /**消息到達時調用*/
    onMessageArrived(message);

     /**中斷連線*/
    doDisconnect();
}

/**定義共用服務*/
export interface ICommonService {

    /*尋找角色功能清單*/
    FindFunctionList(input: FindFunctionModel);

    /**
     * 依照車主取得車牌號碼下拉選單
     * @param DriverId
     * @param IdName
     */
    GetDriverVehicles(DriverId, IdName);

    /**
     * 刪除照片
     * @param input
     */
    DeletePhoto(input: PhotoModel);
}

/*搜尋功能模型*/
export interface FindFunctionModel {
    RoleId: string
}

/*相片 輸入Model*/
export interface PhotoModel {
    Id: string,
    PhotoFileName: string,
    GoodOwnerId: string,
    MessageId: string
}

