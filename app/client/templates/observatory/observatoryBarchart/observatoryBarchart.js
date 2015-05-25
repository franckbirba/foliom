/*
- Simple Bar chart with axis: http://bl.ocks.org/mbostock/3885304
- Sortable Bar chart: http://bl.ocks.org/mbostock/3885705
- Using d3-tip to add tooltips to a d3 bar chart: http://bl.ocks.org/Caged/6476579
-
*/

Template.observatoryBarchart.events({
  'change #barchartDisplaySelector': function(e, tplt){
    Session.set("observatoryBarchartDisplaySelector", $(e.currentTarget).val() );
    // Reinit the map
    Session.set('obs_barchart_buildings', undefined);
    // console.log(tplt.this);
  },
});

Template.observatoryBarchart.created = function () {
  Session.set("observatoryBarchartDisplaySelector", "dpe_co2_emission" );
  var instance = this ;
  instance.barchartData = new ReactiveVar({});
  buildings = Template.currentData().buildings;

  // Call the method to calc the Data for the Barchart, in an Autorun
  this.autorun(function () {
    data = calc_observatoryBarchart_data(buildings);
    instance.barchartData.set(data);
  });

};

Template.observatoryBarchart.rendered = function () {
  // var container_width = setTimeout(function() { $("#observatory_barchart_placeholder").width() }, 2000);
  var container_width = $("#observatory_barchart_placeholder").width();
  var data, display, y_legend, y_domain_start, x_legend_rotation;

  this.autorun(function () {
    var margin = {top: 20, right: 20, bottom: 70, left: 40},
    width = container_width - margin.left - margin.right + 150, // ToDo: FIND A WAY TO CORRECT THIS UGLY +150
    height = 280 - margin.top - margin.bottom ;

    // console.log("PL", container_width, "width", width);

    // var formatPercent = d3.format(".0%");
    // var format4digits = d3.format("04d"); // the 0 is used for "0-padding on the left"
    var format4digits = d3.format("4d");
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

    // remove previous barchart
    d3.select("#observatory_barchart_placeholder").select("svg").remove();

    var svg = d3.select("#observatory_barchart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



    // Rules to display the correct data with the correct parameters
    display = Session.get("observatoryBarchartDisplaySelector");

    var barchartData = Template.instance().barchartData.get() ;

    switch(display) {
      case "construction_year":
        data = barchartData.construction_year_data;
        y_legend = 'construction_year';
        y_domain_start = 1700;
        x_legend_rotation = "rotate(-45)";
        break;
      case "dpe_co2_emission":
        data = barchartData.dpe_co2_emission_data;
        y_legend = 'nb_buildings';
        y_domain_start = 0;
        x_legend_rotation = "rotate(0)";
        break;
      case "dpe_energy_consuption":
        data = barchartData.dpe_energy_consuption_data;
        y_legend = 'nb_buildings';
        y_domain_start = 0;
        x_legend_rotation = "rotate(0)";
        break;
      case "global_comfort_index":
        data = barchartData.global_comfort_index_data;
        y_legend = 'nb_buildings';
        y_domain_start = 0;
        x_legend_rotation = "rotate(0)";
        break;
      case "tc_lifetime":
        data = barchartData.global_tc_lifetime_data;
        y_legend = 'nb_buildings';
        y_domain_start = 0;
        x_legend_rotation = "rotate(0)";
        break;
      case "tc_conformity":
        data = barchartData.global_tc_conformity_data;
        y_legend = 'nb_buildings';
        y_domain_start = 0;
        x_legend_rotation = "rotate(0)";
        break;
      // default:
      //   default code block
    }

    console.log("data is: ", data);


    data.forEach(function(d) {
      d.frequency = +d.frequency;
    });

    x.domain(data.map(function(d) { return d.letter; }));
    y.domain([y_domain_start, d3.max(data, function(d) { return d.frequency; })]); //Domain goes from y_domain_start to max frequency

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
        .selectAll("text")
          .style("text-anchor", "end")
          // .attr("dx", "-.8em")
          // .attr("dy", ".15em")
          .attr("transform", x_legend_rotation);
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


    function showHideTip(item) {
      item.toggleClass('show');
    };
    function showTip(item) {
      Meteor.setTimeout(function(){
        item.addClass('show')}, 300
    )};
    var lazyShowHideTip = _.debounce(showHideTip, 300);

    svg.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.letter); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.frequency); })
        .attr("height", function(d) { return height - y(d.frequency); })
        .on("click", barClick)
        .on('mouseover', function(d, i){
          // parent = this.parentElement;
          parent_container = $(this).parents('#observatory_barchart_container');
          tooltip = parent_container.find('.tooltip');
          content = tooltip.find('span');
          rect = d3.select(this).node().getBoundingClientRect();

          content.html("<strong>"+d.tooltip.join("<br>")+"</strong>");
          tooltip.css('transform', "translate3d(" + (rect.left + .5 * (rect.width - self.tooltip.width())) + "px," + (rect.top - self.tooltip.height() - 5) + "px, 0)");
          showTip(tooltip);
        })
        .on('mouseleave', function(d, i){
          parent_container = $(this).parents('#observatory_barchart_container');
          tooltip = parent_container.find('.tooltip');
          lazyShowHideTip(tooltip);
        });

    d3.select("#sortBarchartValues").on("change", change);

    var sortTimeout = setTimeout(function() {
      d3.select("#sortBarchartValues").property("checked", true).each(change);
    }, 2000);

    function barClick(d) {
      Session.set('obs_barchart_buildings', d.building_IDs);
    };

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
              .attr("transform", x_legend_rotation)
        .selectAll("g")
          .delay(delay);
    }

  });
};


