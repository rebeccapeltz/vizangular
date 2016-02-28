"use strict";

var crossfiltercharts = (function () {
    var barId = "#barchart",
        yearId = "#linechart",
        ringId = "#ringchart",
        listId = ".dc-data-table",
        chartHeight = 250,
        chartWidth = 600,
        jsonData = "../html/data/awards.json",
        composite,
        barChart,
        yearRingChart,
        listChart;

    function createCharts() {
        d3.json(jsonData, function (json) {
            composite = dc.compositeChart("#linechart");
            yearRingChart = dc.pieChart("#ringchart");
            barChart = dc.barChart("#barchart");
            listChart = dc.dataTable(listId);

            // nest will convert array of detail objects to array of objects keyed by country
            /*
            json:
            bronze: 4,country: "Canada",gold: 3,silver: 6,total: 13,year: "1994" -->
            xdata:
            key:"Canada",values:[array of detail from above that has Canada as a country
            */

            //year to date
            var parseDate = d3.time.format("%Y").parse;
            json.forEach(function (d) {
                d.date = parseDate(d.year);
                d.Year = d.date.getFullYear();
            });

            var xdata = d3.nest()
                .key(function (d) {
                    return d.country;
                })
                .sortKeys(d3.ascending)
                .entries(json);

            //ref will create a dictionary of country data for easy reference
            var ref = {};
            xdata.forEach(function (entry) {
                ref[entry.key] = entry.values;
            });

            var ndx = crossfilter();




            //transform the award data before adding to crossfilter
            var xCanada = ref["Canada"].map(function (d) {
                return {
                    dd: d.date,
                    dy: d.Year,
                    country: d.country,
                    total: d.total,
                    year: +d.year,
                    "canada-total": +d.total,
                    "usa-total": 0,
                    "norway-total": 0,
                    "germany-total": 0,
                    "russia-total": 0
                };
            });
            ndx.add(xCanada);

            var xUsa = ref["USA"].map(function (d) {
                return {
                    dd: d.date,
                    dy: d.Year,
                    country: d.country,
                    total: d.total,
                    year: +d.year,
                    "canada-total": 0,
                    "usa-total": +d.total,
                    "norway-total": 0,
                    "germany-total": 0,
                    "russia-total": 0
                };
            });
            ndx.add(xUsa);

            var xGermany = ref["Germany"].map(function (d) {
                return {
                    dd: d.date,
                    dy: d.Year,
                    country: d.country,
                    total: d.total,
                    year: +d.year,
                    "canada-total": 0,
                    "usa-total": 0,
                    "norway-total": 0,
                    "germany-total": +d.total,
                    "russia-total": 0
                };
            });
            ndx.add(xGermany);

            var xRussia = ref["Russia"].map(function (d) {
                return {
                    dd: d.date,
                    dy: d.Year,
                    country: d.country,
                    total: d.total,
                    year: +d.year,
                    "canada-total": 0,
                    "usa-total": 0,
                    "norway-total": 0,
                    "germany-total": 0,
                    "russia-total": +d.total
                };
            });
            ndx.add(xRussia);

            var xNorway = ref["Norway"].map(function (d) {
                return {
                    dd: d.date,
                    dy: d.Year,
                    country: d.country,
                    total: d.total,
                    year: +d.year,
                    "canada-total": 0,
                    "usa-total": 0,
                    "norway-total": +d.total,
                    "germany-total": 0,
                    "russia-total": 0
                };
            });
            ndx.add(xNorway);



            var dim = ndx.dimension(dc.pluck('dd')),
                grp1 = dim.group().reduceSum(dc.pluck('canada-total')),
                grp2 = dim.group().reduceSum(dc.pluck('usa-total')),
                grp3 = dim.group().reduceSum(dc.pluck('norway-total')),
                grp4 = dim.group().reduceSum(dc.pluck('germany-total')),
                grp5 = dim.group().reduceSum(dc.pluck('russia-total')),
                minDate = dim.bottom(1)[0].dd,
                maxDate = dim.top(1)[0].dd;

            composite
                .width(600)
                .height(250)
                .x(d3.time.scale().domain([minDate, maxDate]))
                .y(d3.scale.linear().domain([5, 60]))
                .yAxisLabel("Award total")
                .xAxisLabel("Year")
                .legend(dc.legend().x(80).y(10).itemHeight(10).gap(3))
                .renderHorizontalGridLines(true)
                .title(function (d) {
                    return "year:" + d.key + ", awards: " + d.value;
                })
                .compose([
                dc.lineChart(composite)
                .dimension(dim)
                .colors('red')
                .group(grp1, "Canada")
                .dashStyle([2, 2]),
                dc.lineChart(composite)
                .dimension(dim)
                .colors('green')
                .group(grp3, "Norway")
                .dashStyle([2, 2]),
                dc.lineChart(composite)
                .dimension(dim)
                .colors('orange')
                .group(grp4, "Germany")
                .dashStyle([2, 2]),
                dc.lineChart(composite)
                .dimension(dim)
                .colors('magenta')
                .group(grp5, "Russia")
                .dashStyle([2, 2]),
                dc.lineChart(composite)
                .dimension(dim)
                .colors('blue')
                .group(grp2, "USA")
                .dashStyle([2, 2])
            ])
                .brushOn(false);


            var yearDim = ndx.dimension(dc.pluck('dy'));


            var year_total = yearDim.group().reduceSum(function (d) {
                return 100;
            });

            yearRingChart
                .width(600).height(250)
                .dimension(yearDim)
                .group(year_total)
                .innerRadius(10);


            var countryDim = ndx.dimension(function (d) {
                return d.country;
            });
            var grpCountryTotal = countryDim.group().reduceSum(function (d) {
                return +d.total;
            });



            barChart
                .width(600)
                .height(250)
            //.x(d3.scale.category10()) //??
            .x(d3.scale.ordinal().domain(["USA", "Russia", "Norway", "Germany", "Canada"]))
                .y(d3.scale.linear().domain([0, 150])) //??
            .xUnits(dc.units.ordinal) //using ordinal x axis
            .yAxisLabel("Award total")
                .xAxisLabel("Country")
            //.legend(dc.legend().x(80).y(10).itemHeight(10).gap(3))
            //.renderHorizontalGridLines(true)
            .brushOn(false)
            //.centerBar(true)
            .xAxisPadding(50)
                .title(function (d) {
                    return "country:" + d.key + ", awards: " + d.value;
                })
                .dimension(countryDim)
                .group(grpCountryTotal);

            listChart
              .dimension(dim)
              .size(10)
              .group(function(d) {
                  return d.year;}
              )
              .sortBy(function (d) {
                  return d.year;
              })
                // dynamic columns creation using an array of closures
              .columns([
                 'year',
                'country',
                'total'
              ]) ;


            dc.renderAll();
        });
    }

    function render() {
        createCharts();
    }
    return {
        render: render
    }

}());