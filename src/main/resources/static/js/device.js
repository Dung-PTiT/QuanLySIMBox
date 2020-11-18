var dataOriginal;
var deviceList = [];

$(document).ready(function () {
    getData();
    getCheckbox();
});

function getCheckbox() {
    $('#select_all').on('click', function () {
        if (this.checked) {
            $('.checkbox').each(function () {
                this.checked = true;
            });
        } else {
            $('.checkbox').each(function () {
                this.checked = false;
            });
        }
    });
}

function getDeviceIdList() {
    if ($('#select_all').is(":checked")) {
        deviceList = [];
        for (var i = 0; i < dataOriginal.deviceStatistics.length; i++) {
            deviceList.push(dataOriginal.deviceStatistics[i].deviceId);
        }
    } else {
        deviceList = [];
    }
    if (deviceList.length != 0) {
        enableAction(deviceList.length);
    } else {
        disableAction();
    }
}

function getDeviceIdInRow(deviceId) {
    $("#select_all").prop("checked", false);
    if (!deviceList.includes(deviceId)) {
        deviceList.push(deviceId);
    } else {
        deviceList.remove(deviceId);
    }
    if (deviceList.length != 0) {
        enableAction(deviceList.length);
    } else {
        disableAction();
    }
}

function enableAction(number) {
    $("#restartDevice").removeClass("divDisabled");
    $("#turnOffDevice").removeClass("divDisabled");
    $("#turnOnDevice").removeClass("divDisabled");
    $("#runScriptDevice").removeClass("divDisabled");
    $("#deleteDevice").removeClass("divDisabled");

    $("#restartDeviceNumber").text(number);
    $("#turnOffDeviceNumber").text(number);
    $("#turnOnDeviceNumber").text(number);
    $("#runScriptDeviceNumber").text(number);
    $("#deleteDeviceNumber").text(number);
}

function disableAction() {
    $("#restartDevice").addClass("divDisabled");
    $("#turnOffDevice").addClass("divDisabled");
    $("#turnOnDevice").addClass("divDisabled");
    $("#runScriptDevice").addClass("divDisabled");
    $("#deleteDevice").addClass("divDisabled");

    $("#restartDeviceNumber").text('');
    $("#turnOffDeviceNumber").text('');
    $("#turnOnDeviceNumber").text('');
    $("#runScriptDeviceNumber").text('');
    $("#deleteDeviceNumber").text('');
}

Array.prototype.remove = function () {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

var c = 0;

function getData() {
    $.ajax({
        type: "POST",
        url: "http://192.168.1.26:8082/api/manage_device",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        data: {
            "deviceId": $("#search_input").val().trim(),
            "page": 0,
            "size": 100
        },
        success: function (data) {
            dataOriginal = data;
            console.log(c++);
            filter(dataOriginal);
            setTimeout(function () {
                getData();
            }, 5000);
        }
    });
}

function filter(dataOriginal) {
    $("#device_all").text(dataOriginal.deviceTotal);
    $("#device_on").text(dataOriginal.deviceActive);
    $("#device_off").text(dataOriginal.deviceTotal - dataOriginal.deviceActive);
    $("#cpu").text(dataOriginal.cpu);
    $("#ram").text(dataOriginal.ram);

    var rowList = [];
    var device_status = $("#device_status").text();
    if (device_status == 'all') {
        $("#device_status").text('all');
        showTable(dataOriginal.deviceStatistics);
    } else if (device_status == 'on') {
        $("#device_status").text('on');
        if (dataOriginal.deviceStatistics.length != 0) {
            for (var i = 0; i < dataOriginal.deviceStatistics.length; i++) {
                if (dataOriginal.deviceStatistics[i].isActive == true) {
                    rowList.push(dataOriginal.deviceStatistics[i]);
                }
            }
        }
        showTable(rowList);
    } else if (device_status == 'off') {
        $("#device_status").text('off');
        if (dataOriginal.deviceStatistics.length != 0) {
            for (var i = 0; i < dataOriginal.deviceStatistics.length; i++) {
                if (dataOriginal.deviceStatistics[i].isActive == false) {
                    rowList.push(dataOriginal.deviceStatistics[i]);
                }
            }
        }
        showTable(rowList);
    }
}

function showTab(type) {
    var rowList = [];
    var dataTable = dataOriginal.deviceStatistics;
    if (type == 'all') {
        showTable(dataTable);
        $("#device_status").text('all');
    } else if (type == 'on') {
        $("#device_status").text('on');
        if (dataTable.length != 0) {
            for (var i = 0; i < dataTable.length; i++) {
                if (dataTable[i].isActive == true) {
                    rowList.push(dataTable[i]);
                }
            }
        }
        showTable(rowList);
    } else if (type == 'off') {
        $("#device_status").text('off');
        if (dataTable.length != 0) {
            for (var i = 0; i < dataTable.length; i++) {
                if (dataTable[i].isActive == false) {
                    rowList.push(dataTable[i]);
                }
            }
        }
        showTable(rowList);
    }
}

function showAddDeviceModal() {
    $('#addDevice_popup').modal('show');
    $('#inputNumberDevice').val('');
    $("#overlay_spinner_1").hide();
}

function addDevice() {
    $('#addDevice_popup').modal('hide');
    var amount = $("#inputNumberDevice").val();
    if (amount != '') {
        $.ajax({
            type: "POST",
            url: "http://192.168.1.26:8082/api/add_device",
            cache: false,
            crossDomain: true,
            processData: true,
            dataType: "json",
            data: {
                "amount": amount,
                "deviceId": $("#search_input").val().trim(),
                "page": 0,
                "size": 100
            },
            success: function (data) {
                dataOriginal = data;
                filter(dataOriginal);
            }
        });
    }
}

function showTable(dataTable) {
    $("#device_table_body").empty();
    if (dataTable.length != 0) {
        var contentString = "";
        for (var i = 0; i < dataTable.length; i++) {
            var row = dataTable[i];
            if (row.isActive == false) {
                contentString = contentString +
                    '<tr>' +
                    '<td>' + genCheckox(row.index, row.deviceId) +
                    '</td>\n' +
                    '<td>' + row.deviceId + '</td>\n' +
                    '<td></td>\n' +
                    '<td></td>\n' +
                    '<td></td>\n' +
                    '<td></td>\n' +
                    '<td></td>\n' +
                    '<td></td>\n' +
                    '<td></td>\n' +
                    '<td>' + genButtonActionDevice(row.script, row.account, row.status, row.deviceId, row.isActive, row.isStarting) +
                    '</tr>';
            } else if (row.isActive == true) {
                if (row.script == '') {
                    contentString = contentString +
                        '<tr>' +
                        '<td>' + genCheckox(row.index, row.deviceId) +
                        '</td>\n' +
                        '<td>' + row.deviceId + '</td>\n' +
                        '<td>' + genStatus(row.status) + '</td>\n' +
                        '<td>' + row.account + '</td>\n' +
                        '<td></td>\n' +
                        '<td></td>\n' +
                        '<td>' + row.script + '</td>\n' +
                        '<td>' + row.simId + '</td>\n' +
                        '<td>' + row.action + '</td>\n' +
                        '<td>' + genButtonActionDevice(row.script, row.account, row.status, row.deviceId, row.isActive, row.isStarting) +
                        '</tr>';
                } else {
                    contentString = contentString +
                        '<tr>' +
                        '<td>' + genCheckox(row.index, row.deviceId) +
                        '</td>\n' +
                        '<td>' + row.deviceId + '</td>\n' +
                        '<td>' + genStatus(row.status) + '</td>\n' +
                        '<td>' + row.account + '</td>\n' +
                        '<td>' +
                        '<img src="./images/brands/facebook.png" class="rounded-circle" width="20" height="20">\n' +
                        '<span class="ml-2">' + row.app + '</span></td>\n' +
                        '<td>' + genProgress(row.progress) + '</td>\n' +
                        '<td>' + row.script + '</td>\n' +
                        '<td>' + row.simId + '</td>\n' +
                        '<td>' + row.action + '</td>\n' +
                        '<td>' + genButtonActionDevice(row.script, row.account, row.status, row.deviceId, row.isActive, row.isStarting) +
                        '</tr>';
                }
            }
        }
        $("#device_table_body").html(contentString);
    }
}

function genCheckox(index, deviceId) {

    var checkbox = '';

    if (deviceList.length != 0) {
        if (deviceList.includes(deviceId)) {
            checkbox =
                '<input checked class="checkbox" type="checkbox" onclick="getDeviceIdInRow(\'' + deviceId + '\')">\n' +
                '<span class="ml-2">' + index + '</span>';
        } else {
            checkbox =
                '<input class="checkbox" type="checkbox" onclick="getDeviceIdInRow(\'' + deviceId + '\')">\n' +
                '<span class="ml-2">' + index + '</span>';
        }
    } else {
        checkbox =
            '<input class="checkbox" type="checkbox" onclick="getDeviceIdInRow(\'' + deviceId + '\')">\n' +
            '<span class="ml-2">' + index + '</span>';
    }
    return checkbox;
}

function genStatus(statusValue) {
    var status;
    if (statusValue == "") {
        status = '';
    } else if (statusValue == "free") {
        status = '<span class="badge bg-blue w-50">Free</span>';
    } else if (statusValue == "running") {
        status = '<span class="badge bg-purple w-50">Running</span>';
    } else if (statusValue == "complete") {
        status = '<span class="badge bg-success w-50">Complete</span>';
    } else if (statusValue == "fail") {
        status = '<span class="badge bg-danger w-50">Fail</span>';
    } else if (statusValue == "stopped") {
        status = '<span class="badge bg-warning w-50">Stopped</span>';
    }
    return status;
}

function genProgress(progressValue) {
    var progress = '';
    if (progressValue == 0) {
        progress =
            '   <div class="progress rounded-round" style=" height:0.8rem">\n' +
            '       <div class="progress-bar" style="width: ' + 100 + '%; background-color: #f2f2f2">\n' +
            '               <span class="text-grey">' + progressValue + '%</span>\n' +
            '       </div>\n' +
            '   </div>';
    } else if (progressValue < 100) {
        progress =
            '   <div class="progress rounded-round" style=" height:0.8rem">\n' +
            '       <div class="progress-bar bg-blue" style="width: ' + progressValue + '%;">\n' +
            '               <span>' + progressValue + '%</span>\n' +
            '       </div>\n' +
            '   </div>';
    } else if (progressValue == 100) {
        progress =
            '   <div class="progress rounded-round" style=" height:0.8rem">\n' +
            '       <div class="progress-bar bg-success" style="width: ' + progressValue + '%;">\n' +
            '               <span>' + progressValue + '%</span>\n' +
            '       </div>\n' +
            '   </div>';
    }
    return progress;
}

function genButtonActionDevice(script, account, status, deviceId, isActived, isStaring) {
    var button = '';
    if (isActived == false) {
        if (isStaring == true) {
            button =
                '                                    <div id="overlay_spinner_1">\n' +
                '                                        <div class="cv-spinner">\n' +
                '                                            <span class="spinner"></span>\n' +
                '                                        </div>\n' +
                '                                    </div>';
        } else {
            button =
                ' <div class="list-icons">\n' +
                '                                        <div x-placement="bottom-start">\n' +
                '                                            <button onclick="viewDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem màn hình" disabled>\n' +
                '                                                <i class="icon-mobile text-grey"></i>\n' +
                '                                            </button>\n' +
                '                                            <button onclick="runDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Chạy" disabled>\n' +
                '                                                <i class="icon-play4 text-grey" style="font-size: 18px !important;"></i>\n' +
                '                                            </button>\n' +
                '                                            <button onclick="stopScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Dừng" disabled>\n' +
                '                                                <i class="icon-square text-grey font-size-sm"></i>\n' +
                '                                            </button>\n' +
                '                                            <button onclick="turnonDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Bật">\n' +
                '                                                <fa class="fa fa-power-off text-success"></fa>\n' +
                '                                            </button>\n' +
                '                                            <button onclick="turnoffDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Tắt" style="display: none" >\n' +
                '                                                <fa class="fa fa-power-off text-danger"></fa>\n' +
                '                                            </button>\n' +
                '                                            <button onclick="runScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Kịch bản" >\n' +
                '                                                <i class="icon-cog text-dark"></i>\n' +
                '                                            </button>\n' +
                '                                            <button onclick="viewLog(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem log">\n' +
                '                                                <fa class="far fa-file-alt text-info"></fa>\n' +
                '                                            </button>\n' +
                '                                        </div>\n' +
                '                                    </div>';
        }
    } else {
        if ((script == '') || (account == '')) {
            button =
                ' <div class="list-icons">\n' +
                '                                        <div x-placement="bottom-start">\n' +
                '                                            <button onclick="viewDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem màn hình">\n' +
                '                                                <i class="icon-mobile text-indigo"></i>\n' +
                '                                            </button>\n' +
                '                                            <button onclick="runDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Chạy" disabled>\n' +
                '                                                <i class="icon-play4 text-grey" style="font-size: 18px !important;"></i>\n' +
                '                                            </button>\n' +
                '                                            <button onclick="stopScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Dừng" disabled>\n' +
                '                                                <i class="icon-square text-grey font-size-sm"></i>\n' +
                '                                            </button>\n' +
                '                                            <button onclick="turnonDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Bật" style="display: none">\n' +
                '                                                <fa class="fa fa-power-off text-success"></fa>\n' +
                '                                            </button>\n' +
                '                                            <button onclick="turnoffDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Tắt">\n' +
                '                                                <fa class="fa fa-power-off text-danger"></fa>\n' +
                '                                            </button>\n' +
                '                                            <button onclick="runScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Kịch bản" >\n' +
                '                                                <i class="icon-cog text-dark"></i>\n' +
                '                                            </button>\n' +
                '                                            <button onclick="viewLog(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem log">\n' +
                '                                                <fa class="far fa-file-alt text-info"></fa>\n' +
                '                                            </button>\n' +
                '                                        </div>\n' +
                '                                    </div>';

        } else if ((script != '') && (account != '')) {
            if (status == 'free') {
                button =
                    ' <div class="list-icons">\n' +
                    '                                        <div x-placement="bottom-start">\n' +
                    '                                            <button onclick="viewDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem màn hình">\n' +
                    '                                                <i class="icon-mobile text-indigo"></i>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="runDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Chạy" disabled>\n' +
                    '                                                <i class="icon-play4 text-grey" style="font-size: 18px !important;"></i>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="stopScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Dừng" disabled>\n' +
                    '                                                <i class="icon-square text-grey font-size-sm"></i>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="turnonDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Bật" style="display: none" >\n' +
                    '                                                <fa class="fa fa-power-off text-success"></fa>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="turnoffDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Tắt">\n' +
                    '                                                <fa class="fa fa-power-off text-danger"></fa>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="runScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Kịch bản" >\n' +
                    '                                                <i class="icon-cog text-dark"></i>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="viewLog(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem log">\n' +
                    '                                                <fa class="far fa-file-alt text-info"></fa>\n' +
                    '                                            </button>\n' +
                    '                                        </div>\n' +
                    '                                    </div>';
            } else if (status == 'running') {
                button =
                    ' <div class="list-icons">\n' +
                    '                                        <div x-placement="bottom-start">\n' +
                    '                                            <button onclick="viewDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem màn hình">\n' +
                    '                                                <i class="icon-mobile text-indigo"></i>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="runDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Chạy" disabled>\n' +
                    '                                                <i class="icon-play4 text-grey" style="font-size: 18px !important;"></i>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="stopScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Dừng">\n' +
                    '                                                <i class="icon-square text-warning font-size-sm"></i>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="turnonDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Bật"  style="display: none" >\n' +
                    '                                                <fa class="fa fa-power-off text-success"></fa>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="turnoffDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Tắt">\n' +
                    '                                                <fa class="fa fa-power-off text-danger"></fa>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="runScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Kịch bản" >\n' +
                    '                                                <i class="icon-cog text-dark"></i>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="viewLog(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem log">\n' +
                    '                                                <fa class="far fa-file-alt text-info"></fa>\n' +
                    '                                            </button>\n' +
                    '                                        </div>\n' +
                    '                                    </div>';
            } else if ((status == 'fail') || status == 'complete' || status == 'stopped') {
                button =
                    ' <div class="list-icons">\n' +
                    '                                        <div x-placement="bottom-start">\n' +
                    '                                            <button onclick="viewDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem màn hình">\n' +
                    '                                                <i class="icon-mobile text-indigo"></i>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="runDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Chạy">\n' +
                    '                                                <i class="icon-play4 text-success" style="font-size: 18px !important;"></i>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="stopScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Dừng" disabled>\n' +
                    '                                                <i class="icon-square text-grey font-size-sm"></i>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="turnonDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Bật" style="display: none" >\n' +
                    '                                                <fa class="fa fa-power-off text-success"></fa>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="turnoffDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Tắt">\n' +
                    '                                                <fa class="fa fa-power-off text-danger"></fa>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="runScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Kịch bản" >\n' +
                    '                                                <i class="icon-cog text-dark"></i>\n' +
                    '                                            </button>\n' +
                    '                                            <button onclick="viewLog(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem log">\n' +
                    '                                                <fa class="far fa-file-alt text-info"></fa>\n' +
                    '                                            </button>\n' +
                    '                                        </div>\n' +
                    '                                    </div>';
            }
        }
    }
    return button;
}

function viewDevice(deviceID) {
    console.log(deviceID);
}

function runDevice(deviceID) {
    console.log(deviceID);
}

function stopScript(deviceID) {
    console.log(deviceID);
}


function turnOnMultiDevice() {
    $.ajax({
        type: "POST",
        url: "http://192.168.1.26:8082/api/turnon_device",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(
            {
                "deviceIdList": deviceList
            }),
        success: function (deviceListOnResp) {
            if (deviceListOnResp.length != 0) {
                for (var i = 0; i < deviceListOnResp.length; i++) {
                    var deviceOn = deviceListOnResp[i];
                    if (deviceOn.error == '') {
                        if (dataOriginal.deviceStatistics.length != 0) {
                            for (var j = 0; j < dataOriginal.deviceStatistics.length; j++) {
                                if (dataOriginal.deviceStatistics[j].deviceId == deviceOn.data.deviceId) {
                                    dataOriginal.deviceStatistics[j].isStarting = true;
                                }
                            }
                        } else {
                            console.log("Data null")
                        }
                    } else {
                        // Todo show error turn on
                        console.log(deviceOn.error);
                    }
                }
            }
            showTable(dataOriginal.deviceStatistics);
        }
    });
}

function turnonDevice(deviceID) {
    var deviceIdList = [];
    deviceIdList.push(deviceID);
    $.ajax({
        type: "POST",
        url: "http://192.168.1.26:8082/api/turnon_device",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(
            {
                "deviceIdList": deviceIdList
            }),
        success: function (deviceListOnResp) {
            if (deviceListOnResp.length != 0) {
                for (var i = 0; i < deviceListOnResp.length; i++) {
                    var deviceOn = deviceListOnResp[i];
                    if (deviceOn.error == '') {
                        if (dataOriginal.deviceStatistics.length != 0) {
                            for (var j = 0; j < dataOriginal.deviceStatistics.length; j++) {
                                if (dataOriginal.deviceStatistics[j].deviceId == deviceOn.data.deviceId) {
                                    dataOriginal.deviceStatistics[j].isStarting = true;
                                }
                            }
                        } else {
                            console.log("Data null")
                        }
                    } else {
                        // Todo show error turn on
                        console.log(deviceOn.error);
                    }
                }
            }
            showTable(dataOriginal.deviceStatistics);
        }
    });
}

function turnoffMultiDevice() {
    $.ajax({
        type: "POST",
        url: "http://192.168.1.26:8082/api/turnoff_device",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(
            {
                "deviceIdList": deviceList
            }),
        success: function (deviceListOffResp) {
            if (deviceListOffResp.length != 0) {
                for (var i = 0; i < deviceListOffResp.length; i++) {
                    var deviceOff = deviceListOffResp[i];
                    if (deviceOff.error == '') {
                        if (dataOriginal.deviceStatistics.length != 0) {
                            for (var j = 0; j < dataOriginal.deviceStatistics.length; j++) {
                                if (dataOriginal.deviceStatistics[j].deviceId == deviceOff.data.deviceId) {
                                    dataOriginal.deviceStatistics[j].isActive = false;
                                }
                            }
                        } else {
                            console.log("Data null")
                        }
                    } else {
                        // Todo show error turn on
                        console.log(deviceOff.error);
                    }
                }
            }
            showTable(dataOriginal.deviceStatistics);
        }
    });
}

function turnoffDevice(deviceID) {
    var deviceIdList = [];
    deviceIdList.push(deviceID);
    $.ajax({
        type: "POST",
        url: "http://192.168.1.26:8082/api/turnoff_device",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(
            {
                "deviceIdList": deviceIdList
            }),
        success: function (deviceListOffResp) {
            if (deviceListOffResp.length != 0) {
                for (var i = 0; i < deviceListOffResp.length; i++) {
                    var deviceOff = deviceListOffResp[i];
                    if (deviceOff.error == '') {
                        if (dataOriginal.deviceStatistics.length != 0) {
                            for (var j = 0; j < dataOriginal.deviceStatistics.length; j++) {
                                if (dataOriginal.deviceStatistics[j].deviceId == deviceOff.data.deviceId) {
                                    dataOriginal.deviceStatistics[j].isActive = false;
                                }
                            }
                        } else {
                            console.log("Data null")
                        }
                    } else {
                        // Todo show error turn on
                        console.log(deviceOff.error);
                    }
                }
            }
            showTable(dataOriginal.deviceStatistics);
        }
    });
}

function runScript(deviceID) {
    console.log(deviceID);
}

function viewLog(deviceID) {
    $.ajax({
        type: "POST",
        url: "http://192.168.1.26:8082/api/device_log",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        data: {
            "deviceId": deviceID
        },
        success: function (data) {
            console.log(data);
        }
    });
}


function deleteDevice() {
    $.ajax({
        type: "POST",
        url: "http://192.168.1.26:8082/api/delete_device",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({
            "deviceIdList": deviceList,
            "filterDeviceId": $("#search_input").val().trim(),
            "page": 0,
            "size": 100
        }),
        success: function (data) {
            disableAction();
            dataOriginal = data;
            filter(dataOriginal);
        }
    });
}
