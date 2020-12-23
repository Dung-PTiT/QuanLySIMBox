let editedScriptChain;
let selectedScriptList;
let originalScriptChain;
let allScript;
let editType = "";

function showManageScriptChainDialog() {
    $('#manage_script_chain_table_body').html();
    $('#manage_script_chain_dialog').modal('show');
    loadAllScriptChain();
}

function loadAllScriptChain() {
    $.ajax({
        type: "GET",
        url: "/api/get_all_script_chain",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        success: function (data) {
            if (data != null && data.length > 0) {
                let content = ""
                for (let i = 0; i < data.length; i++) {
                    let scripts = "";
                    for (let j = 0; j < data[i].scriptList.length; j++) {
                        scripts += "<p class=\"m-0\">" + data[i].scriptList[j].name + "</p>\n";
                    }
                    content = content +
                        "<tr class=\"text-center text-dark font-weight-semibold\">\n" +
                        "   <td style=\" width: 5%;\">" + (i + 1) + "</td>\n" +
                        "   <td style=\" width: 15%;\">" + data[i].id + "</td>\n" +
                        "   <td class=\"text-left pl-2\" style=\" width: 25%;\">" + data[i].name + "</td>\n" +
                        "   <td class=\"text-left pl-2\" style=\" width: 35%;\">\n" + scripts + "</td>\n" +
                        "   <td style=\" width: 19%;\">\n" +
                        "       <div class=\"list-icons\">\n" +
                        "           <button onclick=\"editScriptChain(" + data[i].id + ")\" class=\"btn btn-action-device\"\n" +
                        "                   title=\"Chỉnh sửa\"\n" +
                        "                   data-target=\"#edit_script_chain_dialog\">\n" +
                        "               <i class=\"icon-pencil5 text-grey\"></i>\n" +
                        "           </button>\n" +
                        "           <button onclick=\"showDeleteScriptChainConfirm(" + data[i].id + ", '" + data[i].name + "')\"\n" +
                        "                   class=\"btn btn-action-device ml-2\" title=\"Xóa\"\n" +
                        "                   data-target=\"#confirm_popup\">\n" +
                        "               <i class=\"icon-trash text-grey\"></i>\n" +
                        "           </button>\n" +
                        "       </div>\n" +
                        "   </td>\n" +
                        "</tr>"
                }
                $('#manage_script_chain_table_body').html(content)
            }
        }
    });
}

function editScriptChain(scriptChainId) {
    editedScriptChain = null;
    originalScriptChain = null;
    allScript = [];
    $('#list_all_script').empty();
    $('#selected_scipt_list').empty();
    $('#edit_script_chain_dialog').modal('show')
    $.ajax({
        type: "GET",
        url: "/api/get_all_script",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        success: function (data) {
            if (data.length !== 0) {
                allScript = data;
                for (let i = 0; i < allScript.length; i++) {
                    let script = allScript[i];
                    let opt = new Option(script.name, script.id);
                    opt.style.borderRadius = "0px";
                    opt.style.borderBottom = "1px solid #bcbcbc";
                    $('#list_all_script').append(opt);
                }
            }
        }
    });
    if (scriptChainId !== 0) {
        editType = "edit";
        $('#title_edit_script_chain').html("Chỉnh sửa chuỗi kịch bản");
        $('#btn_save_edit_script_chain').html("Lưu");

        $.ajax({
            type: "POST",
            url: "/api/get_script_chain",
            cache: false,
            crossDomain: true,
            processData: true,
            dataType: "json",
            data: {
                "scriptChainId": scriptChainId
            },
            success: function (data) {
                if (!data.success) {
                    alert(data.error)
                } else {
                    let scriptChain = data.data
                    originalScriptChain = scriptChain;
                    editedScriptChain = {...originalScriptChain}
                    $('#input_script_chain_name').val(scriptChain.name)
                    showSelectedScriptList();
                }
            }
        });
    } else {
        editType = "add";
        $('#title_edit_script_chain').html("Thêm chuỗi kịch bản mới");
        $('#btn_save_edit_script_chain').html("Thêm");
        $('#selected_scipt_list').empty();
        $('#input_script_chain_name').val("")

        editedScriptChain = {
            "id": 0,
            "name": '',
            "strScriptIds": '',
            "scriptList": []
        }
    }
}

function showSelectedScriptList() {
    $('#selected_scipt_list').empty();
    for (let i = 0; i < editedScriptChain.scriptList.length; i++) {
        let script = editedScriptChain.scriptList[i];
        let opt = new Option(script.name, script.id);
        opt.style.borderRadius = "0px";
        opt.style.borderBottom = "1px solid #bcbcbc";
        $('#selected_scipt_list').append(opt);
    }
}

function showDeleteScriptChainConfirm(scriptChainId, scriptChainName) {
    $('#btn_ok_comfirm').prop("onclick", null).off("click");
    $('#btn_ok_comfirm').click(function () {
        deleteScriptChain(scriptChainId);
    });
    $('#btn_ok_comfirm').html("Xóa");
    $('#comfirm_title').html("Xác nhận xóa");
    $('#confirm_content').html("Bạn chắc chắn muốn xóa chuỗi kịch bản <span class=\"font-weight-semibold\">" + scriptChainName + "</span> ?");
    $('#confirm_popup').modal('show');
}

function deleteScriptChain(scriptChainId) {
    $.ajax({
        type: "POST",
        url: "/api/delete_script_chain",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        data: {
            "scriptChainId": scriptChainId
        },
        success: function (data) {
            if(data.success) {
                genToastSuccess("Xóa thành công")
                loadAllScriptChain();
            }
            $('#confirm_popup').modal('hide')
        }
    });
}

function selectScript() {
    selectedScriptList = $('#list_all_script').val();
    for (let i = 0; i < selectedScriptList.length; i++) {
        let script = allScript.find(scr => scr.id == selectedScriptList[i]);
        editedScriptChain.scriptList.push(script);
        showSelectedScriptList();
    }
}

function validateEditedScriptChain() {
    if (editedScriptChain == null) {
        alert("Chuỗi kịch bản không xác định");
    } else {
        let name = $('#input_script_chain_name').val();
        if (name == "") {
            alert("Tên chuỗi kịch bản không được để trống !")
        } else if (editedScriptChain.scriptList.length === 0) {
            alert("Hãy chọn ít nhất 1 kịch bản !")
        } else {
            editedScriptChain.name = name;
            let scriptsStr = "";
            for (let i = 0; i < editedScriptChain.scriptList.length; i++) {
                scriptsStr += editedScriptChain.scriptList[i].id + ",";
            }
            editedScriptChain.strScriptIds = scriptsStr;
            return true;
        }
    }
    return false;
}

function saveScriptChain() {
    if (validateEditedScriptChain()) {
        if (editType === "edit") {
            postScriptChain("update_script_chain")
        } else {
            console.log(editedScriptChain.id);
            postScriptChain("add_script_chain")
        }
    }
}

function postScriptChain(path) {
    let url = "/api/" + path;
    $.ajax({
        type: "POST",
        url: url,
        cache: false,
        processData: true,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({
            "id": editedScriptChain.id,
            "name": editedScriptChain.name,
            "strScriptIds": editedScriptChain.strScriptIds
        }),
        success: function (response) {
            if (response.success) {
                genToastSuccess(response.error)
                loadAllScriptChain();
            } else {
                genToastError(response.error)
            }
            $('#edit_script_chain_dialog').modal('hide');
        }
    });
}

function moveUpScript() {
    let selectedIndex = $("#selected_scipt_list").prop('selectedIndex');
    if(selectedIndex > 0){
        let prevIndex = selectedIndex - 1;
        let temp = editedScriptChain.scriptList[selectedIndex];
        editedScriptChain.scriptList[selectedIndex] = editedScriptChain.scriptList[prevIndex];
        editedScriptChain.scriptList[prevIndex] = temp;
        showSelectedScriptList();
    }
}

function moveDownScript() {
    let selectedIndex = $("#selected_scipt_list").prop('selectedIndex');
    if(selectedIndex>=0 && selectedIndex < editedScriptChain.scriptList.length -1){
        let nextIndex = selectedIndex + 1;
        let temp = editedScriptChain.scriptList[selectedIndex];
        editedScriptChain.scriptList[selectedIndex] = editedScriptChain.scriptList[nextIndex];
        editedScriptChain.scriptList[nextIndex] = temp;
        showSelectedScriptList();
    }
}

function deleteScript() {
    let selectedIndex = $("#selected_scipt_list").prop('selectedIndex');
    editedScriptChain.scriptList.splice(selectedIndex, 1);
    showSelectedScriptList();
}