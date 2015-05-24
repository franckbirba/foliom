/*
- Simple Bar chart with axis: http://bl.ocks.org/mbostock/3885304
- Sortable Bar chart: http://bl.ocks.org/mbostock/3885705
- Using d3-tip to add tooltips to a d3 bar chart: http://bl.ocks.org/Caged/6476579
-
*/

Template.observatoryBarchart.events({
  'change #barchartDisplaySelector': function(e, tplt){
    Session.set("observatoryBarchartDisplaySelector", $(e.currentTarget).val() );
    // console.log(tplt.this);
  },
});

Template.observatoryBarchart.created = function () {
  Session.set("observatoryBarchartDisplaySelector", "dpe_co2_emission" );
  var instance = this ;
  instance.barchartData = new ReactiveVar({})
  buildings = Template.currentData().buildings

  // To be displayed in the barchart, the Data has to be structured as follows:
  // var data = [
  //   {letter: "A", frequency: .08167},
  //   {letter: "B", frequency: .04780},
  // ];
  // We will add a third param (building_IDs): an array to store the corresponding building IDs, so that when the User clicks on a bar, we know the corresponding buildings


  // SPECIAL CASE FOR BUILDINGS BEING CREATED:
  // As they don't have Leases yet, we exclude buildings who don't have the 'properties' field
  buildings = _.chain(buildings)
                    .map( function(building) {
                      if(building.hasOwnProperty('properties')){
                        return building;
                      } else {return false;}
                    })
                    .compact()
                    .value()

  // construction_year_data
  instance.barchartData.construction_year_data = buildings.map(function(x){
        return {letter:x.building_name, frequency: x.building_info.construction_year};
      });


  // ges Data
  var dpe_co2_emission_data = buildings.map(function(x){
        return {
          letter:x.properties.leases_averages.merged_dpe_ges_data.dpe_co2_emission.grade,
          frequency:x.building_name,
          id: x._id
        };
      });
  console.log("dpe_co2_emission_data:", dpe_co2_emission_data);

  dpe_co2_emission_data = _.groupBy(dpe_co2_emission_data, 'letter');
  dpe_co2_emission_data = _.map(dpe_co2_emission_data,function(value, key){
    return {
      letter:transr(key)(),
      frequency: value.length,
      building_IDs: _.pluck(value, 'id')
      };
  });
  console.log("dpe_co2_emission_data:", dpe_co2_emission_data);
  instance.barchartData.dpe_co2_emission_data = dpe_co2_emission_data;


  // dpe_co2_emission_data = _.countBy(dpe_co2_emission_data, 'letter');
  // dpe_co2_emission_data = _.map(dpe_co2_emission_data,function(value, key){
  //   return {letter:transr(key)(), frequency: value};
  //   });
  // instance.barchartData.dpe_co2_emission_data = dpe_co2_emission_data;

  // dpe_energy_consuption Data
  var dpe_energy_consuption_data = buildings.map(function(x){
        return {letter:x.properties.leases_averages.merged_dpe_ges_data.dpe_energy_consuption.grade, frequency:x.building_name };
      });
  dpe_energy_consuption_data = _.countBy(dpe_energy_consuption_data, 'letter');
  dpe_energy_consuption_data = _.map(dpe_energy_consuption_data,function(value, key){
    return {letter:transr(key)(), frequency: value};
    });
  instance.barchartData.dpe_energy_consuption_data = dpe_energy_consuption_data;

  // global_comfort_index Data
  var global_comfort_index_data = buildings.map(function(x){
        return {
          letter: (x.properties.leases_averages.global_comfort_index).toFixed(1)*1,
          frequency:x.building_name
        };
      });
  global_comfort_index_data = _.countBy(global_comfort_index_data, 'letter');
  global_comfort_index_data = _.map(global_comfort_index_data,function(value, key){
    return {letter:transr(key)(), frequency: value};
    });
  instance.barchartData.global_comfort_index_data = global_comfort_index_data;

  // technical_compliance global_lifetime and global_conformity
  var global_tc_lifetime_data = buildings.map(function(x){
        return {
          letter: (x.properties.leases_averages.technical_compliance.global_lifetime).toFixed(1)*1,
          frequency:x.building_name
        };
      });
  global_tc_lifetime_data = _.countBy(global_tc_lifetime_data, 'letter');
  global_tc_lifetime_data = _.map(global_tc_lifetime_data,function(value, key){
    return {letter:transr(key)(), frequency: value};
    });
  instance.barchartData.global_tc_lifetime_data = global_tc_lifetime_data;

  var global_tc_conformity_data = buildings.map(function(x){
        return {
          letter: (x.properties.leases_averages.technical_compliance.global_conformity).toFixed(1)*1,
          frequency:x.building_name
        };
      });
  global_tc_conformity_data = _.countBy(global_tc_conformity_data, 'letter');
  global_tc_conformity_data = _.map(global_tc_conformity_data,function(value, key){
    return {letter:transr(key)(), frequency: value};
    });
  instance.barchartData.global_tc_conformity_data = global_tc_conformity_data;


  // console.log("instance.barchartData");
  // console.log(instance.barchartData);
  // Save the object in the reactive var
  instance.barchartData.set(instance.barchartData)


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


    svg.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.letter); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.frequency); })
        .attr("height", function(d) { return height - y(d.frequency); })
        .on("click", barClick);


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


