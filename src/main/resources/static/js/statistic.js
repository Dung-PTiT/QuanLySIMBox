let startDate = "";
let endDate = "";
let lastRunScriptInfo;

let pieChart1;
let pieChart2;
let multiColumnChart;

$(function () {
    $('.dateInput').datepicker({
        format: 'dd/mm/yyyy',
        todayHighlight: true,
        autoclose: true,
    });


});

$(document).ready(function () {
    setupPieChart1();
    setupPieChart2();
    setupMultiColumnChart();

    loadSummary();

    setDefaultDateInput();
});

function setDefaultDateInput(){
    let date = new Date();
    let day = ("0" + date.getDate()).slice(-2);
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let endDay = date.getFullYear()+"-"+(month)+"-"+(day);
    $('#end_date_input').val(endDay);
    endDate = $('#end_date_input').val();

    date.setDate(date.getDate()-30);
    day = ("0" + date.getDate()).slice(-2);
    month = ("0" + (date.getMonth() + 1)).slice(-2);
    let startDay = date.getFullYear()+"-"+(month)+"-"+(day);
    $('#start_date_input').val(startDay);
    startDate = $('#start_date_input').val();

    loadStatisticByTime();
}

function loadSummary() {
    $.ajax({
        type: "GET",
        url: "/api/get_summary_statistic",
        cache: false,
        crossDomain: true,
        processData: true,
        dataType: "json",
        success: function (data) {
            $('#total_run_times').html(data.totalRunTimes);
            $('#total_fail_run_times').html(data.failRunTimes);
            $('#total_success_run_times').html(data.successRunTimes);
            $('#avg_run_times').html(data.avg);
        }
    });
}

function dateInputChange(type) {
    let start = $('#start_date_input');
    let end = $('#end_date_input');


    if (type === "start") {
        if (start.value != startDate) {
            startDate = start.val();
            loadStatisticByTime();
        }
    } else if (type === "end") {
        if (end.value != endDate) {
            endDate = end.val();
            loadStatisticByTime();
        }
    }
}

function loadStatisticByTime() {
    getKichBanLanChay();
    getLastRunScriptInfo();
    getFailRunScriptTimes();
}

function getKichBanLanChay() {
    if (startDate !== "" && endDate !== "") {
        $.ajax({
            type: "POST",
            url: "/api/get_kichban_lanchay",
            cache: false,
            crossDomain: true,
            processData: true,
            dataType: "json",
            data: {
                "startTime": startDate,
                "endTime": endDate
            },
            success: function (data) {
                if (data.success === true) {
                    showPieChart1(data.data);
                } else {
                    alert(data.error)
                }
            }
        });
    }
}

function getLastRunScriptInfo() {
    if (startDate !== "" && endDate !== "") {
        $.ajax({
            type: "POST",
            url: "/api/get_last_run_script_times_info",
            cache: false,
            crossDomain: true,
            processData: true,
            dataType: "json",
            data: {
                "startTime": startDate,
                "endTime": endDate
            },
            success: function (data) {
                if (data.success === true) {
                    lastRunScriptInfo = data.data;
                    showPieChart2(lastRunScriptInfo);
                    showMultiColumnChart(lastRunScriptInfo);
                } else {
                    alert(data.error)
                }
            }
        });
    }
}

function getFailRunScriptTimes() {
    if (startDate !== "" && endDate !== "") {
        $.ajax({
            type: "POST",
            url: "/api/get_fail_run_script_times_info",
            cache: false,
            crossDomain: true,
            processData: true,
            dataType: "json",
            data: {
                "startTime": startDate,
                "endTime": endDate
            },
            success: function (data) {
                if (data.success === true) {
                    showFailChart(data.data);
                } else {
                    alert(data.error)
                }
            }
        });
    }
}

function showPieChart1(list) {
    let data = [];
    let total = 0;
    for (let i = 0; i < list.length; i++) {
        let tmp = list[i];
        total += tmp.count;
        data.push({
            "country": tmp.scriptName,
            "litres": tmp.count
        })
    }
    $('#total_script_run_in_time').html(total);
    pieChart1.data = data;
}

function showPieChart2(list) {
    let data = [];
    let stopped = 0;
    let fail = 0;
    let complete = 0;

    for (let i = 0; i < list.length; i++) {
        let tmp = list[i];
        switch (tmp.status) {
            case "stopped":
                stopped += 1;
                break;
            case "fail":
                fail += 1;
                break;
            case "complete":
                complete += 1;
                break;
        }
    }
    let total = stopped + fail + complete;
    $('#total_status_in_time').html(total);

    data.push({
        "country": "stopped",
        "litres": stopped
    });
    data.push({
        "country": "fail",
        "litres": fail
    });
    data.push({
        "country": "complete",
        "litres": complete
    });

    pieChart2.data = data;
}

function showMultiColumnChart(list) {
    let map = new Map();
    for (let i = 0; i < list.length; i++) {
        let tmp = list[i];
        if (!map.has(tmp.scriptName)) {
            map.set(tmp.scriptName, {
                "running": 0,
                "stopped": 0,
                "fail": 0,
                "complete": 0
            })
        }
        map.set(tmp.scriptName, updateScriptDetail(map.get(tmp.scriptName), tmp));
    }

    let data = [];
    map.forEach(function (value, key) {
        data.push({
            "category": key,
            "first": value.stopped,
            "second": value.fail,
            "third": value.complete
        })
    });

    multiColumnChart.data = data;
}

function updateScriptDetail(node, data) {
    switch (data.status) {
        case "running":
            node.running += 1;
            break;
        case "stopped":
            node.stopped += 1;
            break;
        case "fail":
            node.fail += 1;
            break;
        case "complete":
            node.complete += 1;
            break;
    }
    return node;
}

function showFailChart(list) {
    let map = new Map();
    let total = list.length;

    for(let i =0; i<list.length; i++) {
        if (!map.has(list[i].info)) {
            map.set(list[i].info, 1);
        } else {
            map.set(list[i].info, map.get(list[i].info) + 1);
        }
    }

    let content = "";
    map.forEach(function (value, key) {
        content = content +
            "<div>\n" +
            "   <div class=\"d-flex justify-content-between\">\n" +
            "       <span>" + key + "</span>\n" +
            "       <span>" + value + "</span>\n" +
            "   </div>\n" +
            "   <div class=\"progress rounded-round\" style=\" height:0.4rem\">\n" +
            "       <div class=\"progress-bar bg-info\" style=\"width: " + (value/total*100) +"%;\">\n" +
            "           <span class=\"text-grey\"></span>\n" +
            "       </div>\n" +
            "   </div>\n" +
            "</div>";
    });
    $('#fail_chart').html(content);
}

function setupMultiColumnChart() {
    // am4core.useTheme(am4themes_myTheme);

    multiColumnChart = am4core.create('column_chart', am4charts.XYChart);
    multiColumnChart.colors.step = 9;

    multiColumnChart.logo.disabled = true;
    multiColumnChart.legend = new am4charts.Legend();
    multiColumnChart.legend.position = 'bottom';
    multiColumnChart.legend.labels.template.maxWidth = 10;

    var xAxis = multiColumnChart.xAxes.push(new am4charts.CategoryAxis());
    xAxis.dataFields.category = 'category';
    xAxis.renderer.cellStartLocation = 0.2;
    xAxis.renderer.cellEndLocation = 0.8;
    xAxis.renderer.grid.template.location = 0;

    var yAxis = multiColumnChart.yAxes.push(new am4charts.ValueAxis());
    yAxis.min = 0;


    function createSeries(value, name) {
        var series = multiColumnChart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = value;
        series.dataFields.categoryX = 'category';
        series.name = name;

        series.events.on("hidden", arrangeColumns);
        series.events.on("shown", arrangeColumns);

        var bullet = series.bullets.push(new am4charts.LabelBullet());
        bullet.interactionsEnabled = false;
        bullet.dy = 30;
        bullet.label.text = '{valueY}';
        bullet.label.fill = am4core.color('#ffffff');

        return series;
    }

    createSeries('first', 'Stopped');
    createSeries('second', 'Fail');
    createSeries('third', 'Complete');

    function arrangeColumns() {

        var series = multiColumnChart.series.getIndex(0);

        var w = 1 - xAxis.renderer.cellStartLocation - (1 - xAxis.renderer.cellEndLocation);
        if (series.dataItems.length > 1) {
            var x0 = xAxis.getX(series.dataItems.getIndex(0), "categoryX");
            var x1 = xAxis.getX(series.dataItems.getIndex(1), "categoryX");
            var delta = ((x1 - x0) / multiColumnChart.series.length) * w;
            if (am4core.isNumber(delta)) {
                var middle = multiColumnChart.series.length / 2;

                var newIndex = 0;
                multiColumnChart.series.each(function (series) {
                    if (!series.isHidden && !series.isHiding) {
                        series.dummyData = newIndex;
                        newIndex++;
                    } else {
                        series.dummyData = multiColumnChart.series.indexOf(series);
                    }
                });
                var visibleCount = newIndex;
                var newMiddle = visibleCount / 2;

                multiColumnChart.series.each(function (series) {
                    var trueIndex = multiColumnChart.series.indexOf(series);
                    var newIndex = series.dummyData;

                    var dx = (newIndex - trueIndex + middle - newMiddle) * delta

                    series.animate({property: "dx", to: dx}, series.interpolationDuration, series.interpolationEasing);
                    series.bulletsContainer.animate({
                        property: "dx",
                        to: dx
                    }, series.interpolationDuration, series.interpolationEasing);
                })
            }
        }
    }
}

function setupPieChart1() {
    pieChart1 = am4core.create("pie_chart_1", am4charts.PieChart);

    pieChart1.logo.disabled = true;
    var pieSeries = pieChart1.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "litres";
    pieSeries.dataFields.category = "country";
    pieSeries.innerRadius = am4core.percent(50);
    pieSeries.ticks.template.disabled = true;
    pieSeries.labels.template.disabled = true;

    pieSeries.slices.template.strokeOpacity = 0.4;
    pieSeries.slices.template.strokeWidth = 0;

    pieChart1.legend = new am4charts.Legend();
    pieChart1.legend.position = "right";
}

function setupPieChart2() {
    pieChart2 = am4core.create("pie_chart_2", am4charts.PieChart);

    pieChart2.logo.disabled = true;
    var pieSeries = pieChart2.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "litres";
    pieSeries.dataFields.category = "country";
    pieSeries.innerRadius = am4core.percent(50);
    pieSeries.ticks.template.disabled = true;
    pieSeries.labels.template.disabled = true;

    pieSeries.slices.template.strokeOpacity = 0.4;
    pieSeries.slices.template.strokeWidth = 0;

    pieChart2.legend = new am4charts.Legend();
    pieChart2.legend.position = "right";

    var colorSet = new am4core.ColorSet();
    colorSet.list = ["#fbc02d", "#ec2169", "#27d257"].map(function (color) {
        return new am4core.color(color);
    });
    pieSeries.colors = colorSet;
}