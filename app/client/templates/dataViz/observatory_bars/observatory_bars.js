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
    //   {letter: "C", frequency: .05780},
    //   {letter: "D", frequency: .03780},
    //   {letter: "E", frequency: .01492},
    //   {letter: "F", frequency: .02780},
    //   {letter: "G", frequency: .06780},
    //   {letter: "H", frequency: .06780},
    //   {letter: "I", frequency: .06780},
    //   {letter: "J", frequency: .06780},
    //   {letter: "K", frequency: .06780},
    //   {letter: "L", frequency: .06780},
    //   {letter: "M", frequency: .06780},
    //   {letter: "N", frequency: .06780},
    //   {letter: "O", frequency: .06780},
    //   {letter: "P", frequency: .06780},
    //   {letter: "Q", frequency: .06780},
    //   {letter: "R", frequency: .06780},
    //   {letter: "S", frequency: .06780},
    //   {letter: "T", frequency: .06780},
    //   {letter: "U", frequency: .06780},
    //   {letter: "V", frequency: .06780},
    //   {letter: "W", frequency: .06780},
    // ];
    var data = Buildings.find({},{sort: {name: 1}, fields: {building_name: 1, "building_info.construction_year" : 1} }).fetch().map(function(x){
          return {letter:x.building_name, frequency: x.building_info.construction_year};
        });
    var y_legend = 'construction_year';


    // Get all Portfolios IDs for current Estate
    // var portfolioIDs = Estates.findOne({_id: Session.get('current_estate_doc')._id}).portfolio_collection;

    // var distinctEntriesName = _.uniq(Portfolios.find(
    //     {_id: {$in : portfolioIDs} }, {
    //     sort: {name: 1}, fields: {name: true}
    // }).fetch().map(function(x) {
    //     return x.name;
    // }), true);

    // _.each(portfolioIDs, function(entry, i) {
    //     var count = Buildings.find({portfolio_id: entry }).count();

    //     data.push(
    //         {
    //             "name": distinctEntriesName[i],
    //             "value": count
    //         }
    //     );
    // });



    // x.domain([0, d3.max(data, function(d) { return d.value; })]);

    // chart.attr("height", barHeight * data.length);

    // var bar = chart.selectAll("g")
    //     .data(data)
    //   .enter().append("g")
    //     .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

    // bar.append("rect")
    //     .attr("width", function(d) { return x(d.value); })
    //     .attr("height", barHeight - 1);

    // bar.append("text")
    //     .attr("x", function(d) { return x(d.value) - 8; })
    //     .attr("y", barHeight / 2)
    //     .attr("dy", ".35em")
    //     .text(function(d) {
    //           return d.name + " - " + d.value + " buildings";
    //       });


    // function type(d) {
    //   d.value = +d.value; // coerce to number
    //   return d;
    // }

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


    d3.select("input").on("change", change);

    // var sortTimeout = setTimeout(function() {
    //   d3.select("input").property("checked", true).each(change);
    // }, 2000);

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


