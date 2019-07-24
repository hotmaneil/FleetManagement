import {
    IMonitorService,
    CStatusEnum
} from './module';

import {
    HttpStatusCode,
    CreateMessage,
    InfoType,
    DoAjax,
    AjaxOption
} from '../Shared/module';

import {
    Search,
    DealDataFromAPI,
    FullScreen
} from './mapfunction';

export class MonitorService implements IMonitorService {

    /** 頁面載入時顯示車輛群組資訊 */
    CallCarGroups() {
        let _this = this;
        let setting: AjaxOption = {
            url: '/Monitor/GetMonitorData',
            type: 'GET',
            dataType: 'json'
        };

        DoAjax(setting,
            function (res) {
                DealDataFromAPI(res.Data);
            },
            function (res) { 
                toastr["error"]("載入車輛群組下拉列表發生錯誤");
            },
            null, null);
    }

    /**
     * 輸入地址以顯示在地圖上
     * @param word
     */
    SearchAddressByWord(word: string) {
        Search(word);
    }

   /**
    * 判斷狀態並回傳顏色
    * @param Number
    */
    JudgeCStatusToReturnColor(Number: number) {

        switch (Number) {
            case CStatusEnum.EmptyCar:
                return "teal";
                break;

            case CStatusEnum.Goto:
                return "olive";
                break;

            case CStatusEnum.Arrival:
            case CStatusEnum.Hired:
                return "blue";
                break;

            case CStatusEnum.Offline:
            case CStatusEnum.Close:
                return "grey";
                break;

            case CStatusEnum.Getoff:
            case CStatusEnum.SignFor:
                return "orange";
                break;
        }
    }
}