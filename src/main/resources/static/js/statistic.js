$(function () {
    var date_input = $('.dateInput');
    date_input.datepicker({
        format: 'dd/mm/yyyy',
        todayHighlight: true,
        autoclose: true
    });
    showPieChart1();
    showPieChart2();
    showColumnChart();
});

function showPieChart1() {
    var chart = am4core.create("pie_chart_1", am4charts.PieChart);

    chart.logo.disabled = true;

    chart.data = [{
        "country": "Lithuania",
        "litres": 501.9
    }, {
        "country": "Czech Republic",
        "litres": 301.9
    }, {
        "country": "Ireland",
        "litres": 201.1
    }, {
        "country": "Germany",
        "litres": 165.8
    }, {
        "country": "Australia",
        "litres": 139.9
    }, {
        "country": "Austria",
        "litres": 128.3
    }, {
        "country": "UK",
        "litres": 99
    }, {
        "country": "Belgium",
        "litres": 60
    }, {
        "country": "The Netherlands",
        "litres": 50
    }];

    var pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "litres";
    pieSeries.dataFields.category = "country";
    pieSeries.innerRadius = am4core.percent(50);
    pieSeries.ticks.template.disabled = true;
    pieSeries.labels.template.disabled = true;

    pieSeries.slices.template.strokeOpacity = 0.4;
    pieSeries.slices.template.strokeWidth = 0;

    chart.legend = new am4charts.Legend();
    chart.legend.position = "right";
}

function showPieChart2() {
    var chart = am4core.create("pie_chart_2", am4charts.PieChart);

    chart.logo.disabled = true;

    chart.data = [{
        "country": "Lithuania",
        "litres": 501.9
    }, {
        "country": "Czech Republic",
        "litres": 301.9
    }, {
        "country": "Ireland",
        "litres": 201.1
    }, {
        "country": "Germany",
        "litres": 165.8
    }, {
        "country": "Australia",
        "litres": 139.9
    }, {
        "country": "Austria",
        "litres": 128.3
    }, {
        "country": "UK",
        "litres": 99
    }, {
        "country": "Belgium",
        "litres": 60
    }, {
        "country": "The Netherlands",
        "litres": 50
    }];

    var pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "litres";
    pieSeries.dataFields.category = "country";
    pieSeries.innerRadius = am4core.percent(50);
    pieSeries.ticks.template.disabled = true;
    pieSeries.labels.template.disabled = true;

    pieSeries.slices.template.strokeOpacity = 0.4;
    pieSeries.slices.template.strokeWidth = 0;

    chart.legend = new am4charts.Legend();
    chart.legend.position = "right";
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