let selectedDevice;
let singleScriptMap;
let scriptAccountMap;
let selectedScriptChain;
let scriptChainList = [];
let selectedScriptIndex;

$(document).ready(function () {
    $('input:radio[name=script_type]').on('change', function () {
        switch ($(this).val()) {
            case 'single_script':
                $('#single_script_group').removeClass("disable");
                $('#script_chain_group').addClass("disable");
                break;
            case 'script_chain':
                $('#single_script_group').addClass("disable");
                $('#script_chain_group').removeClass("disable");
                break;
        }
        validateSelection();
    });
});


function showModalRunOneScript(deviceID) {
    singleScriptMap = new Map();
    scriptAccountMap = new Map();
    selectedScriptChain = null;
    scriptChainList = [];

    $('#one_script_select').find('option')
        .remove()
        .end()
        .append('<option disabled selected>Chọn kịch bản</option>');
    $('#account_select').find('option')
        .remove()
        .end();
    $('#script_chain_select').find('option')
        .remove()
        .end()
        .append('<option disabled selected>Chọn chuỗi kịch bản</option>');
    $('#script_account_map_body').html("");
    $("#error_empty_account").hide();
    // $("#btn_runOneScript").prop("disabled", true);
    $('#run_script_one_device_dialog').modal('show');

    validateSelection();

    selectedDeviceId = deviceID;

    $.ajax({
        type: "POST",
        url: "/api/get_device_statistic",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        data: {
            "deviceId": deviceID
        },
        success: function (response) {
            if (response.success) {
                selectedDevice = response.data;
                checkRadioGroup();
                loadData();
                $('#run_script_one_device_title').html(selectedDevice.deviceId);
            } else {
                genToastError(response.error)
                $('#run_script_one_device_dialog').modal('hide');
            }
        }
    });
}

function checkRadioGroup() {
    if (selectedDevice.scriptChain != null) {
        $('input:radio[name=script_type]').filter('[value=script_chain]').prop('checked', true);

        $('#single_script_group').addClass("disable");
        $('#script_chain_group').removeClass("disable");
    } else {
        $('input:radio[name=script_type]').filter('[value=single_script]').prop('checked', true);

        $('#single_script_group').removeClass("disable");
        $('#script_chain_group').addClass("disable");
    }
    validateSelection();
}

function loadData() {
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
                    let selected = false;
                    if (data[i].name == selectedDevice.script) selected = true;
                    $('#one_script_select').append($("<option>").val("" + data[i].id + "").text("" + data[i].name + "").prop('selected', selected));
                    singleScriptMap.set(data[i].id, data[i].app);
                    if (selected == true) getAccountByScriptForOneDevice();
                }
            }
        }
    });

    $.ajax({
        type: "GET",
        url: "/api/get_all_script_chain",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        success: function (data) {
            if (data.length != 0) {
                scriptChainList = data;
                for (var i = 0; i < data.length; i++) {
                    let selected = false;
                    if (selectedDevice.scriptChain != null && data[i].id == selectedDevice.scriptChain.id) selected = true;
                    $('#script_chain_select').append($("<option>").val("" + data[i].id + "").text("" + data[i].name + "").prop('selected', selected));
                    if (selected == true) {
                        scriptAccountMap = new Map();
                        selectedScriptChain = selectedDevice.scriptChain;
                        // for (let j = 0; j < selectedScriptChain.scriptList.length; j++) {
                        //     scriptAccountMap.set(i, {});
                        // }
                        showScriptAcountTable();
                    }
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
    let appSelected = singleScriptMap.get(Number(selectedScriptId));

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
            if (data != 0) {
                $("#error_empty_account").hide();
                $("#account_select").removeAttr("disabled");
                for (var i = 0; i < data.length; i++) {
                    $('#account_select').append($("<option>").val("" + data[i].id + "").text("" + data[i].username + ""));
                }
            } else {
                $("#error_empty_account").show();
                $("#account_select").prop('disabled', 'disabled');
                $("#account_select").val("");
                // $("#btn_runOneScript").prop("disabled", true);
            }
            validateSelection();
        }
    });
}

function onScriptChainChange() {
    scriptAccountMap = new Map();
    let selectedScriptChainId = $('#script_chain_select').val();
    selectedScriptChain = scriptChainList.find(sr => sr.id == selectedScriptChainId);
    showScriptAcountTable();
}

function showScriptAcountTable() {
    let content = "";
    $('#script_account_map_body').html("");
    for (let i = 0; i < selectedScriptChain.scriptList.length; i++) {
        let script = selectedScriptChain.scriptList[i];
        let account = scriptAccountMap.get(Number(i));
        let accountName = ""
        let accountId = null;
        if (account != null) {
            accountName = account.username;
            accountId = account.id;
        }
        content = content +
            "<tr>\n" +
            "    <td style=\"width: 40.4%\">\n" + script.name +
            "    </td>\n" +
            "    <td style=\"width: 60%\">\n" +
            "        <div style=\"display:flex; align-items: center;\">\n" +
            "            <p>" + accountName + "</p>\n" +
            "            <button type=\"button\" class=\"btn legitRipple\"\n" +
            "                    onclick=\"showSelectAccountScriptDialog(" + i + "," + accountId + ",'" + script.app + "')\"\n" +
            "                    data-target=\"#select_account_dialog\">\n" +
            "                <fa class=\"far fa-caret-square-down\"></fa>\n" +
            "            </button>\n" +
            "        </div>\n" +
            "    </td>\n" +
            "</tr>"
    }
    $('#script_account_map_body').html(content);
    validateSelection();
}

function showSelectAccountScriptDialog(scriptIndex, currentAccountId, appName) {
    $('#select_account_script_radio_group').html("");
    $("#select_account_for_script_dialog").modal('show');
    selectedScriptIndex = scriptIndex;

    $.ajax({
        type: "POST",
        url: "/api/find_account",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        data: {
            "appName": appName
        },
        success: function (data) {
            accountList = data;
            let content = "";
            for (let i = 0; i < accountList.length; i++) {
                if (currentAccountId != null && currentAccountId == accountList[i].id) {
                    content = content +
                        "<label class=\"radio font-weight-semibold\">\n" +
                        "  <input type=\"radio\" name=\"username_script_radio\" value=\"" + accountList[i].id + "\" checked>\n" +
                        "  <span>" + accountList[i].username + "</span>\n" +
                        "</label>"
                } else {
                    content = content +
                        "<label class=\"radio font-weight-semibold\">\n" +
                        "  <input type=\"radio\" name=\"username_script_radio\" value=\"" + accountList[i].id + "\">\n" +
                        "  <span>" + accountList[i].username + "</span>\n" +
                        "</label>"
                }
            }
            $('#select_account_script_radio_group').html(content);
        }
    });
}

function getAccountSelectedInRadioGroup_forScript() {
    let selectedRadio = document.querySelector('input[name="username_script_radio"]:checked')
    if (selectedRadio == null) return;

    let selectedAccountId = selectedRadio.value;
    for (let i = 0; i < accountList.length; i++) {
        if (accountList[i].id == selectedAccountId) {
            scriptAccountMap.set(selectedScriptIndex, accountList[i]);
            break;
        }
    }
    $("#select_account_for_script_dialog").modal('hide');
    showScriptAcountTable();
}

function validateSelection() {
    let type = $("input[name='script_type']:checked").val()
    let valid = false;
    if (type == "single_script") {
        let scriptName = $("select#one_script_select option").filter(":selected").text();
        let accountId = $("select#account_select option").filter(":selected").val();
        let scriptId;

        if (scriptName !== "Chọn kịch bản" || accountId != null) {
            valid = true;
        }
    } else {
        let fillAll = true;
        if (selectedScriptChain == null) {
            valid = false;
        } else {
            for (let i = 0; i < selectedScriptChain.scriptList.length; i++) {
                if (scriptAccountMap.get(Number(i)) == null) {
                    fillAll = false;
                    break;
                }
            }
            valid = fillAll;
        }
    }
    if(valid == true){
        $('#btn_runOneScript').prop('disabled', false)
    } else {
        $('#btn_runOneScript').prop('disabled', true)
    }
}

function runOneScript() {
    if (selectedDevice.finish == false) {
        alert("Thiết bị đang chạy kịch bản khác. Hãy dừng việc chạy kịch bản đó lại để tiếp chạy kịch bản mới !")
        return;
    }
    let scriptRequestList = [];
    let type = $("input[name='script_type']:checked").val()
    if (type == "single_script") {
        let accountId = $("select#account_select option").filter(":selected").val();
        let scriptId = $("select#one_script_select option").filter(":selected").val();
        scriptRequestList.push({
            "accountId": accountId,
            "deviceId": selectedDeviceId,
            "scriptId": scriptId
        });
        $('#run_script_one_device_dialog').modal('hide');
        runScript(scriptRequestList, 0)
    } else {
        scriptAccountMap.forEach((value, key) => {
            scriptRequestList.push({
                "accountId": parseInt(value.id),
                "deviceId": selectedDeviceId,
                "scriptId": parseInt(selectedScriptChain.scriptList[key].id)
            });
        })
        $('#run_script_one_device_dialog').modal('hide');
        runScript(scriptRequestList, selectedScriptChain.id)
    }
}