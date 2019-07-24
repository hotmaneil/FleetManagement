import { CStatusEnum, OperationType } from './module';
import { RelativePath } from '../Shared/enum';

/**
 * 由車輛狀態取的初始化車輛圖片(角度都為０)
 * 0空車、1前往、2定點、3上貨、4送達、5簽收、7關機、9休息
 *  未營運Gray: 7關機
 *  營運中Red: 1前往、2定點、3上貨、4送達、5簽收
 *  空車Green: 0空車 ,9休息
 *  10 離線
 * @param cStatus
 */
export function GetInitCarImageByFlowStatus(cStatus: CStatusEnum) {
    let imgurl: string = RelativePath.ConstName+"Content/images/Icon/CAR/C000_";
    switch (cStatus) {
        case 7:
        case null:
        case 10:
            imgurl += "Gray.gif";
            break;
        
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
            imgurl += "Red.gif";
            break;

        case 0:
        case 9:
            imgurl += "Green.gif";
            break;
    }
    return imgurl

}