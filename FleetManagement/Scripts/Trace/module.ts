/** Trace服務方法規格*/
export interface ITraceService {

    /**地圖初始化*/
    initmap();

    /**
     * 點擊軌跡事件
     * @param data
     */
    traceEventClick(data: TracePoint);
}

/*經緯度*/
export interface Coordinate {

    /**緯度*/
    latitude: number;

    /**經度*/
    longitude: number
}

/**軌跡點資訊*/
export interface TracePoint {
    Address: string;
    CarNo: string;
    FrontPhoto: string;
    DriverName: string;
    DriverPhone: string;
    GPSStrength: number;
    KMperHour: number;
    Latitude: number;
    Longitude: number;
    OperationalStatus: string;
    RecordTime: string;
    SignalStrength: number;
    MessageId: string;
    CStatus: number;
}

/**軌跡查詢條件 */
export interface SearchTraceViewModel {

    /**開始時間*/
    BeginDateTime: string;

    /**結束時間*/
    EndDateTime: string;

    /**司機userId*/
    DriverId: string;

    /**車輛編號*/
    VehicleId?: number;
}

/**所有軌跡點資訊*/
export interface TracePoints {

    /**查詢的開始時間(剛剛前端丟給系統的)*/
    BeginDateTime: string;

    /**查詢的結束時間(剛剛前端丟給系統的)*/
    EndDateTime: string;

    /**司機編號*/
    DriverId: number;

    /**車輛編號*/
    VehicleId: number;

    /**軌跡多點資訊*/
    TraceList: TracePoint[];
}

/**軌跡查詢條件:MessageId */
export interface MessageIdModel {
    MessageId: string;
}

/**搜尋結果 */
export interface SearchResultList {

    /** 時間*/
    RecordTime: string,

    /** 狀態*/
    OperationalStatus: string,

    /** 速度*/
    KMperHour: number,

    /** 緯度*/
    Latitude: number,

    /** 經度*/
    Longitude: number
}

/**所有營運狀態資訊*/
export interface OptionalStatusDropDown {
    CStatus: number;
    CStatusName: string;
    ColorType: number;
}