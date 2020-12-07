var startDate = "";
var endDate = "";
var pieChart1;

$(function () {
    $('.dateInput').datepicker({
        format: 'dd/mm/yyyy',
        todayHighlight: true,
        autoclose: true,
    });
    setupPieChart1();
    setupPieChart2();
    showColumnChart();
});

$(document).ready(function () {
    loadSummary();
});

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

function dateInputChange(type, event) {
    if (type === "start") {
        if (event.value != startDate) {
            startDate = event.value;
            getKichBanLanChay();
            getLastRunScriptInfo();
        }
    } else if (type === "end") {
        if (event.value != endDate) {
            endDate = event.value;
            getKichBanLanChay();
            getLastRunScriptInfo();
        }
    }
}


function getRunScriptInfo() {
    if (startDate !== "" && endDate !== "") {
        $.ajax({
            type: "POST",
            url: "/api/get_run_script_times_info",
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
                    showPieChart2(data.data);
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
    let running = 0;
    let stopped = 0;
    let fail = 0;
    let complete = 0;

    for (let i = 0; i < list.length; i++) {
        let tmp = list[i];
        switch (tmp.status) {
            case "running":
                running += 1;
                break;
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
    let total = running + stopped + fail + complete;
    $('#total_status_in_time').html(total);

    data.push({
        "country": "running",
        "litres": running
    });
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

function showColumnChart() {
    am4core.useTheme(am4themes_animated);

    var chart = am4core.create('column_chart', am4charts.XYChart);
    chart.colors.step = 9;

    chart.logo.disabled = true;
    chart.legend = new am4charts.Legend();
    chart.legend.position = 'bottom';
    chart.legend.labels.template.maxWidth = 10;

    var xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    xAxis.dataFields.category = 'category';
    xAxis.renderer.cellStartLocation = 0.2;
    xAxis.renderer.cellEndLocation = 0.8;
    xAxis.renderer.grid.template.location = 0;

    var yAxis = chart.yAxes.push(new am4charts.ValueAxis());
    yAxis.min = 0;

    function createSeries(value, name) {
        var series = chart.series.push(new am4charts.ColumnSeries());
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

    chart.data = [
        {
            category: '2020',
            first: 40,
            second: 55,
            third: 60,
            four: 30
        },
        {
            category: '2021',
            first: 30,
            second: 78,
            third: 69,
            four: 60
        },
        {
            category: '2022',
            first: 27,
            second: 40,
            third: 45,
            four: 70
        },
        {
            category: '2023',
            first: 50,
            second: 33,
            third: 22,
            four: 50
        }
    ];

    createSeries('first', 'Toal');
    createSeries('second', 'To do');
    createSeries('third', 'Completed');
    createSeries('four', 'Overdue');

    function arrangeColumns() {

        var series = chart.series.getIndex(0);

        var w = 1 - xAxis.renderer.cellStartLocation - (1 - xAxis.renderer.cellEndLocation);
        if (series.dataItems.length > 1) {
            var x0 = xAxis.getX(series.dataItems.getIndex(0), "categoryX");
            var x1 = xAxis.getX(series.dataItems.getIndex(1), "categoryX");
            var delta = ((x1 - x0) / chart.series.length) * w;
            if (am4core.isNumber(delta)) {
                var middle = chart.series.length / 2;

                var newIndex = 0;
                chart.series.each(function (series) {
                    if (!series.isHidden && !series.isHiding) {
                        series.dummyData = newIndex;
                        newIndex++;
                    } else {
                        series.dummyData = chart.series.indexOf(series);
                    }
                });
                var visibleCount = newIndex;
                var newMiddle = visibleCount / 2;

                chart.series.each(function (series) {
                    var trueIndex = chart.series.indexOf(series);
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
}