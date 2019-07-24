/**Monitor服務方法規格*/
export interface IMonitorService {

    /**頁面載入時顯示車輛群組資訊*/
    CallCarGroups(sort: number);

    /**
     * 輸入地址以顯示在地圖上
     * @param word
     */
    SearchAddressByWord(word: string);

   /**
    * 判斷狀態並回傳顏色
    * @param Number
    */
    JudgeCStatusToReturnColor(Number: number);

    ///*重排序車輛列表*/
    //SortCarGroups(sort: number);


    ///**警報開啟顯示*/
    //CallAlert(open: boolean);

    // /**關鍵字搜尋司機或車輛*/
    //SearchCarDriverByWord(word: string);
}

/**位置modal(同google格式)*/
export interface Location {

    /**緯度*/
    lat: number;

    /**經度*/
    lng: number;
}

/**回傳API*/
export interface GetMonitorData{
    GroupOperation: Operation[];
    CarGroups: CarGroups[];
}

/**營運分類群組*/
interface Operation {
    StatusCode: number;
    StatusText: string;
    BelongCStatusName: string[];
    BelongCStatus: number[];
}

/**群組車輛資訊*/
export interface CarGroups{

    /**公司編號*/
    CompanyId: number;

    /**公司名稱*/
    CompanyName: string;

    /**群組編號*/
    GroupId: number;

    /**群組名稱*/
    GroupName: string;

    /**群組車輛資訊*/
    Cars: Cars[];
}

/**車輛資訊*/
export interface Cars {
    VehicleId: number;
    VehicleNo: string;
    DriverUserId: string;
    DriverName: string;
    cStatus: number;
    OperationalStatus: string;
    StatusColor: number;
    CarIcon: string;
    MessageId: string;
    LastCoordinate: LastCoordinate;
    UpdateTime: string;
}

/**車輛最後位置資訊*/
 interface LastCoordinate {
    Latitude: number;
    Longitude: number;
    GAngle: number;
    Direction: string;
}

/**標註資訊*/
export interface LocationInfo {

    /**營運狀態標註*/
    cstatus: number;

    /**DriverUserId*/
    driveruseId: string;

    /**標註圖片*/
    markerimg: string;

    /*目前地點緯度**/
    CurrentLatitude: number;

    /**目前地點經度*/
    CurrentLongitude: number;

    /**訂單編號*/
    MessageId: string;

    /**貨主姓名 */
    GoodsOwnerName: string;

    /**預約狀態*/
    ProcessStatus: string;

    /**預約狀態名稱 */
    ProcessStatusName: string;

    /**收貨地址 */
    StartAddress: string;

    /**送達地址 */
    TargetAddress: string;

    /**回復狀態*/
    ReplyStatus: number;

    /**產生日期*/
    CreateTime: string;

    /**司機資訊*/
    Driver: Driver;

    /**車輛資訊*/
    Car: Car;

    /**最後位置資訊*/
    LastPosition: LastPosition;
}

/**司機資訊*/
export interface Driver {
    PhotoUrl: string;
    DriverName: string;
    PhoneNumber: string;
    DriverId: string;
}

/**車輛資訊*/
export interface Car {
    LicenseNumber: string;
    VehicleCallNo: string;
}

/**最後位置資訊*/
export interface LastPosition {
    Latitude: number;
    Longitude: number;
}

/**自定義的標註群組(含google.maps.Marker)*/
export interface cusmarker {
    MarkerId: string;
    cstatus: number;
    Angle: number;
    DriverUserId: string;
    VehicleId: number;
    GroupId: number;
    MessageId: string;
    googlemarker: google.maps.Marker;
}

/**自定義的標註資訊格式*/
export interface mapmarker {
    cstatus: number;
    Angle: number;
    DriverUserId: string;
    VehicleId: number;
    GroupId: number;
    MessageId: string;
    position: position;
    CarIcon: string;
    LicenseNumber: string;
    DriverName: string;
}

/**經緯度(同google格式)*/
export interface position {
    lat: number;
    lng: number;
}

/**軌跡回傳格式*/
export interface TraceData {
    LocalTime: string;
    GLat: number;
    GLng: number;
}

/**所有營運狀態資訊*/
export interface OptionalStatusDropDown {
    CStatus1: number;
    StatusName: string;
    ColorType: number;
}

/**司機位置MQTT資料*/
export interface MqttDriverLocation {
   Address: string;
   CStatus: number;
   DriverId: string;
   GAngle: number;
   GLat: number;
   GLatNS: string;
   GLng: number;
   GLngEW: string;
   GSpeed: number;
   GStatus: string;
   GpsStrength: number;
   SignalStrength: number;
   MessageId: string;
   TimeZone: number;
   UtcTime: string;
   VehicleId:number;
}

export interface CreateAccroditionResult {
    templete: string;
    emptycarDrivers: string[];
}

/**
 車輛狀態
 0 = 派車中, 1 = 前往, 2 = 拒絕, 3 = 到達, 4 = 取消,
 5 = 拖到, 6 = 未拖到, 7 = 空車, 8 = 登出, 9 = 排班, 10 = 離線
*/
//export const enum Cstatus {
//    Dispath = 0,
//    Goto = 1,
//    Reject = 2,
//    Arrival = 3,
//    Cancel = 4,
//    HasTow = 5,
//    NotTiw = 6,
//    EmptyCar = 7,
//    LogOut = 8,
//    Shift = 9,
//    OutLine=10
//}

/** 
 *  營業狀態 enum 
 *  0空車、1前往、2定點、3上貨、4送達、5簽收、7關機、9休息
 */
export const enum CStatusEnum {

    //空車
    EmptyCar = 0,

    //前往
    Goto = 1,

    //定點
    Arrival = 2,

    //上貨
    Hired = 3,

    //送達
    Getoff = 4,

    //簽收
    SignFor = 5,

    //關機
    Close = 7,

    //休息
    release = 9,

    //離線
    Offline=10
}

/**
營運大類
1=未營運,2=營運中,3=警示,4=空車
*/
export const enum OperationType {
    NotOpen = 1,
    Open = 2,
    Alert = 3,
    Empty=4
}

