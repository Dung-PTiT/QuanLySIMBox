var dataOriginal;
var dataToShow;
$(document).ready(function () {
  checkCheckbox();
    getData();
});

function checkCheckbox() {
    var $chk = $("#grpChkBox input:checkbox"); // cache the selector
    var $tbl = $("#table_sim_box");
    $chk.prop('checked', true); // check all checkboxes when page loads
    $chk.click(function () {
        var colToHide = $tbl.find("." + $(this).attr("name"));
        $(colToHide).toggle();
    });
}

function showHideColumn() {
    var nameList = [
        'stt',
        'simID',
        'nhaMang',
        'taiKhoanChinh',
        'taiKhoanPhu',
        'ngayHetHan',
        'tinHieu',
        'tinNhan',
        'comm',
        'hanhDong'
    ];

    for (var i = 0; i < nameList.length; i++) {
        var name = nameList[i];
        if ($('input[name="' + name + '"]:checked').serialize() != '') {
            $("." + name + "").show();
            console.log(1);
        } else {
            $("." + name + "").hide();
            console.log(0);
        }
    }
}

function getData() {
    $.ajax({
        type: "GET",
        url: "/api/getSimStatistic",
        dataType: "json",
        success: function (data) {
            setTimeout(function () {
                getData();
            }, 10000);
            dataOriginal = data.data;
            showTable(dataOriginal);
        }
    });
}

$(function () {
    var $chk = $("#grpChkBox input:checkbox"); // cache the selector
    var $tbl = $("#table_sim_box");
    var $tbl_body = $("#bang_sim_box");
    $chk.prop('checked', true); // check all checkboxes when page loads

    $chk.click(function () {
        var colToHide = $tbl.find("." + $(this).attr("name"));
        $(colToHide).toggle();
        var colToHideTd = $tbl_body.find("." + $(this).attr("name"));
        $(colToHideTd).toggle();
    });
    $chk.click(function () {
        var colToHideTd = $tbl_body.find("." + $(this).attr("name"));
        (colToHideTd).toggle();
    });
});

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
        var simInfoMessagesListSize;
        if (simInfo.messagesList == null) {
            simInfoMessagesListSize = '-';
        } else {
            simInfoMessagesListSize = simInfo.messagesList.length;
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
            '                                <td class="tinNhan">' +
            '<button class="btn-action bg-info" data-toggle="tooltip" title="Xem danh sách tin nhắn" onclick="showMessageList(' + simInfo.simId + ')">' + simInfoMessagesListSize + '</button>' +
            '</td>\n' +
            '                                <td class="comm">' + simInfo.commName + '</td>\n' +
            '                                <td class="hanhDong"><div>\n' + genBtnConnect(simInfo.isConnected, String(simInfo.commName)) +
            genBtnDisconnect(simInfo.isConnected, String(simInfo.commName)) +
            '                                        <button id="btn_reload" class="btn-action" data-toggle="tooltip"\n' +
            '                                                title="Đồng bộ" onclick="reloadSIM(\'' + simInfo.commName + '\')">\n' +
            '                                            <i class="fas fa-sync text-success"></i>\n' +
            '                                        </button>\n' +
            '                                    </div>\n' +
            '                                </td>\n' +
            '                            </tr>';
    }
    $("#bang_sim_box").html(contentString);
        showHideColumn();
}

function connectSIM(commName) {
    $.ajax({
        type: "POST",
        url: "/api/connect",
        dataType: "json",
        data: {
            "commName": commName
        },
        success: function () {
            location.reload();
        }
    });
}

function disconnectSIM(commName) {
    $.ajax({
        type: "POST",
        url: "/api/disconnect",
        dataType: "json",
        data: {
            "commName": commName
        },
        success: function () {
            location.reload();
        }
    });
}

function reloadSIM(commName) {
    $.ajax({
        type: "POST",
        url: "/api/reconnect",
        dataType: "json",
        data: {
            "commName": commName
        },
        success: function () {
            location.reload();
        }
    });
}

function genBtnConnect(status, commName) {
    if (status == true) {
        var btnConnect = '<button id="btn_connect" class="btn-action" data-toggle="tooltip"\n' +
            'title="Đang kết nối" onclick="connectSIM(\'' + commName + '\')" disabled>\n' +
            '<i class="fas fa-link v"></i>\n';
        return btnConnect;
    } else {
        var btnConnect = '<button id="btn_connect" class="btn-action" data-toggle="tooltip"\n' +
            'title="Kết nối" onclick="connectSIM(\'' + commName + '\')">\n' +
            '<i class="fas fa-link text-blue"></i>\n';
        return btnConnect;
    }
}

function genBtnDisconnect(status, commName) {
    if (status == true) {
        var btnDisconnect = '<button id="btn_disconnect" class="btn-action" data-toggle="tooltip"\n' +
            'title="Ngắt kết nối" onclick="disconnectSIM(\'' + commName + '\')">\n' +
            '<i class="fas fa-unlink text-danger"></i>\n' +
            '</button>\n';
        return btnDisconnect;
    } else {
        var btnDisconnect = '<button id="btn_connect" class="btn-action" data-toggle="tooltip"\n' +
            'title="Kết nối" onclick="disconnectSIM(\'' + commName + '\')" disabled>\n' +
            '<i class="fas fa-unlink text-grey"></i>\n';
        return btnDisconnect;
    }
}

function showMessageList(simID) {
    $('#messageSIM_popup').modal('show');
    console.log(dataOriginal.simInfoList);
    var simInfoList = dataOriginal.simInfoList;
    var messageList = [];
    for (var i = 0; i < simInfoList.length; i++) {
        if (simInfoList[i].simId == simID) {
            messageList = simInfoList[i].messagesList;
        }
    }
    var contentString = "";
    for (var i = 0; i < messageList.length; i++) {
        var message = messageList[i];
        contentString = contentString +
            '<tr><td>' + (i + 1) + '</td>\n' +
            '                                    <td>' + message.mgsId + '</td>\n' +
            '                                    <td>' + message.status + '</td>\n' +
            '                                    <td>' + message.sdt + '</td>\n' +
            '                                    <td>' + message.time + '</td>\n' +
            '                                    <td class="text-left">' + message.content + '</td></tr>';
    }
    $("#message_sim_box_table").html(contentString);
}