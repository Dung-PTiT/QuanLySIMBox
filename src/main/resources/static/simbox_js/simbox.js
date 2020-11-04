$(document).ready(function () {
    getData();
});

function getData() {
    $.ajax({
        type: "GET",
        url: "/api/getSimStatistic",
        dataType: "json",
        success: function (data) {
            console.log(data);
            showTable(data.data);
        }
    });
}

function showTable(data) {
    $("#span_tong_so_sim").html(data.simInfoList.length);
    $("#span_sim_hoat_dong").html(data.simDangHoatDong);
    $("#span_khe_sim_trong").html(data.kheTrong);
    $("#span_sim_sap_het_tien").html(data.simSapHetTien);
    $("#span_sim_het_tien").html(data.simHetTien);
    $("#span_sim_sap_het_han").html(data.simSapHetHan);
    $("#span_sim_het_han").html(data.simHetHan);

    var contentString = "";
    for (var i = 0; i < data.simInfoList.length; i++) {
        var simInfo = data.simInfoList[i];
        if (simInfo.taiKhoanChinh < 0) {
            simInfo.taiKhoanChinh = '-';
        }
        if (simInfo.taiKhoanPhu < 0) {
            simInfo.taiKhoanPhu = '-';
        }
        contentString = contentString +
            '<tr>\n' +
            '                                <td class="stt">' + (i + 1) + '</td>\n' +
            '                                <td class="simID">' + simInfo.simId + '</td>\n' +
            '                                <td class="nhaMang">' + simInfo.nhaMang + '</td>\n' +
            '                                <td class="taiKhoanChinh">' + simInfo.taiKhoanChinh + '</td>\n' +
            '                                <td class="taiKhoanPhu">' + simInfo.taiKhoanPhu + '</td>\n' +
            '                                <td class="ngayHetHan">' + simInfo.ngayHetHan + '</td>\n' +
            '                                <td class="tinHieu">' + simInfo.tinHieu + '</td>\n' +
            '                                <td class="tinNhan">' + simInfo.messagesList.length + '</td>\n' +
            '                                <td class="comm">' + simInfo.commName + '</td>\n' +
            '                                <td class="hanhDong"><div>\n' + genBtnConnect(simInfo.isConnected, simInfo.commName) +
            genBtnDisconnect(simInfo.isConnected, simInfo.commName) +
            '                                        <button id="btn_reload" class="btn-action" data-toggle="tooltip"\n' +
            '                                                title="Đồng bộ" onclick="reloadSIM(' + simInfo.commName.substring(3) + ')">\n' +
            '                                            <i class="fas fa-sync text-success"></i>\n' +
            '                                        </button>\n' +
            '                                    </div>\n' +
            '                                </td>\n' +
            '                            </tr>';
    }
    $("#bang_sim_box").html(contentString);
}

function connectSIM(commName) {
    var commValue = 'COM' + commName;
    $.ajax({
        type: "POST",
        url: "/api/connect",
        dataType: "json",
        data: {
            "commName": commValue
        },
        success: function () {
            location.reload();
        }
    });
}

function disconnectSIM(commName) {
    var commValue = 'COM' + commName;
    $.ajax({
        type: "POST",
        url: "/api/disconnect",
        dataType: "json",
        data: {
            "commName": commValue
        },
        success: function () {
            location.reload();
        }
    });
}

function reloadSIM(commName) {
    var commValue = 'COM' + commName;
    $.ajax({
        type: "POST",
        url: "/api/reconnect",
        dataType: "json",
        data: {
            "commName": commValue
        },
        success: function () {
            location.reload();
        }
    });
}

function genBtnConnect(status, commName) {
    if (status == true) {
        var btnConnect = '<button id="btn_connect" class="btn-action" data-toggle="tooltip"\n' +
            'title="Đang kết nối" onclick="connectSIM(' + commName.substring(3) + ')" disabled>\n' +
            '<i class="fas fa-link v"></i>\n';
        return btnConnect;
    } else {
        var btnConnect = '<button id="btn_connect" class="btn-action" data-toggle="tooltip"\n' +
            'title="Kết nối" onclick="connectSIM(' + commName.substring(3) + ')">\n' +
            '<i class="fas fa-link text-blue"></i>\n';
        return btnConnect;
    }
}

function genBtnDisconnect(status, commName) {
    if (status == true) {
        var btnDisconnect = '<button id="btn_disconnect" class="btn-action" data-toggle="tooltip"\n' +
            'title="Ngắt kết nối" onclick="disconnectSIM(' + commName.substring(3) + ')">\n' +
            '<i class="fas fa-unlink text-danger"></i>\n' +
            '</button>\n';
        return btnDisconnect;
    } else {
        var btnDisconnect = '<button id="btn_connect" class="btn-action" data-toggle="tooltip"\n' +
            'title="Kết nối" onclick="disconnectSIM(' + commName.substring(3) + ')" disabled>\n' +
            '<i class="fas fa-unlink text-grey"></i>\n';
        return btnDisconnect;
    }
}