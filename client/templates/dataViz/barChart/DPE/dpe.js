// http://www.d3noob.org/2013/07/arranging-more-than-one-d3js-graph-on.html
// http://stackoverflow.com/questions/22060481/how-do-i-create-this-shape-in-svg

Template.DPEchart.rendered = function () {
    var width = 170,
    barHeight = 25;

    var data = [
      {name: "A",    value:  10},
      {name: "B",    value:  17},
      {name: "C",    value:  24},
      {name: "D",    value:  31},
      {name: "E",    value:  38},
      {name: "F",    value:  45},
      {name: "G",    value:  52},
    ];

    var chart = d3.select("#DPEchart1")
        .attr("width", width);

    var x = d3.scale.linear()
        .range([0, width]);


      x.domain([0, d3.max(data, function(d) { return d.value; })]);

      chart.attr("height", barHeight * data.length);

      var bar = chart.selectAll("g")
          .data(data)
        .enter().append("g")
          .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

      bar.append("rect")
          .attr("width", function(d) { return x(d.value); })
          .attr("height", barHeight - 1);

      bar.append("text")
          .attr("x", 15)
          .attr("y", barHeight / 2)
          .attr("dy", ".35em")
          .text(function(d) {
                return d.name;
            });



    // SECOND GRAPH

    var chart2 = d3.select("#DPEchart2")
        .attr("width", width);

    var x2 = d3.scale.linear()
        .range([0, width]);


      x2.domain([0, d3.max(data, function(d) { return d.value; })]);

      chart2.attr("height", barHeight * data.length);

      var bar2 = chart2.selectAll("g")
          .data(data)
        .enter().append("g")
          .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

      bar2.append("rect")
          .attr("width", function(d) { return x(d.value); })
          .attr("height", barHeight - 1);

      bar2.append("text")
          .attr("x", 15)
          .attr("y", barHeight / 2)
          .attr("dy", ".35em")
          .text(function(d) {
                return d.name;
            });


    function type(d) {
      d.value = +d.value; // coerce to number
      return d;
    }

};


