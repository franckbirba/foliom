/*
- Simple Bar chart with axis: http://bl.ocks.org/mbostock/3885304
- Sortable Bar chart: http://bl.ocks.org/mbostock/3885705
- Using d3-tip to add tooltips to a d3 bar chart: http://bl.ocks.org/Caged/6476579
-
*/



Template.barchart.rendered = function () {
    var width = 420,
    barHeight = 40;

    var x = d3.scale.linear()
        .range([0, width]);

    var chart = d3.select(".chart")
        .attr("width", width);

    var countByPortfolio = {};



    // var myField = "_id" ;
    // var distinctEntries = _.uniq(Portfolios.find({}, {
    //     sort: {myField: 1}, fields: {myField: true}
    // }).fetch().map(function(x) {
    //     return x.myField;
    // }), true);

    var data = [
      // {name: "Locke",    value:  4},
    ];

    // var distinctEntriesId = _.uniq(Portfolios.find({}, {
    //     sort: {_id: 1}, fields: {_id: true}
    // }).fetch().map(function(x) {
    //     return x._id;
    // }), true);

    // Get all Portfolios IDs for current Estate
    var portfolioIDs = Estates.findOne({_id: Session.get('current_estate_doc')._id}).portfolio_collection;

    var distinctEntriesName = _.uniq(Portfolios.find(
        {_id: {$in : portfolioIDs} }, {
        sort: {name: 1}, fields: {name: true}
    }).fetch().map(function(x) {
        return x.name;
    }), true);

    // console.log("portfolioIDs: ");
    // console.log(portfolioIDs);

    _.each(portfolioIDs, function(entry, i) {
        var count = Buildings.find({portfolio_id: entry }).count();

        data.push(
            {
                "name": distinctEntriesName[i],
                "value": count
            }
        );
    });

    // console.log(data);

    // Buildings.find(query).forEach(function(building) {
    //     // if ( building.address.gps_lat !== undefined ) {
    //     // }

    //     countByPortfolio.portfolio_id = building.portfolio_id
    // )};



    // d3.tsv("data.tsv", type, function(error, data) {
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
          .attr("x", function(d) { return x(d.value) - 8; })
          .attr("y", barHeight / 2)
          .attr("dy", ".35em")
          .text(function(d) {
                return d.name + " - " + d.value + " buildings";
            });
    // });

    function type(d) {
      d.value = +d.value; // coerce to number
      return d;
    }

};


