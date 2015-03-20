/*
- Simple Bar chart with axis: http://bl.ocks.org/mbostock/3885304
- Sortable Bar chart: http://bl.ocks.org/mbostock/3885705
- Using d3-tip to add tooltips to a d3 bar chart: http://bl.ocks.org/Caged/6476579
-
*/

Template.observatory_barchart.rendered = function () {

  this.autorun(function () {
    var margin = {top: 20, right: 20, bottom: 70, left: 40},

    width = $("#observatory_barchart_placeholder").width() - margin.left - margin.right,
    height = 280 - margin.top - margin.bottom;

    console.log("PL", $("#observatory_barchart_placeholder").width(), "width", width);

    // var formatPercent = d3.format(".0%");
    var format4digits = d3.format("04d");
    var format = format4digits;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1, 1);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(format);

    var svg = d3.select("#observatory_barchart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // var data = [
    //   {letter: "A", frequency: .08167},
    //   {letter: "B", frequency: .04780},
    // ];
    var data = Buildings.find({},{sort: {name: 1}, fields: {building_name: 1, "building_info.construction_year" : 1} }).fetch().map(function(x){
          return {letter:x.building_name, frequency: x.building_info.construction_year};
        });
    var y_legend = 'construction_year';



    data.forEach(function(d) {
      d.frequency = +d.frequency;
    });

    x.domain(data.map(function(d) { return d.letter; }));
    y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
        .selectAll("text")
          .style("text-anchor", "end")
          // .attr("dx", "-.8em")
          // .attr("dy", ".15em")
          .attr("transform", "rotate(-45)");
          // http://bl.ocks.org/d3noob/ccdcb7673cdb3a796e13


    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text( transr(y_legend)() );


    svg.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.letter); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.frequency); })
        .attr("height", function(d) { return height - y(d.frequency); });


    d3.select("#sortBarchartValues").on("change", change);

    var sortTimeout = setTimeout(function() {
      d3.select("#sortBarchartValues").property("checked", true).each(change);
    }, 2000);

    function change() {
      clearTimeout(sortTimeout);

      // Copy-on-write since tweens are evaluated after a delay.
      var x0 = x.domain(data.sort(this.checked
          ? function(a, b) { return b.frequency - a.frequency; }
          : function(a, b) { return d3.ascending(a.letter, b.letter); })
          .map(function(d) { return d.letter; }))
          .copy();

      svg.selectAll(".bar")
          .sort(function(a, b) { return x0(a.letter) - x0(b.letter); });

      var transition = svg.transition().duration(750),
          delay = function(d, i) { return i * 50; };

      transition.selectAll(".bar")
          .delay(delay)
          .attr("x", function(d) { return x0(d.letter); });

      transition.select(".x.axis")
          .call(xAxis)
            .selectAll("text")
              .style("text-anchor", "end")
              // .attr("dx", "-.8em")
              // .attr("dy", ".15em")
              .attr("transform", "rotate(-45)")
        .selectAll("g")
          .delay(delay);
    }

  });
};


