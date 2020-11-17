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
            }, 2000);
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
            }
            // ,
            // beforeSend: function () {
            //     $("#overlay_spinner_1").show();
            //     $("#btnShowAddDeviceModal").attr("disabled", true);
            //     $('#btnShowAddDeviceModal').css('background-color', '#DBE8E8');
            // }
            ,
            success: function (data) {
                dataOriginal = data;
                filter(dataOriginal);
                // $("#overlay_spinner_1").hide();
                // $("#btnShowAddDeviceModal").attr("disabled", false);
                // $('#btnShowAddDeviceModal').css('background-color', '#ffffff');
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
                '<td>' +
                '<div class="list-icons">\n' +
                '                                        <div class="dropdown">\n' +
                '                                            <a href="#" class="list-icons-item dropdown-toggle" data-toggle="dropdown"\n' +
                '                                               aria-expanded="false">\n' +
                '                                                <i class="icon-more"></i>\n' +
                '                                            </a>\n' +
                '                                            <div class="dropdown-menu" x-placement="bottom-start"\n' +
                '                                                 style="position: absolute; will-change: transform; top: 0; left: 0; transform: translate3d(0px, 19px, 0px);">\n' +
                '                                                <a href="#" class="dropdown-item">\n' +
                '                                                    <i class="icon-mobile"></i>\n' +
                '                                                    Phone\n' +
                '                                                </a>\n' +
                '                                                <a href="#" class="dropdown-item">\n' +
                '                                                    <i class="icon-play4"></i>\n' +
                '                                                    Play</a>\n' +
                '                                                <a href="#" class="dropdown-item">\n' +
                '                                                    <i class="icon-blocked"></i>\n' +
                '                                                    Stop</a>\n' +
                '                                                <a href="#" class="dropdown-item">\n' +
                '                                                    <i class="icon-close2"></i>\n' +
                '                                                    Turn off</a>\n' +
                '                                                <a href="#" class="dropdown-item">\n' +
                '                                                    <i class="icon-exit"></i>\n' +
                '                                                    Shut down</a>\n' +
                '                                                <a href="#" class="dropdown-item">\n' +
                '                                                    <i class="icon-info3"></i>\n' +
                '                                                    Log</a>\n' +
                '                                            </div>\n' +
                '                                        </div>\n' +
                '                                    </div></td>' +
                '</tr>';
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
        status = '<span class="badge bg-info w-50">Running</span>';
    } else if (statusValue == "complete") {
        status = '<span class="badge bg-success w-50">Complete</span>';
    }
    return status;
}

function genProgress(progressValue) {
    var progress = '';
    if (progressValue == 0) {
        progress =
            '   <div class="progress rounded-round" style=" height:0.8rem">\n' +
            '       <div class="progress-bar bg-grey" style="width: ' + 100 + '%;">\n' +
            '               <span>' + progressValue + '%</span>\n' +
            '       </div>\n' +
            '   </div>';
    } else if (progressValue < 100) {
        progress =
            '   <div class="progress rounded-round" style=" height:0.8rem">\n' +
            '       <div class="progress-bar bg-warning" style="width: ' + progressValue + '%;">\n' +
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
