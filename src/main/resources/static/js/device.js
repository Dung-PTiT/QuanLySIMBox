var dataOriginal;
var deviceNumberChecked = 0;
var selectedDeviceIdList = [];

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

    for (var i = 0; i < 30; i++) {
        var j = i + 1;
        $('#selectNumberPage').append($("<option>").val("" + j + "").text("" + j + ""));
        $('#selectNumberRecord').append($("<option>").val("" + j + "").text("" + j + ""));
    }

}

function getDeviceIdList() {
    if ($('#select_all').is(":checked")) {
        selectedDeviceIdList = [];
        for (var i = 0; i < dataOriginal.deviceStatistics.length; i++) {
            selectedDeviceIdList.push(dataOriginal.deviceStatistics[i].deviceId);
        }
    } else {
        selectedDeviceIdList = [];
    }
    if (selectedDeviceIdList.length != 0) {
        enableAction(selectedDeviceIdList.length);
    } else {
        disableAction();
    }
}

function getDeviceIdInRow(deviceId) {
    $("#select_all").prop("checked", false);
    if (!selectedDeviceIdList.includes(deviceId)) {
        selectedDeviceIdList.push(deviceId);
    } else {
        selectedDeviceIdList.remove(deviceId);
    }
    if (selectedDeviceIdList.length != 0) {
        enableAction(selectedDeviceIdList.length);
    } else {
        disableAction();
    }
}

function enableAction(number) {
    $("#restartDevice").removeClass("divDisabled");
    $("#turnOffDevice").removeClass("divDisabled");
    $("#turnOnDevice").removeClass("divDisabled");
    $("#runMultiScript").removeClass("divDisabled");
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
    $("#runMultiScript").addClass("divDisabled");
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

function getData() {
    $.ajax({
        type: "POST",
        url: "http://localhost:8082/api/manage_device",
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
            $("#deviceTotal").text(dataOriginal.deviceTotal);
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
    let rowList = [];
    let dataTable = dataOriginal.deviceStatistics;
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
    let amount = $("#inputNumberDevice").val();
    if (amount != '') {
        $.ajax({
            type: "POST",
            url: "http://localhost:8082/api/add_device",
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
                genToastSuccess(data.message);
                dataOriginal = data;
                filter(dataOriginal);
            }
        });
    }
}

function showTable(dataTable) {

    //reset number checked in 'Khay hành động'
    deviceNumberChecked = 0;

    $("#device_table_body").empty();
    if (dataTable.length != 0) {
        var contentString = "";
        for (var i = 0; i < dataTable.length; i++) {
            var row = dataTable[i];
            if (row.isActive == false) {
                contentString = contentString +
                    '<tr>' +
                    '<td>' + genCheckox(row.index, row.deviceId) + '</td>\n' +
                    '<td>' + row.deviceId + '</td>\n' +
                    '<td></td>\n' +
                    '<td></td>\n' +
                    '<td></td>\n' +
                    '<td></td>\n' +
                    '<td></td>\n' +
                    '<td></td>\n' +
                    '<td>' + genButtonActionDevice(row.script, row.account, row.status, row.deviceId, row.isActive, row.isStarting) +
                    '</tr>';
            } else if (row.isActive == true) {
                if (row.script == "" || row.account == "") {
                    contentString = contentString +
                        '<tr>' +
                        '<td>' + genCheckox(row.index, row.deviceId) + '</td>\n' +
                        '<td>' + row.deviceId + '</td>\n' +
                        '<td>' + genStatus(row.status) + '</td>\n' +
                        '<td></td>\n' +
                        '<td></td>\n' +
                        '<td></td>\n' +
                        '<td></td>\n' +
                        '<td></td>\n' +
                        '<td>' + genButtonActionDevice(row.script, row.account, row.status, row.deviceId, row.isActive, row.isStarting) +
                        '</tr>';
                } else if (row.script != "" && row.account != "") {
                    contentString = contentString +
                        '<tr>' +
                        '<td>' + genCheckox(row.index, row.deviceId) + '</td>\n' +
                        '<td>' + row.deviceId + '</td>\n' +
                        '<td>' + genStatus(row.status) + '</td>\n' +
                        '<td><img src="' + row.appIcon + '" class="rounded-circle" width="20" height="20">\n' +
                        '<span class="ml-2">' + row.app + '</span></td>\n' +
                        '<td>' + row.account + '</td>\n' +
                        '<td>' + row.script + '</td>\n' +
                        '<td>' + genProgress(row.progress) + '</td>\n' +
                        '<td>' + row.action + '</td>\n' +
                        '<td>' + genButtonActionDevice(row.script, row.account, row.status, row.deviceId, row.isActive, row.isStarting) +
                        '</tr>';
                }
            }
        }
        $("#device_table_body").html(contentString);
    }

    if (deviceNumberChecked == 0) {
        disableAction(deviceNumberChecked);
    } else {
        enableAction(deviceNumberChecked);
    }

}

function genCheckox(index, deviceId) {

    let checkbox = '';
    if (selectedDeviceIdList.length != 0) {
        if (selectedDeviceIdList.includes(deviceId)) {
            checkbox =
                '<input checked class="checkbox" type="checkbox" onclick="getDeviceIdInRow(\'' + deviceId + '\')">\n' +
                '<span class="ml-2">' + index + '</span>';

            //thay đổi số lượng trong khay hành động
            deviceNumberChecked++;
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
    let status;
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
    let progress = '';
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
    let button = '';
    if (isActived == false) {
        if (isStaring == true) {
            button =
                '<div id="overlay_spinner_1">\n' +
                '<div class="cv-spinner">\n' +
                '    <span class="spinner"></span>\n' +
                '</div>\n' +
                '</div>';
        } else {
            button =
                ' <div class="list-icons">\n' +
                '<div x-placement="bottom-start">\n' +
                '    <button onclick="viewDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem màn hình thiết bị" disabled>\n' +
                '        <i class="icon-mobile text-grey"></i>\n' +
                '    </button>\n' +
                '    <button onclick="startScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Chạy kịch bản" disabled>\n' +
                '        <i class="icon-play4 text-grey" style="font-size: 18px !important;"></i>\n' +
                '    </button>\n' +
                '    <button onclick="stopScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Dừng chạy kịch bản" disabled>\n' +
                '        <i class="icon-square text-grey font-size-sm"></i>\n' +
                '    </button>\n' +
                '    <button onclick="turnonDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Bật thiết bị">\n' +
                '        <fa class="fa fa-power-off text-success"></fa>\n' +
                '    </button>\n' +
                '    <button onclick="turnoffDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Tắt thiết bị" style="display: none" >\n' +
                '        <fa class="fa fa-power-off text-danger"></fa>\n' +
                '    </button>\n' +
                '    <button onclick="showModalRunOneScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Thiết lập kịch bản" disabled>\n' +
                '        <i class="icon-cog text-dark"></i>\n' +
                '    </button>\n' +
                '    <button onclick="viewLog(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem log">\n' +
                '        <fa class="far fa-file-alt text-info"></fa>\n' +
                '    </button>\n' +
                '</div>\n' +
                '</div>';
        }
    } else {
        if ((script == '') || (account == '')) {
            button =
                '<div class="list-icons">\n' +
                '<div x-placement="bottom-start">\n' +
                '    <button onclick="viewDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem màn hình thiết bị">\n' +
                '        <i class="icon-mobile text-indigo"></i>\n' +
                '    </button>\n' +
                '    <button onclick="startScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Chạy kịch bản" disabled>\n' +
                '        <i class="icon-play4 text-grey" style="font-size: 18px !important;"></i>\n' +
                '    </button>\n' +
                '    <button onclick="stopScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Dừng chạy kịch bản" disabled>\n' +
                '        <i class="icon-square text-grey font-size-sm"></i>\n' +
                '    </button>\n' +
                '    <button onclick="turnonDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Bật thiết bị" style="display: none">\n' +
                '        <fa class="fa fa-power-off text-success"></fa>\n' +
                '    </button>\n' +
                '    <button onclick="turnoffDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Tắt thiết bị">\n' +
                '        <fa class="fa fa-power-off text-danger"></fa>\n' +
                '    </button>\n' +
                '    <button onclick="showModalRunOneScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Thiết lập kịch bản" >\n' +
                '        <i class="icon-cog text-dark"></i>\n' +
                '    </button>\n' +
                '    <button onclick="viewLog(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem log">\n' +
                '        <fa class="far fa-file-alt text-info"></fa>\n' +
                '    </button>\n' +
                '</div>\n' +
                '</div>';

        } else if ((script != '') && (account != '')) {
            if (status == 'free') {
                button =
                    ' <div class="list-icons">\n' +
                    '<div x-placement="bottom-start">\n' +
                    '    <button onclick="viewDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem màn hình thiết bị">\n' +
                    '        <i class="icon-mobile text-indigo"></i>\n' +
                    '    </button>\n' +
                    '    <button onclick="startScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Chạy kịch bản" disabled>\n' +
                    '        <i class="icon-play4 text-grey" style="font-size: 18px !important;"></i>\n' +
                    '    </button>\n' +
                    '    <button onclick="stopScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Dừng chạy kịch bản" disabled>\n' +
                    '        <i class="icon-square text-grey font-size-sm"></i>\n' +
                    '    </button>\n' +
                    '    <button onclick="turnonDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Bật thiết bị" style="display: none" >\n' +
                    '        <fa class="fa fa-power-off text-success"></fa>\n' +
                    '    </button>\n' +
                    '    <button onclick="turnoffDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Tắt thiết bị">\n' +
                    '        <fa class="fa fa-power-off text-danger"></fa>\n' +
                    '    </button>\n' +
                    '    <button onclick="showModalRunOneScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Thiết lập kịch bản" >\n' +
                    '        <i class="icon-cog text-dark"></i>\n' +
                    '    </button>\n' +
                    '    <button onclick="viewLog(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem log">\n' +
                    '        <fa class="far fa-file-alt text-info"></fa>\n' +
                    '    </button>\n' +
                    '</div>\n' +
                    '</div>';
            } else if (status == 'running') {
                button =
                    ' <div class="list-icons">\n' +
                    '<div x-placement="bottom-start">\n' +
                    '    <button onclick="viewDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem màn hình thiết bị">\n' +
                    '        <i class="icon-mobile text-indigo"></i>\n' +
                    '    </button>\n' +
                    '    <button onclick="startScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Chạy kịch bản" disabled>\n' +
                    '        <i class="icon-play4 text-grey" style="font-size: 18px !important;"></i>\n' +
                    '    </button>\n' +
                    '    <button onclick="stopScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Dừng chạy kịch bản">\n' +
                    '        <i class="icon-square text-warning font-size-sm"></i>\n' +
                    '    </button>\n' +
                    '    <button onclick="turnonDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Bật thiết bị"  style="display: none" >\n' +
                    '        <fa class="fa fa-power-off text-success"></fa>\n' +
                    '    </button>\n' +
                    '    <button onclick="turnoffDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Tắt thiết bị">\n' +
                    '        <fa class="fa fa-power-off text-danger"></fa>\n' +
                    '    </button>\n' +
                    '    <button onclick="showModalRunOneScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Thiết lập kịch bản" >\n' +
                    '        <i class="icon-cog text-dark"></i>\n' +
                    '    </button>\n' +
                    '    <button onclick="viewLog(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem log">\n' +
                    '        <fa class="far fa-file-alt text-info"></fa>\n' +
                    '    </button>\n' +
                    '</div>\n' +
                    '</div>';
            } else if ((status == 'fail') || status == 'complete' || status == 'stopped') {
                button =
                    ' <div class="list-icons">\n' +
                    '<div x-placement="bottom-start">\n' +
                    '    <button onclick="viewDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem màn hình thiết bị">\n' +
                    '        <i class="icon-mobile text-indigo"></i>\n' +
                    '    </button>\n' +
                    '    <button onclick="startScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Chạy kịch bản">\n' +
                    '        <i class="icon-play4 text-success" style="font-size: 18px !important;"></i>\n' +
                    '    </button>\n' +
                    '    <button onclick="stopScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Dừng chạy kịch bản" disabled>\n' +
                    '        <i class="icon-square text-grey font-size-sm"></i>\n' +
                    '    </button>\n' +
                    '    <button onclick="turnonDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Bật thiết bị" style="display: none" >\n' +
                    '        <fa class="fa fa-power-off text-success"></fa>\n' +
                    '    </button>\n' +
                    '    <button onclick="turnoffDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Tắt thiết bị">\n' +
                    '        <fa class="fa fa-power-off text-danger"></fa>\n' +
                    '    </button>\n' +
                    '    <button onclick="showModalRunOneScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Thiết lập kịch bản" >\n' +
                    '        <i class="icon-cog text-dark"></i>\n' +
                    '    </button>\n' +
                    '    <button onclick="viewLog(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem log">\n' +
                    '        <fa class="far fa-file-alt text-info"></fa>\n' +
                    '    </button>\n' +
                    '</div>\n' +
                    '</div>';
            }
        }
    }
    return button;
}

function viewDevice(deviceID) {
    console.log(deviceID);
}

function startScript(deviceID) {
    let deviceIdList = [];
    deviceIdList.push(deviceID);
    $.ajax({
        type: "POST",
        url: "http://localhost:8082/api/start_script",
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
                for (let i = 0; i < deviceListOnResp.length; i++) {
                    let newDeviceStatus = deviceListOnResp[i];
                    if (newDeviceStatus.error == '') {
                        if (dataOriginal.deviceStatistics.length != 0) {
                            for (var j = 0; j < dataOriginal.deviceStatistics.length; j++) {
                                if (dataOriginal.deviceStatistics[j].deviceId == newDeviceStatus.data.deviceId) {
                                    dataOriginal.deviceStatistics[j] = newDeviceStatus.data;
                                }
                            }
                        } else {
                            genToastError("Data null");
                        }
                    } else {
                        genToastError(newDeviceStatus.error);
                    }
                }
            }
            showTab($("#device_status").text());
        }

    })
}

function stopScript(deviceID) {
    let deviceIdList = [];
    deviceIdList.push(deviceID);
    $.ajax({
        type: "POST",
        url: "http://localhost:8082/api/stop_script",
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
                for (let i = 0; i < deviceListOnResp.length; i++) {
                    let newDeviceStatus = deviceListOnResp[i];
                    if (newDeviceStatus.error == '') {
                        if (dataOriginal.deviceStatistics.length != 0) {
                            for (var j = 0; j < dataOriginal.deviceStatistics.length; j++) {
                                if (dataOriginal.deviceStatistics[j].deviceId == newDeviceStatus.data.deviceId) {
                                    dataOriginal.deviceStatistics[j] = newDeviceStatus.data;
                                }
                            }
                        } else {
                            genToastError("Data null");
                        }
                    } else {
                        genToastError(newDeviceStatus.error);
                    }
                }
            }
            showTab($("#device_status").text());
        }

    })
}

function restartDevice() {
    $.ajax({
        type: "POST",
        url: "http://localhost:8082/api/restart_device",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(
            {
                "deviceIdList": selectedDeviceIdList
            }),
        success: function (deviceListOnResp) {
            if (deviceListOnResp.length != 0) {
                for (let i = 0; i < deviceListOnResp.length; i++) {
                    let deviceOn = deviceListOnResp[i];
                    if (deviceOn.error == '') {
                        if (dataOriginal.deviceStatistics.length != 0) {
                            for (var j = 0; j < dataOriginal.deviceStatistics.length; j++) {
                                if (dataOriginal.deviceStatistics[j].deviceId == deviceOn.data.deviceId) {
                                    dataOriginal.deviceStatistics[j].isStarting = true;
                                }
                            }
                        } else {
                            genToastError("Data null");
                        }
                    } else {
                        genToastError(deviceOn.error);
                    }
                }
            }
            showTab($("#device_status").text());
        }
    });
}

function turnOnMultiDevice() {
    $.ajax({
        type: "POST",
        url: "http://localhost:8082/api/turnon_device",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(
            {
                "deviceIdList": selectedDeviceIdList
            }),
        success: function (deviceListOnResp) {
            if (deviceListOnResp.length != 0) {
                for (let i = 0; i < deviceListOnResp.length; i++) {
                    let deviceOn = deviceListOnResp[i];
                    if (deviceOn.error == '') {
                        if (dataOriginal.deviceStatistics.length != 0) {
                            for (var j = 0; j < dataOriginal.deviceStatistics.length; j++) {
                                if (dataOriginal.deviceStatistics[j].deviceId == deviceOn.data.deviceId) {
                                    dataOriginal.deviceStatistics[j].isStarting = true;
                                }
                            }
                        } else {
                            genToastError("Data null");
                        }
                    } else {
                        genToastError(deviceOn.error);
                    }
                }
            }
            showTab($("#device_status").text());
        }
    });
}

function turnonDevice(deviceID) {
    let deviceIdList = [];
    deviceIdList.push(deviceID);
    $.ajax({
        type: "POST",
        url: "http://localhost:8082/api/turnon_device",
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
                for (let i = 0; i < deviceListOnResp.length; i++) {
                    let deviceOn = deviceListOnResp[i];
                    if (deviceOn.error == '') {
                        if (dataOriginal.deviceStatistics.length != 0) {
                            for (var j = 0; j < dataOriginal.deviceStatistics.length; j++) {
                                if (dataOriginal.deviceStatistics[j].deviceId == deviceOn.data.deviceId) {
                                    dataOriginal.deviceStatistics[j].isStarting = true;
                                }
                            }
                        } else {
                            genToastError("Data null");
                        }
                    } else {
                        genToastError(deviceOn.error);
                    }
                }
            }
            showTab($("#device_status").text());
        }
    });
}

function turnoffMultiDevice() {
    $.ajax({
        type: "POST",
        url: "http://localhost:8082/api/turnoff_device",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(
            {
                "deviceIdList": selectedDeviceIdList
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
                            genToastError("Data null");
                        }
                    } else {
                        genToastError(deviceOff.error);
                    }
                }
            }
            showTab($("#device_status").text());
        }
    });
}

function turnoffDevice(deviceID) {
    var deviceIdList = [];
    deviceIdList.push(deviceID);
    $.ajax({
        type: "POST",
        url: "http://localhost:8082/api/turnoff_device",
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
                            genToastError("Data null");
                        }
                    } else {
                        genToastError(deviceOff.error);
                    }
                }
            }
            showTab($("#device_status").text());
        }
    });
}

// chạy kịch bản 1 thiết bị
var selectedDeviceId = '';
var scriptMap = new Map();

function showModalRunOneScript(deviceID) {
    $('#run_script_one_device_title').html(deviceID);
    $('#one_script_select').find('option')
        .remove()
        .end()
        .append('<option disabled selected>Chọn kịch bản</option>');
    $('#account_select').find('option')
        .remove()
        .end();
    $("#error_empty_account").hide();
    $("#btn_runOneScript").prop("disabled", true);
    $('#run_script_one_device_dialog').modal('show');

    scriptMap = new Map();
    selectedDeviceId = deviceID;
    $.ajax({
        type: "GET",
        url: "http://localhost:8082/api/get_all_script",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        success: function (data) {
            if (data.length != 0) {
                for (var i = 0; i < data.length; i++) {
                    $('#one_script_select').append($("<option>").val("" + data[i].id + "").text("" + data[i].name + ""));
                    scriptMap.set(data[i].id, data[i].app);
                }
            }
        }
    });
}

function getAccountByScriptForOneDevice() {
    $('#account_select').find('option')
        .remove()
        .end();
    let selectedScriptId = $("#one_script_select").val();
    let appSelected = scriptMap.get(Number(selectedScriptId));

    $.ajax({
        type: "POST",
        url: "http://localhost:8082/api/find_account",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        data: {
            "appName": appSelected
        },
        success: function (data) {
            if (data != 0) {
                $("#error_empty_account").hide();
                $("#account_select").removeAttr("disabled");
                for (var i = 0; i < data.length; i++) {
                    $('#account_select').append($("<option>").val("" + data[i].id + "").text("" + data[i].username + ""));
                }
                onSelectAccountForOneDevice();
            } else {
                $("#error_empty_account").show();
                $("#account_select").prop('disabled', 'disabled');
                $("#account_select").val("");
                $("#btn_runOneScript").prop("disabled", true);
            }
        }
    });
}

function onSelectAccountForOneDevice() {
    if ($("#one_script_select").val() != '' && $("#account_select").val() != '') {
        $("#btn_runOneScript").prop("disabled", false);
    } else {
        $("#btn_runOneScript").prop("disabled", true);
    }
}

function runOneScript() {
    let scriptRequestList = [];
    scriptRequestList.push({
        "accountId": parseInt($("#account_select").val()),
        "deviceId": selectedDeviceId,
        "scriptId": parseInt($("#one_script_select").val())
    });

    $('#run_script_one_device_dialog').modal('hide');

    runScript(scriptRequestList)
}


// chạy kịch bản cho nhiều thiết bị cùng lúc
var deviceIdToAccountMap = new Map();
var accountList = [];

function showModalMultiScript() {
    $('#multi_script_select').find('option').remove().end().append('<option disabled selected>Chọn kịch bản</option>');
    $("#run_script_multi_device").modal('show');
    $("#btn_run_multi_script").prop("disabled", true);
    $("#message_find_account").hide();
    $("#amount_device_selected").html(selectedDeviceIdList.length);
    scriptMap = new Map();
    deviceIdToAccountMap = new Map();
    accountList = [];
    clearMatchDeviceWithAccount();
    $.ajax({
        type: "GET",
        url: "http://localhost:8082/api/get_all_script",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        success: function (data) {
            if (data.length != 0) {
                for (var i = 0; i < data.length; i++) {
                    $('#multi_script_select').append($("<option>").val("" + data[i].id + "").text("" + data[i].name + ""));
                    scriptMap.set(data[i].id, data[i].app);
                }
            }
        }
    });
}

function getAccountByScriptForMultiDevice() {
    let selectedScriptId = $("#multi_script_select").val();
    let appSelected = scriptMap.get(Number(selectedScriptId));
    clearMatchDeviceWithAccount();
    $.ajax({
        type: "POST",
        url: "http://localhost:8082/api/find_account",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        data: {
            "appName": appSelected
        },
        success: function (data) {
            accountList = data;
            if (accountList.length === 0 || accountList.length < selectedDeviceIdList.length) {
                $("#message_find_account").show();
                $("#message_find_account").html("Không có đủ tài khoản đang rảnh cho kịch bản này");
                $("#btn_run_multi_script").prop("disabled", true);
            } else {
                $("#message_find_account").hide();
                $("#btn_run_multi_script").prop("disabled", false);
            }
            autoMatchDeviceWithAccount();
        }
    });
}

function clearMatchDeviceWithAccount() {
    deviceIdToAccountMap.clear();
    $("#btn_run_multi_script").prop("disabled", true);
    for (let i = 0; i < selectedDeviceIdList.length; i++) {
        deviceIdToAccountMap.set(selectedDeviceIdList[i], null);
    }
    showDeviceToAccountMap();
}

function clickSelectAccountDialog(deviceId, currentAccountId) {
    $('#select_account_radio_group').html("");
    selectedDeviceId = deviceId;
    let content = "";
    for (let i = 0; i < accountList.length; i++) {
        if (currentAccountId != null && currentAccountId == accountList[i].id) {
            content = content +
                "<label class=\"radio font-weight-semibold\">\n" +
                "  <input type=\"radio\" name=\"username_radio\" value=\"" + accountList[i].id + "\" checked>\n" +
                "  <span>" + accountList[i].username + "</span>\n" +
                "</label>"
        } else {
            let containt = findInMap(deviceIdToAccountMap, accountList[i]);
            if (containt === false) {
                content = content +
                    "<label class=\"radio font-weight-semibold\">\n" +
                    "  <input type=\"radio\" name=\"username_radio\" value=\"" + accountList[i].id + "\">\n" +
                    "  <span>" + accountList[i].username + "</span>\n" +
                    "</label>"
            } else {
                content = content +
                    "<label class=\"radio font-weight-semibold\" style='color: #b0b0b0' disabled='true'>\n" +
                    "  <input type=\"radio\" name=\"username_radio\" value=\"" + accountList[i].id + "\" disabled>\n" +
                    "  <span>" + accountList[i].username + "</span>\n" +
                    "</label>"
            }
        }
    }
    $('#select_account_radio_group').html(content);
    $("#select_account_dialog").modal('show');
}

function autoMatchDeviceWithAccount() {
    deviceIdToAccountMap.clear();
    for (let i = 0; i < selectedDeviceIdList.length; i++) {
        if (i < accountList.length) {
            deviceIdToAccountMap.set(selectedDeviceIdList[i], accountList[i]);
        } else {
            deviceIdToAccountMap.set(selectedDeviceIdList[i], null);
        }
    }
    showDeviceToAccountMap();
}

function getAccountSelectedInRadioGroup() {
    let selectedAccountId = document.querySelector('input[name="username_radio"]:checked').value;
    for (let i = 0; i < accountList.length; i++) {
        if (accountList[i].id == selectedAccountId) {
            deviceIdToAccountMap.set(selectedDeviceId, accountList[i]);
            break;
        }
    }
    $("#select_account_dialog").modal('hide');
    showDeviceToAccountMap();
}

function showDeviceToAccountMap() {
    let tableContent = "";
    let fillAll = true;
    for (let i = 0; i < selectedDeviceIdList.length; i++) {
        let account = deviceIdToAccountMap.get(selectedDeviceIdList[i]);
        if (account != null) {
            tableContent = tableContent +
                "<tr>\n" +
                "<td>\n" +
                "    <span class='pl-2 font-weight-semibold text-primary'>" + selectedDeviceIdList[i] + "</span>\n" +
                "</td>\n" +
                "<td>\n" +
                "<div style=\"display:flex; align-items: center;\">\n" +
                "    <div style=\"width: 80%;\">\n" +
                "        <span class='pl-2 font-weight-semibold'>" + account.username + "</span>\n" +
                "    </div>\n" +
                "    <button type=\"button\" class=\"btn legitRipple\"\n" +
                "            onclick=\"removeAccount('" + selectedDeviceIdList[i] + "')\"\n" +
                "            style=\"width: 10%; padding: 5px; align-items: center; color: #ff2c2c\">X\n" +
                "    </button>\n" +
                "    <button type=\"button\" class=\"btn legitRipple\"\n" +
                "            onclick=\"clickSelectAccountDialog('" + selectedDeviceIdList[i] + "'," + account.id + ")\"" +
                "            data-target=\"#select_account_dialog\"\n" +
                "            style=\"width: 10%; padding: 5px; align-items: center;\">\n" +
                "        <fa class=\"far fa-caret-square-down\"></fa>\n" +
                "    </button>\n" +
                "</div>\n" +
                "</td>" +
                "</tr>";
        } else {
            fillAll = false;
            tableContent = tableContent +
                "<tr>\n" +
                "<td>\n" +
                "    <span class='pl-2 font-weight-semibold text-primary'>" + selectedDeviceIdList[i] + "</span>\n" +
                "</td>\n" +
                "<td>\n" +
                "<div style=\"display:flex; align-items: center;\">\n" +
                "    <div style=\"width: 90%;\">\n" +
                "        <span class='pl-2 font-weight-semibold'>" + "" + "</span>\n" +
                "    </div>\n" +
                "    <button type=\"button\" class=\"btn legitRipple\"\n" +
                "            onclick=\"clickSelectAccountDialog('" + selectedDeviceIdList[i] + "',null)\"" +
                "            data-target=\"#select_account_dialog\"\n" +
                "            style=\"width: 10%; padding: 5px; align-items: center;\">\n" +
                "        <fa class=\"far fa-caret-square-down\"></fa>\n" +
                "    </button>\n" +
                "</div>\n" +
                "</td>" +
                "</tr>";
        }
    }
    if (fillAll) $("#btn_run_multi_script").prop("disabled", false);
    else $("#btn_run_multi_script").prop("disabled", true);

    $("#device_account_match_body").html(tableContent);
}

function removeAccount(deviceId){
    deviceIdToAccountMap.set(deviceId, null);
    showDeviceToAccountMap();
}

function runScriptForMultiDivice() {
    if (findInMap(deviceIdToAccountMap, null)) {
        cosole.log("Hãy chọn tài khoản cho tất cả thiết bị");
    } else {
        $('#run_script_multi_device').modal('hide');
        let scriptRequestList = [];
        let selectedScript =  parseInt($("#multi_script_select").val());
        deviceIdToAccountMap.forEach((value, key) => {
            scriptRequestList.push({
                "accountId": Number(value.id),
                "deviceId": key,
                "scriptId": selectedScript
            });
        });
        runScript(scriptRequestList);
    }
}

function runScript(scriptRequestList){
    $.ajax({
        type: "POST",
        url: "http://localhost:8082/api/run_script_device",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({
            "list": scriptRequestList
        }),
        success: function (deviceListOffResp) {
            if (deviceListOffResp.length != 0) {
                for (var i = 0; i < deviceListOffResp.length; i++) {
                    var newDeviceStatus = deviceListOffResp[i];
                    if (newDeviceStatus.error == '') {
                        if (dataOriginal.deviceStatistics.length != 0) {
                            for (var j = 0; j < dataOriginal.deviceStatistics.length; j++) {
                                if (dataOriginal.deviceStatistics[j].deviceId == newDeviceStatus.data.deviceId) {
                                    dataOriginal.deviceStatistics[j] = newDeviceStatus.data;
                                }
                            }
                        } else {
                            genToastError("Data null");
                        }
                    } else {
                        genToastError(newDeviceStatus.error);
                    }
                }
            }
            showTab($("#device_status").text());
        }
    });
}

function viewLog(deviceID) {
    $('#log_device_title').html(deviceID);
    $.ajax({
        type: "POST",
        url: "http://localhost:8082/api/device_log",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        data: {
            "deviceId": deviceID
        },
        success: function (data) {
            $('#viewLog_popup').modal('show');
            var content = "";
            if (data.success == true) {
                if (data.data != null) {
                    for (var i = 0; i < data.data.length; i++) {
                        var row = data.data[i];
                        if (row.isActive == false) {
                            content = content +
                                '<tr>' +
                                '<td>' + timeConverter(row.time) + '</td>\n' +
                                '<td>' + genActive(row.isActive) + '</td>\n' +
                                '<td></td>\n' +
                                '<td></td>\n' +
                                '<td></td>\n' +
                                '<td></td>\n' +
                                '<td></td>\n' +
                                '<td></td>\n' +
                                '<td></td>\n' +
                                '<td></td>\n' +
                                '</tr>';
                        } else {
                            if (row.script == "" || row.account == "") {
                                content = content +
                                    '<tr>' +
                                    '<td>' + timeConverter(row.time) + '</td>\n' +
                                    '<td>' + genActive(row.isActive) + '</td>\n' +
                                    '<td>' + genStatus(row.status) + '</td>\n' +
                                    '<td></td>\n' +
                                    '<td></td>\n' +
                                    '<td></td>\n' +
                                    '<td></td>\n' +
                                    '<td></td>\n' +
                                    '<td></td>\n' +
                                    '<td></td>\n' +
                                    '</tr>';
                            } else {
                                content = content +
                                    '<tr>' +
                                    '<td>' + timeConverter(row.time) + '</td>\n' +
                                    '<td>' + genActive(row.isActive) + '</td>\n' +
                                    '<td>' + genStatus(row.status) + '</td>\n' +
                                    '<td><img src="' + row.appIcon + '" class="rounded-circle" width="20" height="20">\n' +
                                    '<span class="ml-2">' + row.app + '</span></td>\n' +
                                    '<td>' + row.account + '</td>\n' +
                                    '<td>' + row.script + '</td>\n' +
                                    '<td>' + row.simId + '</td>\n' +
                                    '<td>' + genProgress(row.progress) + '</td>\n' +
                                    '<td>' + row.action + '</td>\n' +
                                    '<td>' + row.info + '</td>\n' +
                                    '</tr>';
                            }
                        }
                    }
                }
            }
            $('#log_table_body').html(content);
        }
    });
}

function genActive(isActive) {
    let content = '';
    if (isActive) {
        content = '<fa class="fa fa-circle text-success" title="Bật" style="font-size:12px !important"></fa>';
    } else {
        content = '<fa class="fa fa-circle text-danger" title="Tắt" style="font-size:12px !important"></fa>';
    }
    return content;
}

function deleteDevice() {
    $.ajax({
        type: "POST",
        url: "http://localhost:8082/api/delete_device",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({
            "deviceIdList": selectedDeviceIdList,
            "filterDeviceId": $("#search_input").val().trim(),
            "page": 0,
            "size": 100
        }),
        success: function (data) {
            disableAction();
            genToastSuccess(data.message);
            dataOriginal = data;
            filter(dataOriginal);
        }
    });
}

function timeConverter(UNIX_timestamp) {
    let a = new Date(UNIX_timestamp);
    let months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    let year = a.getFullYear();
    let month = months[a.getMonth()];
    let date = a.getDate();
    let hour = a.getHours();
    let min = a.getMinutes();
    let sec = a.getSeconds();
    let time = hour + ':' + min + ':' + sec + ' ' + date + '/' + month + '/' + year;
    return time;
//    return new Date(UNIX_timestamp).toISOString().slice(0, 19).replace('T', ' ');
}

function genToastSuccess(message) {
    $.toast({
        text: message,
        icon: 'success',
        showHideTransition: 'plain',
        allowToastClose: true,
        hideAfter: 3000,
        stack: 5,
        position: 'bottom-left',
        textAlign: 'left',
        loader: true,
        loaderBg: '#00f920',
    });
}

function genToastError(message) {
    $.toast({
        text: message,
        heading: 'Note', // Optional heading to be shown on the toast
        icon: 'error', // Type of toast icon
        showHideTransition: 'plain', // fade, slide or plain
        allowToastClose: true, // Boolean value true or false
        hideAfter: 3000, // false to make it sticky or number representing the miliseconds as time after which toast needs to be hidden
        stack: 5, // false if there should be only one toast at a time or a number representing the maximum number of toasts to be shown at a time
        position: 'bottom-left', // bottom-left or bottom-right or bottom-center or top-left or top-right or top-center or mid-center or an object representing the left, right, top, bottom values
        textAlign: 'left',  // Text alignment i.e. left, right or center
        loader: true,  // Whether to show loader or not. True by default
        loaderBg: '#9EC600',  // Background color of the toast loader
    });
}

function findInMap(map, val) {
    for (let [k, v] of map) {
        if (v === val) {
            return true;
        }
    }
    return false;
}