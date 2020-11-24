var dataOriginal;
$(function () {
    var date_input = $('.dateInput');
    date_input.datepicker({
        format: 'dd/mm/yyyy',
        todayHighlight: true,
        autoclose: true
    });
    $('.div-select').hide();
    checkCheckbox();
    getData();
});

function getData() {
    $.ajax({
        type: "GET",
        url: "/api/getSimStatistic",
        dataType: "json",
        success: function (data) {
            dataOriginal = data.data;
            setTimeout(function () {
                getData();
            }, 5000);
            timKiem();
        }
    });
}

//checkbox
function checkCheckbox() {
    var $chk = $("#grpChkBox input:checkbox"); // cache the selector
    var $tbl = $("#table_sim_box");
    var $tbl_td = $("#bang_sim_box");
    $chk.prop('checked', true); // check all checkboxes when page loads
    $chk.click(function () {
        var colToHide = $tbl.find("." + $(this).attr("name"));
        $(colToHide).toggle();
        var colToHide = $tbl_td.find("." + $(this).attr("name"));
        $(colToHide).toggle();
    });
    $chk.click(function () {
        var colToHide = $tbl_td.find("." + $(this).attr("name"));
        $(colToHide).toggle();
    });
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
        }
    });
}

function genBtnConnect(status, commName) {
    if (status == true) {
        var btnConnect = '<button id="btn_connect" class="btn-action" data-toggle="tooltip"\n' +
            'title="Kết nối" onclick="connectSIM(\'' + commName + '\')" disabled>\n' +
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
            'title="Ngắt kết nối" onclick="disconnectSIM(\'' + commName + '\')" disabled>\n' +
            '<i class="fas fa-unlink text-grey"></i>\n';
        return btnDisconnect;
    }
}

function showMessageList(simID) {
    $('#messageSIM_popup').modal('show');
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
            '<tr>' +
            '<td>' + (i + 1) + '</td>\n' +
            '<td>' + message.id + '</td>\n' +
            '<td>' + message.status + '</td>\n' +
            '<td>' + message.sdt + '</td>\n' +
            '<td>' + message.time + '</td>\n' +
            '<td class="text-left">' + message.content + '</td>' +
            '</tr>';
    }
    $("#message_sim_box_table").html(contentString);
}

function getValueSelect() {
    var selectItem = $("#selectSearch").val();
    $("#inputSIMID").val('');
    $("#inputComm").val('');
    if (selectItem == 1) {
        $("#search_input").hide();
        $('.div-select').hide();
        $("#search_sim_id").show();
    } else if (selectItem == 2) {
        $("#search_input").hide();
        $('.div-select').hide();
        $("#search_comm").show();
    }
}

function removeDisabled() {
    if ($('#tien_nho_hon').is(":checked") == true) {
        $('#so_tien_nho_hon').removeAttr("disabled");
        $('#so_tien_nho_hon').css('background-color', '#ffffff');
    }
    if ($('#tien_nho_hon').is(":checked") == false) {
        $("#so_tien_nho_hon").val('');
        $("#so_tien_nho_hon").prop('disabled', true);
        $('#so_tien_nho_hon').css('background-color', '#f9f9f9');
    }
    if ($('#tien_lon_hon').is(":checked") == true) {
        $('#so_tien_lon_hon').removeAttr("disabled");
        $('#so_tien_lon_hon').css('background-color', '#ffffff');
    }
    if ($('#tien_lon_hon').is(":checked") == false) {
        $("#so_tien_lon_hon").val('');
        $("#so_tien_lon_hon").prop('disabled', true);
        $('#so_tien_lon_hon').css('background-color', '#f9f9f9');
    }

    if ($('#ngay_bat_dau').is(":checked") == true) {
        $('#gia_tri_ngay_bat_dau').removeAttr("disabled");
        $('#gia_tri_ngay_bat_dau').css('background-color', '#ffffff');
    }
    if ($('#ngay_bat_dau').is(":checked") == false) {
        $("#gia_tri_ngay_bat_dau").val('');
        $("#gia_tri_ngay_bat_dau").prop('disabled', true);
        $('#gia_tri_ngay_bat_dau').css('background-color', '#f9f9f9');
    }
    if ($('#ngay_ket_thuc').is(":checked") == true) {
        $('#gia_tri_ngay_ket_thuc').removeAttr("disabled");
        $('#gia_tri_ngay_ket_thuc').css('background-color', '#ffffff');
    }
    if ($('#ngay_ket_thuc').is(":checked") == false) {
        $("#gia_tri_ngay_ket_thuc").val('');
        $("#gia_tri_ngay_ket_thuc").prop('disabled', true);
        $('#gia_tri_ngay_ket_thuc').css('background-color', '#f9f9f9');
    }
    timKiem();
}

function timKiem() {
    var data = dataOriginal.simInfoList;
    var selectedOptionVal = ($('#selectSearch').val() != null) ? $('#selectSearch').val() : 0;
    var simID = ($('#inputSIMID').val() != '') ? $('#inputSIMID').val().trim() : 0;
    var comm = ($('#inputComm').val() != '') ? $('#inputComm').val().trim() : 0;
    var loai_mang_1 = ($('#loai_mang_1').is(":checked") == true) ? 'VNM and VIETTEL' : 0;
    var loai_mang_2 = ($('#loai_mang_2').is(":checked") == true) ? 'VN VINAPHONE' : 0;
    var tien_nho_hon = ($('#tien_nho_hon').is(":checked") == true) ? $('#so_tien_nho_hon').val() : 0;
    var tien_lon_hon = ($('#tien_lon_hon').is(":checked") == true) ? $('#so_tien_lon_hon').val() : 0;
    var ngay_bat_dau = ($('#ngay_bat_dau').is(":checked") == true) ? $('#gia_tri_ngay_bat_dau').val() : 0;
    var ngay_ket_thuc = ($('#ngay_ket_thuc').is(":checked") == true) ? $('#gia_tri_ngay_ket_thuc').val() : 0;

    var simObject = new Object({
        simID: 0,
        comm: '',
        loaiMang: [],
        tienNhoHon: 0,
        tienLonHon: 0,
        ngayBatDau: 0,
        ngayKetThuc: 0
    });
    if (loai_mang_1 != 0) {
        simObject.loaiMang.push(loai_mang_1);
    }
    if (loai_mang_2 != 0) {
        simObject.loaiMang.push(loai_mang_2);
    }
    if (tien_nho_hon != 0) {
        simObject.tienNhoHon = tien_nho_hon;
    }
    if (tien_lon_hon != 0) {
        simObject.tienLonHon = tien_lon_hon;
    }
    if (ngay_bat_dau != 0) {
        simObject.ngayBatDau = ngay_bat_dau;
    }
    if (ngay_ket_thuc != 0) {
        simObject.ngayKetThuc = ngay_ket_thuc;
    }

    if (selectedOptionVal == 0) {
        var resultList = [];
        for (var i = 0; i < data.length; i++) {
            var simInfo = data[i];
            check_money_date(simInfo, simObject, resultList);
        }
        if (resultList.length != 0) {
            showTableFilter(resultList);
        } else {
            $("#bang_sim_box").empty();
        }
    } else if (selectedOptionVal == 1) {
        if (simID != 0) {
            simObject.simID = simID;

            var resultList = [];
            for (var i = 0; i < data.length; i++) {
                var simInfo = data[i];
                if (simInfo.simId.includes(simObject.simID)) {
                    check_money_date(simInfo, simObject, resultList);
                }
            }
            // showTableFilter(resultList);
            if (resultList.length != 0) {
                showTableFilter(resultList);
            } else {
                $("#bang_sim_box").empty();
            }
        } else {
            var resultList = [];
            for (var i = 0; i < data.length; i++) {
                var simInfo = data[i];
                check_money_date(simInfo, simObject, resultList);
            }
            if (resultList.length != 0) {
                showTableFilter(resultList);
            } else {
                $("#bang_sim_box").empty();
            }
        }
    } else if (selectedOptionVal == 2) {
        if (comm != 0) {
            simObject.comm = comm;
            var resultList = [];
            for (var i = 0; i < data.length; i++) {
                var simInfo = data[i];
                if (simInfo.commName.includes(simObject.comm)) {
                    check_money_date(simInfo, simObject, resultList);
                }
            }
            if (resultList.length != 0) {
                showTableFilter(resultList);
            } else {
                $("#bang_sim_box").empty();
            }
        } else {
            var resultList = [];
            for (var i = 0; i < data.length; i++) {
                var simInfo = data[i];
                check_money_date(simInfo, simObject, resultList);
            }
            if (resultList.length != 0) {
                showTableFilter(resultList);
            } else {
                $("#bang_sim_box").empty();
            }
        }
    }
}

function check_money_date(simInfo, simObject, resultList) {
    for (var j = 0; j < simObject.loaiMang.length; j++) {
        if (simObject.loaiMang[j].includes(simInfo.nhaMang)) {
            if (simObject.tienNhoHon == 0 && simObject.tienLonHon == 0) {
                check_date(simInfo, simObject, resultList);
            }
            if (simObject.tienNhoHon != 0 && simObject.tienLonHon == 0) {
                var tongTaiKhoan = simInfo.taiKhoanChinh + simInfo.taiKhoanPhu;
                if (tongTaiKhoan <= simObject.tienNhoHon) {
                    check_date(simInfo, simObject, resultList);
                }
            }
            if (simObject.tienNhoHon == 0 && simObject.tienLonHon != 0) {
                var tongTaiKhoan = simInfo.taiKhoanChinh + simInfo.taiKhoanPhu;
                if (tongTaiKhoan >= simObject.tienLonHon) {
                    check_date(simInfo, simObject, resultList);
                }
            }
            if (simObject.tienNhoHon != 0 && simObject.tienLonHon != 0) {
                var tongTaiKhoan = simInfo.taiKhoanChinh + simInfo.taiKhoanPhu;
                if (simObject.tienLonHon <= tongTaiKhoan && tongTaiKhoan <= simObject.tienNhoHon) {
                    check_date(simInfo, simObject, resultList);
                }
            }
        }
    }
}

function check_date(simInfo, simObject, resultList) {
    if (simObject.ngayBatDau == 0 && simObject.ngayKetThuc == 0) {
        resultList.push(simInfo);
    }
    if (simObject.ngayBatDau != 0 && simObject.ngayKetThuc == 0) {
        var date1 = formatDate(simInfo.ngayHetHan);
        var date2 = formatDate(simObject.ngayBatDau);
        if (date1 <= date2) {
            resultList.push(simInfo);
        }
    }
    if (simObject.ngayBatDau == 0 && simObject.ngayKetThuc != 0) {
        var date1 = formatDate(simInfo.ngayHetHan);
        var date2 = formatDate(simObject.ngayKetThuc);
        if (date1 >= date2) {
            resultList.push(simInfo);
        }
    }
    if (simObject.ngayBatDau != 0 && simObject.ngayKetThuc != 0) {
        var date1 = formatDate(simInfo.ngayHetHan);
        var date2 = formatDate(simObject.ngayBatDau);
        var date3 = formatDate(simObject.ngayKetThuc);
        if (date3 <= date1 && date1 <= date2) {
            resultList.push(simInfo);
        }
    }
}

function formatDate(date) {
    var parts = date.split("/");
    var date = new Date(parts[1] + "/" + parts[0] + "/" + parts[2]);
    return date.getTime();
}

function showTableFilter(data) {

    $("#bang_sim_box").empty();
    $("#span_tong_so_sim").html(data.length);
    $("#span_sim_hoat_dong").html(dataOriginal.simDangHoatDong);
    $("#span_khe_sim_trong").html(dataOriginal.kheTrong);
    $("#span_sim_sap_het_tien").html(dataOriginal.simSapHetTien);
    $("#span_sim_het_tien").html(dataOriginal.simHetTien);
    $("#span_sim_sap_het_han").html(dataOriginal.simSapHetHan);
    $("#span_sim_het_han").html(dataOriginal.simHetHan);

    var contentString = "";
    for (var i = 0; i < data.length; i++) {
        var simInfo = data[i];
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
            '<td id="stt">' + (i + 1) + '</td>\n' +
            '<td id="simID">' + simInfo.simId + '</td>\n' +
            '<td id="nhaMang">' + simInfo.nhaMang + '</td>\n';

        var checkTaiKhoan = '';
        if (simInfo.isHetTien == false && simInfo.isSapHetTien == false) {
            checkTaiKhoan = '<td id="taiKhoanChinh">' + simInfo.taiKhoanChinh + '</td>\n';
        } else if (simInfo.isHetTien == true) {
            checkTaiKhoan = '<td id="taiKhoanChinh" style="background-color: rgba(255,73,93,0.42)">' + simInfo.taiKhoanChinh + '</td>\n';
        } else if (simInfo.isSapHetTien == true) {
            checkTaiKhoan = '<td id="taiKhoanChinh" style="background-color: rgba(255,208,42,0.43)">' + simInfo.taiKhoanChinh + '</td>\n';
        }
        contentString = contentString + checkTaiKhoan;
        contentString = contentString + '<td id="taiKhoanPhu">' + simInfo.taiKhoanPhu + '</td>\n';

        var checkNgayHetHan = '';
        if (simInfo.isHetHan == false && simInfo.isSapHetHan == false) {
            checkNgayHetHan = '<td id="ngayHetHan">' + simInfo.ngayHetHan + '</td>\n';
        } else if (simInfo.isHetHan == true) {
            checkNgayHetHan = '<td id="ngayHetHan" style="background-color: rgba(255,73,93,0.42)">' + simInfo.ngayHetHan + '</td>\n';
        } else if (simInfo.isSapHetHan == true) {
            checkNgayHetHan = '<td id="ngayHetHan" style="background-color: rgba(255,208,42,0.43)">' + simInfo.ngayHetHan + '</td>\n';
        }
        contentString = contentString + checkNgayHetHan;
        contentString = contentString +
            '<td id="tinHieu">' + simInfo.tinHieu + '</td>\n' +
            '<td id="tinNhan">' +
            '<button class="btn-action bg-info" data-toggle="tooltip" title="Xem danh sách tin nhắn" onclick="showMessageList(' + simInfo.simId + ')">' + simInfoMessagesListSize + '</button>' +
            '</td>\n' +
            '<td id="comm">' + simInfo.commName + '</td>\n' +
            '<td id="hanhDong"><div>\n' + genBtnConnect(simInfo.isConnected, String(simInfo.commName)) +
            genBtnDisconnect(simInfo.isConnected, String(simInfo.commName)) +
            '<button id="btn_reload" class="btn-action" data-toggle="tooltip"\n' +
            'title="Kết nối lại" onclick="reloadSIM(\'' + simInfo.commName + '\')">\n' +
            '<i class="fas fa-sync text-success"></i>\n' +
            '</button>\n' +
            '</div>\n' +
            '</td>\n' +
            '</tr>';
    }
    $("#bang_sim_box").html(contentString);
}


