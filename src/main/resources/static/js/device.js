var dataOriginal;
var deviceNumberChecked = 0;
var selectedDeviceIdList = [];
var selectedDeviceId = '';
var scriptMap = new Map();
var deviceIdToAccountMap = new Map();
var accountList = [];

$(document).ready(function () {
    getData();
    selectAllClickListener();
    $("#inputNumberDevice").TouchSpin({
        buttondown_class: "btn btn-light",
        buttonup_class: "btn btn-light"
    });
});

function selectAllClickListener() {
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

    for (let i = 0; i < 30; i++) {
        let j = i + 1;
        $('#selectNumberPage').append($("<option>").val("" + j + "").text("" + j + ""));
        $('#selectNumberRecord').append($("<option>").val("" + j + "").text("" + j + ""));
    }

}

function fillSelectedDeviceIdList() {
    if ($('#select_all').is(":checked")) {
        selectedDeviceIdList = [];
        for (let i = 0; i < dataOriginal.deviceStatistics.length; i++) {
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

function onSelectDevice(deviceId) {
    $("#select_all").prop("checked", false);
    if (!selectedDeviceIdList.includes(deviceId)) {
        selectedDeviceIdList.push(deviceId);
    } else {
        selectedDeviceIdList.remove(deviceId);
    }
    if (selectedDeviceIdList.length != 0) {
        enableAction(selectedDeviceIdList.length);
        updateSelectAllChecked();
    } else {
        disableAction();
    }
}

function updateSelectAllChecked() {
    if (selectedDeviceIdList.length == dataOriginal.deviceStatistics.length) {
        $("#select_all").prop("checked", true);
    } else {
        $("#select_all").prop("checked", false);
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
        url: "/api/manage_device",
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
    $('#inputNumberDevice').val(1);
    $("#overlay_spinner_1").hide();
}

function addDevice() {
    $('#addDevice_popup').modal('hide');
    let amount = $("#inputNumberDevice").val();
    amount = parseInt(amount);
    genToastInfo("Đang thêm " + amount + " thiết bị mới ....");
    if (amount != '') {
        $.ajax({
            type: "POST",
            url: "/api/add_device",
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
                genToastInfo(data.message);
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
        dataTable.sort(function (a, b) {
            return a.index - b.index;
        });
        for (var i = 0; i < dataTable.length; i++) {
            var row = dataTable[i];
            if (row.status == "sleeping") {
                contentString = contentString +
                    '<tr style="height: 53px">' +
                    '<td>' + genCheckox(row.index, row.deviceId) + '</td>\n' +
                    '<td>' + row.deviceId + '</td>\n' +
                    '<td>' + genActive(row.isActive) + '</td>\n' +
                    '<td>' + genStatus(row.status) + '</td>\n' +
                    '<td></td>\n' +
                    '<td></td>\n' +
                    '<td></td>\n' +
                    '<td></td>\n' +
                    '<td></td>\n' +
                    '<td>' + genButtonActionDevice(row.script, row.account, row.status, row.deviceId, row.isActive, row.isStarting) +
                    '</tr>';
            } else if (row.isActive == false) {
                if (row.status == "wait") {
                    contentString = contentString +
                        '<tr style="height: 53px">' +
                        '<td>' + genCheckox(row.index, row.deviceId) + '</td>\n' +
                        '<td>' + row.deviceId + '</td>\n' +
                        '<td>' + genActive(row.isActive) + '</td>\n' +
                        '<td>' + genStatus(row.status) + '</td>\n' +
                        '<td></td>\n' +
                        '<td></td>\n' +
                        '<td></td>\n' +
                        '<td></td>\n' +
                        '<td></td>\n' +
                        '<td>' + genButtonActionDevice(row.script, row.account, row.status, row.deviceId, row.isActive, row.isStarting) +
                        '</tr>';
                } else {
                    contentString = contentString +
                        '<tr style="height: 53px">' +
                        '<td>' + genCheckox(row.index, row.deviceId) + '</td>\n' +
                        '<td>' + row.deviceId + '</td>\n' +
                        '<td>' + genActive(row.isActive) + '</td>\n' +
                        '<td></td>\n' +
                        '<td></td>\n' +
                        '<td></td>\n' +
                        '<td></td>\n' +
                        '<td></td>\n' +
                        '<td></td>\n' +
                        '<td>' + genButtonActionDevice(row.script, row.account, row.status, row.deviceId, row.isActive, row.isStarting) +
                        '</tr>';
                }
            } else if (row.isActive == true) {
                if (row.status == "finished") {
                    contentString = contentString +
                        '<tr style="height: 53px">' +
                        '<td>' + genCheckox(row.index, row.deviceId) + '</td>\n' +
                        '<td>' + row.deviceId + '</td>\n' +
                        '<td>' + genActive(row.isActive) + '</td>\n' +
                        '<td>' + genStatus(row.status) + '</td>\n' +
                        '<td></td>\n' +
                        '<td></td>\n' +
                        '<td></td>\n' +
                        '<td></td>\n' +
                        '<td></td>\n' +
                        '<td>' + genButtonActionDevice(row.script, row.account, row.status, row.deviceId, row.isActive, row.isStarting) +
                        '</tr>';
                } else if (row.script == "" || row.account == "") {
                    contentString = contentString +
                        '<tr style="height: 53px">' +
                        '<td>' + genCheckox(row.index, row.deviceId) + '</td>\n' +
                        '<td>' + row.deviceId + '</td>\n' +
                        '<td>' + genActive(row.isActive) + '</td>\n' +
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
                        '<tr style="height: 53px">' +
                        '<td>' + genCheckox(row.index, row.deviceId) + '</td>\n' +
                        '<td>' + row.deviceId + '</td>\n' +
                        '<td>' + genActive(row.isActive) + '</td>\n' +
                        '<td>' + genStatus(row.status) + '</td>\n' +
                        '<td><img src="' + row.appIcon + '" width="20" height="20">\n' +
                        '<span class="ml-2">' + row.app + '</span></td>\n' +
                        '<td>' + row.account + '</td>\n' +
                        '<td>' + row.script + '</td>\n' +
                        '<td class="p-2">' + genProgress(row.progress, row.action, row.status) + '</td>\n' +
                        '<td>' + genMessage(row.message, row.code, row.status) + '</td>\n' +
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
                '<input checked class="checkbox" type="checkbox" onclick="onSelectDevice(\'' + deviceId + '\')">\n' +
                '<span class="ml-2">' + index + '</span>';

            //thay đổi số lượng trong khay hành động
            deviceNumberChecked++;
        } else {
            checkbox =
                '<input class="checkbox" type="checkbox" onclick="onSelectDevice(\'' + deviceId + '\')">\n' +
                '<span class="ml-2">' + index + '</span>';
        }
    } else {
        checkbox =
            '<input class="checkbox" type="checkbox" onclick="onSelectDevice(\'' + deviceId + '\')">\n' +
            '<span class="ml-2">' + index + '</span>';
    }
    return checkbox;
}

function genStatus(statusValue) {
    let status;
    if (statusValue == "") {
        status = '';
    } else if (statusValue == "free") {
        status = '<span class="badge bg-blue" style="min-width: 48px">Free</span>';
    } else if (statusValue == "running") {
        status = '<span class="badge bg-purple" style="min-width: 48px">Running</span>';
    } else if (statusValue == "complete") {
        status = '<span class="badge bg-success" style="min-width: 48px">Complete</span>';
    } else if (statusValue == "fail") {
        status = '<span class="badge bg-danger" style="min-width: 48px">Fail</span>';
    } else if (statusValue == "stopped") {
        status = '<span class="badge bg-warning" style="min-width: 48px">Stopped</span>';
    } else if (statusValue == "finished") {
        status = '<span class="badge bg-indigo" style="min-width: 48px">Finished</span>';
    } else if (statusValue == "wait") {
        status = '<span class="badge bg-slate-300" style="min-width: 48px">Wait</span>';
    } else if (statusValue == "sleeping") {
        status = '<span class="badge bg-brown-400" style="min-width: 48px">Sleeping</span>';
    }
    return status;
}

function genProgress(progressValue, action, status) {
    let backgroundColor = "";
    if (status == "fail") {
        backgroundColor = "bg-danger";
    } else if (progressValue == 100) {
        backgroundColor = "bg-success";
    } else if (status == "stopped") {
        backgroundColor = "bg-warning";
    } else {
        backgroundColor = "bg-purple";
    }
    let progress = "<p class=\"p-0 mb-1\" style=\"font-size: 12px;\">" + action + "</p>";

    if (progressValue == 0) {
        progress = progress +
            '   <div class="progress rounded-round" style=" height:0.8rem">\n' +
            '       <div class="progress-bar" style="width: ' + 100 + '%; background-color: #f2f2f2">\n' +
            '               <span class="text-grey">' + progressValue + '%</span>\n' +
            '       </div>\n' +
            '   </div>';
    } else if (progressValue < 100) {
        progress = progress +
            '   <div class="progress rounded-round" style=" height:0.8rem">\n' +
            '       <div class="progress-bar ' + backgroundColor + '" style="width: ' + progressValue + '%;">\n' +
            '               <span>' + progressValue + '%</span>\n' +
            '       </div>\n' +
            '   </div>';
    } else if (progressValue == 100) {
        progress = progress +
            '   <div class="progress rounded-round" style=" height:0.8rem">\n' +
            '       <div class="progress-bar ' + backgroundColor + '" style="width: ' + progressValue + '%;">\n' +
            '               <span>' + progressValue + '%</span>\n' +
            '       </div>\n' +
            '   </div>';
    }
    return progress;
}

function genButtonActionDevice(script, account, status, deviceId, isActived, isStaring) {
    let button = '';
    if (status == "sleeping") {
        button =
            '<div class="list-icons">\n' +
            '<div x-placement="bottom-start">\n' +
            '    <button onclick="viewDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem màn hình thiết bị" disabled>\n' +
            '        <i class="icon-mobile text-grey"></i>\n' +
            '    </button>\n' +
            '    <button onclick="startScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Chạy kịch bản" disabled>\n' +
            '        <i class="icon-play4 text-grey" style="font-size: 18px !important;"></i>\n' +
            '    </button>\n' +
            '    <button onclick="showStopScriptConfirm(\'' + deviceId + '\')" class="btn btn-action-device" title="Dừng chạy kịch bản">\n' +
            '        <i class="icon-square text-warning font-size-sm"></i>\n' +
            '    </button>\n' +
            '    <button onclick="turnonDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Bật thiết bị" disabled>\n' +
            '        <fa class="fa fa-power-off text-success"></fa>\n' +
            '    </button>\n' +
            '    <button onclick="showTurnoffSingleDeviceConfirm(\'' + deviceId + '\')" class="btn btn-action-device" title="Tắt thiết bị" style="display: none" >\n' +
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
    } else if (isActived == false) {
        if (isStaring == true) {
            button =
                '<div id="overlay_spinner_1">\n' +
                '<div class="cv-spinner">\n' +
                '    <span class="spinner"></span>\n' +
                '</div>\n' +
                '</div>';
        } else {
            if (status == "wait") {
                button =
                    ' <div class="list-icons">\n' +
                    '<div x-placement="bottom-start">\n' +
                    '    <button onclick="viewDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem màn hình thiết bị" disabled>\n' +
                    '        <i class="icon-mobile text-grey"></i>\n' +
                    '    </button>\n' +
                    '    <button onclick="startScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Chạy kịch bản" disabled>\n' +
                    '        <i class="icon-play4 text-grey" style="font-size: 18px !important;"></i>\n' +
                    '    </button>\n' +
                    '    <button onclick="showStopScriptConfirm(\'' + deviceId + '\')" class="btn btn-action-device" title="Dừng chạy kịch bản">\n' +
                    '        <i class="icon-square text-warning font-size-sm"></i>\n' +
                    '    </button>\n' +
                    '    <button onclick="turnonDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Bật thiết bị" disabled>\n' +
                    '        <fa class="fa fa-power-off text-success"></fa>\n' +
                    '    </button>\n' +
                    '    <button onclick="showTurnoffSingleDeviceConfirm(\'' + deviceId + '\')" class="btn btn-action-device" title="Tắt thiết bị" style="display: none" >\n' +
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
                    '    <button onclick="showStopScriptConfirm(\'' + deviceId + '\')" class="btn btn-action-device" title="Dừng chạy kịch bản" disabled>\n' +
                    '        <i class="icon-square text-grey font-size-sm"></i>\n' +
                    '    </button>\n' +
                    '    <button onclick="turnonDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Bật thiết bị">\n' +
                    '        <fa class="fa fa-power-off text-success"></fa>\n' +
                    '    </button>\n' +
                    '    <button onclick="showTurnoffSingleDeviceConfirm(\'' + deviceId + '\')" class="btn btn-action-device" title="Tắt thiết bị" style="display: none" >\n' +
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
                '    <button onclick="showStopScriptConfirm(\'' + deviceId + '\')" class="btn btn-action-device" title="Dừng chạy kịch bản" disabled>\n' +
                '        <i class="icon-square text-grey font-size-sm"></i>\n' +
                '    </button>\n' +
                '    <button onclick="turnonDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Bật thiết bị" style="display: none">\n' +
                '        <fa class="fa fa-power-off text-success"></fa>\n' +
                '    </button>\n' +
                '    <button onclick="showTurnoffSingleDeviceConfirm(\'' + deviceId + '\')" class="btn btn-action-device" title="Tắt thiết bị">\n' +
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
                    '    <button onclick="showStopScriptConfirm(\'' + deviceId + '\')" class="btn btn-action-device" title="Dừng chạy kịch bản" disabled>\n' +
                    '        <i class="icon-square text-grey font-size-sm"></i>\n' +
                    '    </button>\n' +
                    '    <button onclick="turnonDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Bật thiết bị" style="display: none" >\n' +
                    '        <fa class="fa fa-power-off text-success"></fa>\n' +
                    '    </button>\n' +
                    '    <button onclick="showTurnoffSingleDeviceConfirm(\'' + deviceId + '\')" class="btn btn-action-device" title="Tắt thiết bị">\n' +
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
            } else if (status == 'running' || (status == 'fail') || status == 'complete') {
                button =
                    ' <div class="list-icons">\n' +
                    '<div x-placement="bottom-start">\n' +
                    '    <button onclick="viewDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem màn hình thiết bị">\n' +
                    '        <i class="icon-mobile text-indigo"></i>\n' +
                    '    </button>\n' +
                    '    <button onclick="startScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Chạy kịch bản" disabled>\n' +
                    '        <i class="icon-play4 text-grey" style="font-size: 18px !important;"></i>\n' +
                    '    </button>\n' +
                    '    <button onclick="showStopScriptConfirm(\'' + deviceId + '\')" class="btn btn-action-device" title="Dừng chạy kịch bản">\n' +
                    '        <i class="icon-square text-warning font-size-sm"></i>\n' +
                    '    </button>\n' +
                    '    <button onclick="turnonDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Bật thiết bị"  style="display: none" >\n' +
                    '        <fa class="fa fa-power-off text-success"></fa>\n' +
                    '    </button>\n' +
                    '    <button onclick="showTurnoffSingleDeviceConfirm(\'' + deviceId + '\')" class="btn btn-action-device" title="Tắt thiết bị">\n' +
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
            } else if (status == 'stopped' || status == 'finished') {
                button =
                    ' <div class="list-icons">\n' +
                    '<div x-placement="bottom-start">\n' +
                    '    <button onclick="viewDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Xem màn hình thiết bị">\n' +
                    '        <i class="icon-mobile text-indigo"></i>\n' +
                    '    </button>\n' +
                    '    <button onclick="startScript(\'' + deviceId + '\')" class="btn btn-action-device" title="Chạy kịch bản">\n' +
                    '        <i class="icon-play4 text-success" style="font-size: 18px !important;"></i>\n' +
                    '    </button>\n' +
                    '    <button onclick="showStopScriptConfirm(\'' + deviceId + '\')" class="btn btn-action-device" title="Dừng chạy kịch bản" disabled>\n' +
                    '        <i class="icon-square text-grey font-size-sm"></i>\n' +
                    '    </button>\n' +
                    '    <button onclick="turnonDevice(\'' + deviceId + '\')" class="btn btn-action-device" title="Bật thiết bị" style="display: none" >\n' +
                    '        <fa class="fa fa-power-off text-success"></fa>\n' +
                    '    </button>\n' +
                    '    <button onclick="showTurnoffSingleDeviceConfirm(\'' + deviceId + '\')" class="btn btn-action-device" title="Tắt thiết bị">\n' +
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
        url: "/api/start_script",
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

function showStopScriptConfirm(deviceID) {
    $('#btn_finish_script').prop("onclick", null).off("click");
    $('#btn_stop_script').prop("onclick", null).off("click");
    let deviceStatistics = dataOriginal.deviceStatistics.find(dv => dv.deviceId === deviceID);

    if (deviceStatistics.status == "sleeping") {
        $('#btn_finish_script').show();
        $('#btn_finish_script').html("Cancel sleep");
        $('#btn_finish_script').click(function () {
            postRequestDevice(deviceID, "/api/cancel_sleep");
        });
        $('#btn_stop_script').hide();
    } else if (deviceStatistics.status == "wait") {
        $('#btn_finish_script').show();
        $('#btn_finish_script').html("Hủy đợi");
        $('#btn_finish_script').click(function () {
            postRequestDevice(deviceID, "/api/remove_out_queue");
        });
        $('#btn_stop_script').hide();
    } else {
        $('#btn_finish_script').show();
        $('#btn_finish_script').html("Kết thúc");
        if (deviceStatistics.scriptChain == null) {
            $('#btn_stop_script').hide();
        } else {
            $('#btn_stop_script').show();
        }
        $('#btn_stop_script').show();

        $('#btn_finish_script').click(function () {
            postRequestDevice(deviceID, "/api/finish_script");
        });
        $('#btn_stop_script').click(function () {
            postRequestDevice(deviceID, "/api/stop_script");
        });
    }
    $('#confirm_stop_script_popup').modal('show');
}

function postRequestDevice(deviceID, url) {
    let deviceIdList = [];
    deviceIdList.push(deviceID);

    $('#confirm_stop_script_popup').modal('hide');
    $.ajax({
        type: "POST",
        url: url,
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

function showRestartDeviceConfirm() {
    $('#btn_ok_comfirm').prop("onclick", null).off("click");
    $('#btn_ok_comfirm').click(function () {
        restartDevice();
        selectedDeviceIdList = [];
        updateSelectAllChecked();
    });
    $('#btn_ok_comfirm').html("Restart");
    $('#comfirm_title').html("Xác nhận khởi động lại");
    $('#confirm_content').html("Bạn chắc chắn muốn khởi động lại " + selectedDeviceIdList.length + " thiết bị ?");
    $('#confirm_popup').modal('show');
}

function restartDevice() {
    $('#confirm_popup').modal('hide');
    $.ajax({
        type: "POST",
        url: "/api/restart_device",
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
        url: "/api/turnon_device",
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
        url: "/api/turnon_device",
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

function showTurnoffMultiDeviceConfirm() {
    $('#btn_ok_comfirm').prop("onclick", null).off("click");
    $('#btn_ok_comfirm').click(function () {
        turnOffDecive(selectedDeviceIdList);
        selectedDeviceIdList = [];
        updateSelectAllChecked();
    });
    $('#btn_ok_comfirm').html("Tắt");
    $('#comfirm_title').html("Xác nhận tắt");
    $('#confirm_content').html("Bạn chắc chắn muốn tắt " + selectedDeviceIdList.length + " thiết bị ?");
    $('#confirm_popup').modal('show');
}

function showTurnoffSingleDeviceConfirm(deviceID) {
    $('#btn_ok_comfirm').prop("onclick", null).off("click");
    $('#btn_ok_comfirm').click(function () {
        let deviceIdList = [];
        deviceIdList.push(deviceID);
        turnOffDecive(deviceIdList);
    });
    $('#btn_ok_comfirm').html("Tắt");
    $('#comfirm_title').html("Xác nhận tắt");
    $('#confirm_content').html("Bạn chắc chắn muốn tắt thiết bị ?");
    $('#confirm_popup').modal('show');
}

function turnOffDecive(deviceIdList) {
    $('#confirm_popup').modal('hide');
    $.ajax({
        type: "POST",
        url: "/api/turnoff_device",
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
        url: "/api/get_all_script",
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
        url: "/api/find_account",
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

function showSelectAccountDialog(deviceId, currentAccountId) {
    $('#select_account_device_radio_group').html("");
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
    $('#select_account_device_radio_group').html(content);
    $("#select_account_for_device_dialog").modal('show');
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
                "    <span class='pl-2 font-weight-semibold text-dark'>" + selectedDeviceIdList[i] + "</span>\n" +
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
                "            onclick=\"showSelectAccountDialog('" + selectedDeviceIdList[i] + "'," + account.id + ")\"" +
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
                "    <span class='pl-2 font-weight-semibold text-dark'>" + selectedDeviceIdList[i] + "</span>\n" +
                "</td>\n" +
                "<td>\n" +
                "<div style=\"display:flex; align-items: center;\">\n" +
                "    <div style=\"width: 90%;\">\n" +
                "        <span class='pl-2 font-weight-semibold'>" + "" + "</span>\n" +
                "    </div>\n" +
                "    <button type=\"button\" class=\"btn legitRipple\"\n" +
                "            onclick=\"showSelectAccountDialog('" + selectedDeviceIdList[i] + "',null)\"" +
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

function removeAccount(deviceId) {
    deviceIdToAccountMap.set(deviceId, null);
    showDeviceToAccountMap();
}

function runScriptForMultiDivice() {
    if (findInMap(deviceIdToAccountMap, null)) {
        alert("Hãy chọn tài khoản cho tất cả thiết bị");
    } else {
        $('#run_script_multi_device').modal('hide');
        let scriptRequestList = [];
        let selectedScript = parseInt($("#multi_script_select").val());
        deviceIdToAccountMap.forEach((value, key) => {
            scriptRequestList.push({
                "accountId": Number(value.id),
                "deviceId": key,
                "scriptId": selectedScript
            });
        });
        runScript(scriptRequestList, 0);
    }
}

function runScript(requestScriptList, scriptChainId, repeatTime) {
    $.ajax({
        type: "POST",
        url: "/api/run_script_device",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(
            {
                "requestScriptList": requestScriptList,
                "scriptChainId": scriptChainId,
                "repeatTime": repeatTime
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
    $('#viewLog_popup').modal('show');
    $.ajax({
        type: "POST",
        url: "/api/device_log",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        data: {
            "deviceId": deviceID
        },
        success: function (data) {
            var content = "";
            if (data.success == true) {
                if (data.data != null) {
                    for (var i = 0; i < data.data.length; i++) {
                        var row = data.data[i];
                        if (row.status == "sleeping") {
                            content = content +
                                '<tr>' +
                                '<td style=" width: 8%;">' + timeConverter(row.time) + '</td>\n' +
                                '<td style=" width: 6%;">' + genActive(row.isActive) + '</td>\n' +
                                '<td style=" width: 7%;">' + genStatus(row.status) + '</td>\n' +
                                '<td style=" width: 9%;"></td>\n' +
                                '<td style=" width: 10%;"></td>\n' +
                                '<td style=" width: 10%;"></td>\n' +
                                '<td style=" width: 11%;"></td>\n' +
                                '<td style=" width: 10%;"></td>\n' +
                                '<td style=" width: 14%;"></td>\n' +
                                '<td style=" width: 14.7%;"></td>\n' +
                                '</tr>';
                        } else if (row.isActive == false) {
                            content = content +
                                '<tr>' +
                                '<td style=" width: 8%;">' + timeConverter(row.time) + '</td>\n' +
                                '<td style=" width: 6%;">' + genActive(row.isActive) + '</td>\n' +
                                '<td style=" width: 7%;"></td>\n' +
                                '<td style=" width: 9%;"></td>\n' +
                                '<td style=" width: 10%;"></td>\n' +
                                '<td style=" width: 10%;"></td>\n' +
                                '<td style=" width: 11%;"></td>\n' +
                                '<td style=" width: 10%;"></td>\n' +
                                '<td style=" width: 14%;"></td>\n' +
                                '<td style=" width: 14.7%;"></td>\n' +
                                '</tr>';
                        } else {
                            if (row.script == "" || row.account == "" || row.status == "finished" || row.status == "wait") {
                                content = content +
                                    '<tr>' +
                                    '<td style=" width: 8%;">' + timeConverter(row.time) + '</td>\n' +
                                    '<td style=" width: 6%;">' + genActive(row.isActive) + '</td>\n' +
                                    '<td style=" width: 7%;">' + genStatus(row.status) + '</td>\n' +
                                    '<td style=" width: 9%;"></td>\n' +
                                    '<td style=" width: 10%;"></td>\n' +
                                    '<td style=" width: 10%;"></td>\n' +
                                    '<td style=" width: 11%;"></td>\n' +
                                    '<td style=" width: 10%;"></td>\n' +
                                    '<td style=" width: 14%;"></td>\n' +
                                    '<td style=" width: 14.7%;"></td>\n' +
                                    '</tr>';
                            } else {
                                content = content +
                                    '<tr>' +
                                    '<td style=" width: 8%;">' + timeConverter(row.time) + '</td>\n' +
                                    '<td style=" width: 6%;">' + genActive(row.isActive) + '</td>\n' +
                                    '<td style=" width: 7%;">' + genStatus(row.status) + '</td>\n' +
                                    '<td style=" width: 9%;"><img src="' + row.appIcon + '" width="20" height="20">\n' +
                                    '<span class="ml-2">' + row.app + '</span></td>\n' +
                                    '<td style=" width: 10%;">' + row.account + '</td>\n' +
                                    '<td style=" width: 10%;">' + row.script + '</td>\n' +
                                    '<td style=" width: 11%;">' + row.simId + '</td>\n' +
                                    '<td style=" width: 10%;">' + genProgress(row.progress, row.action, row.status) + '</td>\n' +
                                    '<td style=" width: 14%;">' + genMessage(row.message, row.code, row.status) + '</td>\n' +
                                    '<td style=" width: 14.7%;">' + row.info + '</td>\n' +
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

function genMessage(message, code, status) {
    if (status == "complete" && message == "") {
        return "<p class=\"text-danger font-weight-semibold m-0\" style=\"text-align: center; cursor: pointer\">No message</p>";
    } else if (message != '' && code != '') {
        return "<p class=\"text-primary font-weight-semibold m-0\" style=\"text-align: center; cursor: pointer\" title='" + message + "'>" + code + "</p>"
    } else if (message != '' && code == '') {
        return "<p class=\"text-danger font-weight-semibold m-0\" style=\"text-align: center; cursor: pointer\" title='" + message + "'>No code</p>"
    }
    return "";
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

function showDeleteDeviceConfirm() {
    $('#btn_ok_comfirm').prop("onclick", null).off("click");
    $('#btn_ok_comfirm').click(function () {
        deleteDevice()
    });
    $('#btn_ok_comfirm').html("Xóa");
    $('#comfirm_title').html("Xác nhận xóa thiết bị");
    $('#confirm_content').html("Bạn chắc chắn muốn xóa " + selectedDeviceIdList.length + " thiết bị ?");
    $('#confirm_popup').modal('show');
}

function deleteDevice() {
    $('#confirm_popup').modal('hide');
    genToastInfo("Đang xóa " + selectedDeviceIdList.length + " thiết bị");
    $.ajax({
        type: "POST",
        url: "/api/delete_device",
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
            genToastInfo(data.message);
            dataOriginal = data;
            filter(dataOriginal);
        }
    });
    selectedDeviceIdList = [];
    updateSelectAllChecked();
}

function findInMap(map, val) {
    for (let [k, v] of map) {
        if (v === val) {
            return true;
        }
    }
    return false;
}