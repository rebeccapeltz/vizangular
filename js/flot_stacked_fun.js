/* $(".stackControls button").click(function (e) {
            e.preventDefault();
            stack = $(this).text() == "With stacking" ? true : null;
            plotWithOptions();
        });

        $(".graphControls button").click(function (e) {
            e.preventDefault();
            bars = $(this).text().indexOf("Bars") != -1;
            lines = $(this).text().indexOf("Lines") != -1;
            steps = $(this).text().indexOf("steps") != -1;
            plotWithOptions();
        });

    }*/

"use strict";

var flotStackedChart = (function () {


    function createCharts() {
        jQuery.getJSON("data/awards.json", function (json) {
            var i = 0,
                country = ["USA", "Canada", "Germany", "Russia", "Norway"],
                bronze = [],
                silver = [],
                gold = [],
                bronzeData = {
                    label: "bronze",
                    data: bronze
                },
                goldData = {
                    label: "gold",
                    data: gold
                },
                silverData = {
                    label: "silver",
                    data: silver
                },
                plotData = [goldData, silverData, bronzeData],
                tickdata = [],

                d1 = [],
                d2 = [],
                d3 = [],
                stack = 0,
                bars = true,
                lines = false,
                steps = false;
            //init award arrays
            country.forEach(function (d, i) {
                bronze.push([i + 1, 0]);
                silver.push([i + 1, 0]);
                gold.push([i + 1, 0]);
                tickdata.push([i + 1, d]);
            });

            for (i = 0; i < json.length; i++) {
                var row = json[i];
                var countryIndex = country.indexOf(row.country);
                bronze[countryIndex][1] += row.bronze;
                silver[countryIndex][1] += row.silver;
                gold[countryIndex][1] += row.gold;

            }


            jQuery.plot("#flot-chart", plotData, {
                //jQuery.plot("#flot-chart", [d1, d2, d3], {
                series: {
                    stack: stack,
                    lines: {
                        show: lines,
                        fill: true,
                        steps: steps
                    },

                    bars: {
                        show: bars,
                        align: "center",
                        barWidth: 0.6
                    }
                },
                xaxis: {
                    ticks: tickdata
                }
            });
        });
    }

    function render() {
        createCharts();
    }
    return {
        render: render
    };

}());