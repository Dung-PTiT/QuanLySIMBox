var dataOriginal = {
    "success": true,
    "data": {
        "simDangHoatDong": 2,
        "kheTrong": 14,
        "simSapHetTien": 0,
        "simHetTien": 0,
        "simSapHetHan": 0,
        "simHetHan": 0,
        "simInfoList": [
            {
                "commName": "COM25",
                "simId": "452048834505162",
                "nhaMang": "VNM and VIETTEL",
                "taiKhoanChinh": 30000,
                "taiKhoanPhu": 10000,
                "ngayHetHan": "06/11/2020",
                "tinHieu": 30.99,
                "lastMsgId": 1,
                "messagesList": [
                    {
                        "id": 1,
                        "status": "REC READ",
                        "sdt": "+84354576363",
                        "time": "20/11/0217:04:51+28",
                        "content": "New"
                    }
                ],
                "deviceCode": "",
                "isConnected": true,
                "isSapHetTien": false,
                "isHetTien": false,
                "isSapHetHan": false,
                "isHetHan": false
            },
            {
                "commName": "COM26",
                "simId": "452021115286823",
                "nhaMang": "VN VINAPHONE",
                "taiKhoanChinh": 124124,
                "taiKhoanPhu": 12123,
                "ngayHetHan": "06/11/2020",
                "tinHieu": 31.99,
                "lastMsgId": 2,
                "messagesList": [
                    {
                        "id": 1,
                        "status": "REC READ",
                        "sdt": "+84354576363",
                        "time": "20/11/0310:00:29+28",
                        "content": "Good morning"
                    },
                    {
                        "id": 2,
                        "status": "REC READ",
                        "sdt": "+84354576363",
                        "time": "20/11/0313:20:58+28",
                        "content": "Nice"
                    }
                ],
                "deviceCode": "",
                "isConnected": true,
                "isSapHetTien": false,
                "isHetTien": false,
                "isSapHetHan": false,
                "isHetHan": false
            }
        ]
    }
};

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

var c = 0;
setInterval(function () {
    // showHideColumn();
    // showTable(dataOriginal.data);
    // timKiem(dataOriginal.data.simInfoList);
    console.log(c++);
}, 10000);

function getData() {
    // $.ajax({
    //     type: "GET",
    //     url: "/api/getSimStatistic",
    //     dataType: "json",
    //     success: function (data) {
    //         setTimeout(function () {
    //             getData();
    //         }, 3000);
    //         dataOriginal = data.data;
    //         showTable(dataOriginal);
    //     }
    // });
    showTable(dataOriginal.data);
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
        if ($('.' + name + '').is(":checked") == false) {
            $('.' + name + '').hide();
        }
    }
}

function showTable(data) {
    $("#bang_sim_box").empty();
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
        var randomNum = Math.floor(Math.random() * 100);
        contentString = contentString +
            '<tr>\n' +
            '<td id="stt">' + (i + 1) + '</td>\n' +
            '<td id="simID">' + simInfo.simId + '</td>\n' +
            '<td id="nhaMang">' + simInfo.nhaMang + '</td>\n' +
            '<td id="taiKhoanChinh">' + simInfo.taiKhoanChinh + '</td>\n' +
            '<td id="taiKhoanPhu">' + simInfo.taiKhoanPhu + '</td>\n' +
            '<td id="ngayHetHan">' + simInfo.ngayHetHan + '</td>\n' +
            '<td id="tinHieu">' + randomNum + '</td>\n' +
            '<td id="tinNhan">' +
            '<button class="btn-action bg-info" data-toggle="tooltip" title="Xem danh sách tin nhắn" onclick="showMessageList(' + simInfo.simId + ')">' + simInfoMessagesListSize + '</button>' +
            '</td>\n' +
            '<td id="comm">' + simInfo.commName + '</td>\n' +
            '<td id="hanhDong"><div>\n' + genBtnConnect(simInfo.isConnected, String(simInfo.commName)) +
            genBtnDisconnect(simInfo.isConnected, String(simInfo.commName)) +
            '<button id="btn_reload" class="btn-action" data-toggle="tooltip"\n' +
            'title="Đồng bộ" onclick="reloadSIM(\'' + simInfo.commName + '\')">\n' +
            '<i class="fas fa-sync text-success"></i>\n' +
            '</button>\n' +
            '</div>\n' +
            '</td>\n' +
            '</tr>';
    }
    $("#bang_sim_box").html(contentString);
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
    var simInfoList = dataOriginal.data.simInfoList;
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
    if (selectItem == 1) {
        $('.div-select').hide();
        $("#search_sim_id").show();
    } else if (selectItem == 2) {
        $('.div-select').hide();
        $("#search_comm").show();
    }
}

function removeDisabled() {
    if ($('#tien_nho_hon').is(":checked") == true) {
        $('#so_tien_nho_hon').removeAttr("disabled");
    }
    if ($('#tien_nho_hon').is(":checked") == false) {
        $("#so_tien_nho_hon").val('');
        $("#so_tien_nho_hon").prop('disabled', true);
    }
    if ($('#tien_lon_hon').is(":checked") == true) {
        $('#so_tien_lon_hon').removeAttr("disabled");
    }
    if ($('#tien_lon_hon').is(":checked") == false) {
        $("#so_tien_lon_hon").val('');
        $("#so_tien_lon_hon").prop('disabled', true);
    }
    timKiem();
}

function timKiem() {
    var data = dataOriginal.data.simInfoList;
    var selectedOptionVal = ($('#selectSearch').val() != null) ? $('#selectSearch').val() : 0;
    var simID = ($('#inputSIMID').val() != '') ? $('#inputSIMID').val().trim() : 0;
    var comm = ($('#inputComm').val() != '') ? $('#inputComm').val().trim() : 0;
    var loai_mang_1 = ($('#loai_mang_1').is(":checked") == true) ? 'VNM and VIETTEL' : 0;
    var loai_mang_2 = ($('#loai_mang_2').is(":checked") == true) ? 'VN VINAPHONE' : 0;
    var tien_nho_hon = ($('#tien_nho_hon').is(":checked") == true) ? $('#so_tien_nho_hon').val() : 0;
    var tien_lon_hon = ($('#tien_lon_hon').is(":checked") == true) ? $('#so_tien_lon_hon').val() : 0;
    var ngay_bat_dau = ($('#ngay_bat_dau').is(":checked") == true) ? $('#gia_tri_ngay_bat_dau').val() : 0;
    var ngay_ket_thuc = ($('#ngay_ket_thuc').is(":checked") == true) ? $('#gia_tri_ngay_ket_thuc').val() : 0;

    if (selectedOptionVal == 0) {
        var simObject = new Object({
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
        var resultList = [];
        for (var i = 0; i < data.length; i++) {
            var simInfo = data[i];
            for (var j = 0; j < simObject.loaiMang.length; j++) {
                if (simObject.loaiMang[j].includes(simInfo.nhaMang)) {
                    if (simObject.tienNhoHon == 0 && simObject.tienLonHon == 0) {
                        resultList.push(simInfo);
                    }
                    if (simObject.tienNhoHon != 0 && simObject.tienLonHon == 0) {
                        if (simInfo.taiKhoanChinh <= simObject.tienNhoHon) {
                            resultList.push(simInfo);
                        }
                    }
                    if (simObject.tienNhoHon == 0 && simObject.tienLonHon != 0) {
                        if (simInfo.taiKhoanChinh >= simObject.tienLonHon) {
                            resultList.push(simInfo);
                        }
                    }
                    if (simObject.tienNhoHon != 0 && simObject.tienLonHon != 0) {
                        if (simObject.tienLonHon <= simInfo.taiKhoanChinh && simInfo.taiKhoanChinh <= simObject.tienNhoHon) {
                            resultList.push(simInfo);
                        }
                    }
                }
            }
        }
        if (resultList.length != 0) {
            showTableFilter(resultList);
        } else {
            $("#bang_sim_box").empty();
        }
    } else if (selectedOptionVal == 1) {
        var simObject = new Object({
            simID: 0,
            loaiMang: [],
            tienNhoHon: 0,
            tienLonHon: 0,
            ngayBatDau: 0,
            ngayKetThuc: 0
        });
        if (simID != 0 ? simID : swal("Lỗi", "Sim ID trống", "warning")) {
            simObject.simID = simID;
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

            var resultList = [];
            for (var i = 0; i < data.length; i++) {
                var simInfo = data[i];
                if (simInfo.simId.includes(simObject.simID)) {
                    for (var j = 0; j < simObject.loaiMang.length; j++) {
                        if (simObject.loaiMang[j].includes(simInfo.nhaMang)) {
                            if (simObject.tienNhoHon == 0 && simObject.tienLonHon == 0) {
                                resultList.push(simInfo);
                            }
                            if (simObject.tienNhoHon != 0 && simObject.tienLonHon == 0) {
                                if (simInfo.taiKhoanChinh <= simObject.tienNhoHon) {
                                    resultList.push(simInfo);
                                }
                            }
                            if (simObject.tienNhoHon == 0 && simObject.tienLonHon != 0) {
                                if (simInfo.taiKhoanChinh >= simObject.tienLonHon) {
                                    resultList.push(simInfo);
                                }
                            }
                            if (simObject.tienNhoHon != 0 && simObject.tienLonHon != 0) {
                                if (simObject.tienLonHon <= simInfo.taiKhoanChinh && simInfo.taiKhoanChinh <= simObject.tienNhoHon) {
                                    resultList.push(simInfo);
                                }
                            }
                        }
                    }
                }
            }
            if (resultList.length != 0) {
                showTableFilter(resultList);
            } else {
                $("#bang_sim_box").empty();
            }
        }
    } else if (selectedOptionVal == 2) {
        var commObject = new Object({
            comm: '',
            loaiMang: [],
            tienNhoHon: 0,
            tienLonHon: 0,
            ngayBatDau: '',
            ngayKetThuc: ''
        });

        if (comm != 0 ? comm : swal("Lỗi", "Tên coom trống", "warning")) {
            commObject.comm = comm;
            if (loai_mang_1 != 0) {
                commObject.loaiMang.push(loai_mang_1);
            }
            if (loai_mang_2 != 0) {
                commObject.loaiMang.push(loai_mang_2);
            }
            if (tien_nho_hon != 0) {
                commObject.tienNhoHon = tien_nho_hon;
            }
            if (tien_lon_hon != 0) {
                commObject.tienLonHon = tien_lon_hon;
            }
            if (ngay_bat_dau != 0) {
                commObject.ngayBatDau = ngay_bat_dau;
            }
            if (ngay_ket_thuc != 0) {
                commObject.ngayKetThuc = ngay_ket_thuc;
            }

            var resultList = [];
            for (var i = 0; i < data.length; i++) {
                var simInfo = data[i];
                if (simInfo.commName.includes(commObject.comm)) {
                    for (var j = 0; j < commObject.loaiMang.length; j++) {
                        if (commObject.loaiMang[j].includes(simInfo.nhaMang)) {
                            if (commObject.tienNhoHon == 0 && commObject.tienLonHon == 0) {
                                resultList.push(simInfo);
                            }
                            if (commObject.tienNhoHon != 0 && commObject.tienLonHon == 0) {
                                if (simInfo.taiKhoanChinh <= commObject.tienNhoHon) {
                                    resultList.push(simInfo);
                                }
                            }
                            if (commObject.tienNhoHon == 0 && commObject.tienLonHon != 0) {
                                if (simInfo.taiKhoanChinh >= commObject.tienLonHon) {
                                    resultList.push(simInfo);
                                }
                            }
                            if (commObject.tienNhoHon != 0 && commObject.tienLonHon != 0) {
                                if (commObject.tienLonHon <= simInfo.taiKhoanChinh && simInfo.taiKhoanChinh <= commObject.tienNhoHon) {
                                    resultList.push(simInfo);
                                }
                            }
                        }
                    }
                }
            }
            if (resultList.length != 0) {
                showTableFilter(resultList);
            } else {
                $("#bang_sim_box").empty();
            }
        }
    }
}

function filterChange() {
    timKiem();
}

function showTableFilter(data) {
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
        var randomNum = Math.floor(Math.random() * 100);
        contentString = contentString +
            '<tr>\n' +
            '<td id="stt">' + (i + 1) + '</td>\n' +
            '<td id="simID">' + simInfo.simId + '</td>\n' +
            '<td id="nhaMang">' + simInfo.nhaMang + '</td>\n' +
            '<td id="taiKhoanChinh">' + simInfo.taiKhoanChinh + '</td>\n' +
            '<td id="taiKhoanPhu">' + simInfo.taiKhoanPhu + '</td>\n' +
            '<td id="ngayHetHan">' + simInfo.ngayHetHan + '</td>\n' +
            '<td id="tinHieu">' + randomNum + '</td>\n' +
            '<td id="tinNhan">' +
            '<button class="btn-action bg-info" data-toggle="tooltip" title="Xem danh sách tin nhắn" onclick="showMessageList(' + simInfo.simId + ')">' + simInfoMessagesListSize + '</button>' +
            '</td>\n' +
            '<td id="comm">' + simInfo.commName + '</td>\n' +
            '<td id="hanhDong"><div>\n' + genBtnConnect(simInfo.isConnected, String(simInfo.commName)) +
            genBtnDisconnect(simInfo.isConnected, String(simInfo.commName)) +
            '<button id="btn_reload" class="btn-action" data-toggle="tooltip"\n' +
            'title="Đồng bộ" onclick="reloadSIM(\'' + simInfo.commName + '\')">\n' +
            '<i class="fas fa-sync text-success"></i>\n' +
            '</button>\n' +
            '</div>\n' +
            '</td>\n' +
            '</tr>';
    }
    $("#bang_sim_box").html(contentString);
}
