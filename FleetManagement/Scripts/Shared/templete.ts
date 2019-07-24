/*==============================================
  樣版skeleton
=============================================== */

export function temp_LineParagraph(length: number) {
    if (length < 0) { length = 1;}
    let items: string = `<div class="ui inverted placeholder fluid">`;
    for (let i = 0; i < length; i++) {
        let item = `
        <div class="paragraph">
            <div class="line"></div>
            <div class="line"></div>
            <div class="line"></div>
            <div class="line"></div>
            <div class="line"></div>
        </div>`;
        items += item;
    }
    items += `</div>`;
    return items;
}

export function temp_LineParagraph_white(length: number) {
    if (length < 0) { length = 1; }
    let items: string = `<div class="ui placeholder fluid">`;
    for (let i = 0; i < length; i++) {
        let item = `
        <div class="paragraph">
            <div class="line"></div>
            <div class="line"></div>
            <div class="line"></div>
            <div class="line"></div>
            <div class="line"></div>
        </div>`;
        items += item;
    }
    items += `</div>`;
    return items;
}

/*==============================================
  錯誤樣版
=============================================== */

/**
 * Trace Service
 */
export const CreateTraceList_ERROR: string = 
    `<div class="item white disabled">
        <div class="content">
            <h5 class="ui header green"><span class="ui label red">創建錯誤</span></h5>
            <div class="description">
                無法產生軌跡列表
            </div>
        </div>
    </div>`;

export const CreateTraceList_Empty: string = `
    <div class="item white disabled">
        <div class="content">
            <h5 class="ui header green"><span class="ui label red">查無資訊</span></h5>
            <div class="description">
                查無軌跡資料
            </div>
        </div>
    </div>`;

/**
 * Monitor Service
 */
export const CreateAccrodition_ERROR: string = `
    <div class="title active"> 
        <i class="dropdown icon"></i>讀取車輛下拉列表發生錯誤
    </div>

    <div class="content active"><div class="ui middle aligned divided cushover list">
        <div class="item">
            <div class="right floated content">
                <span class="ui fontred">讀取車輛下拉列表發生錯誤</span>
            </div>
            <div class="left floated content" style="width:130px;">
                <a class="ui red empty circular label"></a>ERROR
            </div>
            <div class="content">
                請確認網路是否斷線或重整頁面
            </div>
        </div>
    </div>
</div>`;

/**
 * Monitor Service
 */
export const CreateCheckboxList_ERROR: string = `
    <div class="field">
        <div class="ui checkbox custom red disabled">
        <input type="checkbox" name="GroupOperation" data-value="-1">
        <label>沒有營運狀態設置</label>
        </div>
    </div>`;
