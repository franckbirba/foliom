/*
    Legend
    - http://stackoverflow.com/questions/20675617/how-to-add-legend-to-a-pie-chart-using-d3js-and-how-to-centralise-the-pie-chart
    - http://bl.ocks.org/ZJONSSON/3918369

*/

Template.buildingDetail_pie.rendered = function () {
    var svg = d3.select(".piechart")
        .append("g")

    svg.append("g")
        .attr("class", "slices");
    svg.append("g")
        .attr("class", "labels");
    svg.append("g")
        .attr("class", "lines");

    var width = 230,
        height = 230,
        radius = Math.min(width, height) / 2;

    var legend = null;
    var lease = null ;
    var color = null ;

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) {
            return d.value;
        });

    // var arc = d3.svg.arc()
    //     .outerRadius(radius - 10)
    //     .innerRadius(0);

    var arc = d3.svg.arc()
        .outerRadius(radius * 0.8)
        .innerRadius(radius * 0.4);

    var outerArc = d3.svg.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var key = function(d){ return d.data.label; };


    Tracker.autorun(function () {

        var txt_domain = ["Lorem ipsum", "dolor sit", "amet", "consectetur", "adipisicing", "elit", "sed"];

        pieData = Session.get('pieData');
        averagedPieData = Session.get('averagedPieData');

        if (pieData && averagedPieData) { // make sure the data was generated before creating the pieChart

            if (Session.get("current_lease_id")) {
                curr_item = _.where(pieData, { _id: Session.get("current_lease_id") } )[0];
            } else {
                curr_item = averagedPieData;
            }

            // console.log("curr_item is:");
            // console.log(curr_item);

            txt_domain = curr_item.text_domain ;
            data = curr_item.data ;

            // console.log("txt_domain is:" + txt_domain);
            // console.log("data is:" + data);

            color = d3.scale.ordinal()
                .domain(txt_domain)
                .range(["#A9C700", "#4D4D4D", "#808080", "#CCCCCC", "#333", "#666", "#999"]);


            // change(randomData());
            change(data);

            function showHideTip(item) {
              item.toggleClass('show');
            };
            function showTip(item) {
              Meteor.setTimeout(function(){
                item.addClass('show')}, 300
            )};
            var lazyShowHideTip = _.debounce(showHideTip, 300);

            // we hide tooltip on the "slice" class, to prevent it from disappearing when the user changes slices
            svg.select(".slices").on('mouseleave', function(d, i){
                      parent_container = $(this).parents('#buildingDetail_pie_tplt');
                      tooltip = parent_container.find('.tooltip');
                      lazyShowHideTip(tooltip);
                    });

            function change(data) {

                /* ------- PIE SLICES -------*/
                var slice = svg.select(".slices").selectAll("path.slice")
                    .data(pie(data), key);

                slice.enter()
                    .insert("path")
                    .style("fill", function(d) { return color(d.data.label); })
                    .attr("class", "slice")
                    .attr("data-legend",function(d) {
                        // return transr(d.data.label)();
                        return d.data.label;
                    })
                    .on('mouseover', function(d, i){
                      // parent = this.parentElement;
                      parent_container = $(this).parents('#buildingDetail_pie_tplt');
                      tooltip = parent_container.find('.tooltip');
                      content = tooltip.find('span');
                      rect = d3.select(this).node().getBoundingClientRect();

                      content.html("<strong>"+d.data.value+" "+TAPi18n.__("u_kwhEF")+"</strong>");
                      tooltip.css('transform', "translate3d(" + (rect.left + .5 * (rect.width - self.tooltip.width())) + "px," + (rect.top - self.tooltip.height() - 5) + "px, 0)");
                      showTip(tooltip);
                    });

                slice
                    .transition().duration(1000)
                    .attrTween("d", function(d) {
                        this._current = this._current || d;
                        var interpolate = d3.interpolate(this._current, d);
                        this._current = interpolate(0);
                        return function(t) {
                            return arc(interpolate(t));
                        };
                    })

                slice.exit()
                    .remove();

                if(legend){
                    svg.selectAll(".legend").remove();
                }

                legend = svg.append("g")
                    .attr("class","legend")
                    .attr("transform","translate(120,0)")
                    .style("font-size","12px")
                    .call(d3.legend);
            };
        }
    });

    // d3.select(".randomize")
    //     .on("click", function(){
    //         change(randomData());
    //     });


};
