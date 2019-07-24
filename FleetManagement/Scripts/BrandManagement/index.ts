
import * as s from './service';

let service = new s.BrandManagementService();

//新增廠商群組
$("#CompanyGroupsForm").on('submit', function (event) {
    event.preventDefault();

    let CompanyId: Number = <Number>$("#Company_CompanyId").val();
    let GroupName: string = <string>$("#GroupName").val();
    
    //目前尚未有以下輸入參數
    let GroupType: string = '';

    service.CreateCompanyGroup({
        CompanyId: CompanyId,
        GroupName: GroupName
    });
});

//編輯廠商群組
$("#CompanyGroupsBody").on("click", "form div button", function () {

    let editGroupId: Number = parseInt($(this).attr("editGroupId"), 10);
    let deleteGroupId: Number = parseInt($(this).attr("deleteGroupId"), 10);
    let editGroupVehicle: Number = parseInt($(this).attr("editGroupVehicle"), 10);

    let CompanyId: Number = <Number>$("#Company_CompanyId").val();
    let GroupName: string = <string>$("#GroupName_" + editGroupId).val();
    let Control: string = <string>($(this).attr("Control"));

    //編輯
    if (editGroupId.toString() != "NaN") {
        service.UpdateCompanyGroup({
            CompanyId: CompanyId,
            Groupid: editGroupId,
            GroupName: GroupName
        });
    }

    //刪除
    if (deleteGroupId.toString() != "NaN") {
        var isConfirm = confirm("確定刪除群組？");
        if (isConfirm) {
            service.DeleteCompanyGroup({ companyGroupId: deleteGroupId })
        }
    }

    //編輯廠商車隊車輛
    if (editGroupVehicle.toString() != "NaN") {
        sessionStorage.setItem("selectedGroupId", editGroupVehicle.toString());
        window.location.href = '../BrandManagement/EditGroupVehicle?CompanyId=' + CompanyId
            + '&GroupId=' + editGroupVehicle
            + '&Control=' + Control;
    }
});

//
//將已選取的 Selected
//

//公司司機車輛
$("#UpdateCompanyDriverVehiclesBtn").click(function () {
    $("#sourceUserVehicleList option").prop('selected', true);
});

//
//已選取與未選取函式
//

//選取車輛進已選取
$("#addVehicle").click(function () {
    SelectVehicleIntoAlreadySelected();
});

//選取已選擇車輛進未選取
$("#removeVehicle").click(function () {
    SelectAlreadySelectedVehicleIntoNoSelected();
})

//雙擊Listbox-已選取->未選取
$("#sourceUserVehicleList").dblclick(function () {
    SelectAlreadySelectedVehicleIntoNoSelected();
})

//雙擊Listbox 未選取--> 已選取
$("#notSelectedUserVehicleList").dblclick(function () {
    SelectVehicleIntoAlreadySelected();
})

//將已選取的 Selected
$("#UpdateCompanyGroupVehiclesBtn").click(function () {
    $("#sourceUserVehicleList option").prop('selected', true);
});


//
//返回
//

//返回另一公司群組頁
$("#backToCompanyGroupBtn").click(function () {
    var CompanyId = $("#CompanyId").val();
    window.location.href = '../BrandManagement/CompanyGroup?CompanyId=' + CompanyId;
});

//返回帳號列表
$("#backToWebAccountBtn").click(function () {
    var CompanyId = $("#CompanyId").val();
    window.location.href = '../WebAccount/Index';
});

/**
 * 選取車輛進已選取
 */
function SelectVehicleIntoAlreadySelected() {
    $('#notSelectedUserVehicleList').find('option:selected').each(function () {
        $('#sourceUserVehicleList').append($('<option></option>').val($(this).val()).text($(this).text()));
        $(this).remove();
    })
}

/**
 * 選取已選擇車輛進未選取
 */
function SelectAlreadySelectedVehicleIntoNoSelected() {
    $("#sourceUserVehicleList").find('option:selected').each(function () {
        $('#notSelectedUserVehicleList').append($('<option></option>').val($(this).val()).text($(this).text()));
        $(this).remove();
    })
}