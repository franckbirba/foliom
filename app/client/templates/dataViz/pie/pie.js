/*
    Legend
    - http://stackoverflow.com/questions/20675617/how-to-add-legend-to-a-pie-chart-using-d3js-and-how-to-centralise-the-pie-chart
    - http://bl.ocks.org/ZJONSSON/3918369

*/

Template.pie.rendered = function () {
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

            console.log("curr_item is:");
            console.log(curr_item);

            txt_domain = curr_item.text_domain ;
            data = curr_item.data ;

            // console.log("txt_domain is:" + txt_domain);
            // console.log("data is:" + data);



            // Original text domain: ["Lorem ipsum", "dolor sit", "amet", "consectetur", "adipisicing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt"]

            color = d3.scale.ordinal()
                .domain(txt_domain)
                .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

            console.log("after color");
            // function randomData (){
            //     var labels = color.domain();
            //     return labels.map(function(label){
            //         return { label: label, value: Math.random() }
            //     });
            // }

            // change(randomData());
            change(data);

            function change(data) {

                /* ------- PIE SLICES -------*/
                var slice = svg.select(".slices").selectAll("path.slice")
                    .data(pie(data), key);

                slice.enter()
                    .insert("path")
                    .style("fill", function(d) { return color(d.data.label); })
                    .attr("class", "slice")
                    .attr("data-legend",function(d) { return transr(d.data.label)() });

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

    d3.select(".randomize")
        .on("click", function(){
            change(randomData());
        });


    function change(data) {

        /* ------- PIE SLICES -------*/
        var slice = svg.select(".slices").selectAll("path.slice")
            .data(pie(data), key);

        slice.enter()
            .insert("path")
            .style("fill", function(d) { return color(d.data.label); })
            .attr("class", "slice")
            .attr("data-legend",function(d) { return transr(d.data.label)() });

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

        /* ------- TEXT LABELS -------*/

        // var text = svg.select(".labels").selectAll("text")
        //     .data(pie(data), key);

        // text.enter()
        //     .append("text")
        //     .attr("dy", ".35em")
        //     .text(function(d) {
        //         var legend = transr(d.data.label);
        //         return legend();
        //     });

        // function midAngle(d){
        //     return d.startAngle + (d.endAngle - d.startAngle)/2;
        // }

        // text.transition().duration(1000)
        //     .attrTween("transform", function(d) {
        //         this._current = this._current || d;
        //         var interpolate = d3.interpolate(this._current, d);
        //         this._current = interpolate(0);
        //         return function(t) {
        //             var d2 = interpolate(t);
        //             var pos = outerArc.centroid(d2);
        //             pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
        //             return "translate("+ pos +")";
        //         };
        //     })
        //     .styleTween("text-anchor", function(d){
        //         this._current = this._current || d;
        //         var interpolate = d3.interpolate(this._current, d);
        //         this._current = interpolate(0);
        //         return function(t) {
        //             var d2 = interpolate(t);
        //             return midAngle(d2) < Math.PI ? "start":"end";
        //         };
        //     });

        // text.exit()
        //     .remove();

        // /* ------- SLICE TO TEXT POLYLINES -------*/

        // var polyline = svg.select(".lines").selectAll("polyline")
        //     .data(pie(data), key);

        // polyline.enter()
        //     .append("polyline");

        // polyline.transition().duration(1000)
        //     .attrTween("points", function(d){
        //         this._current = this._current || d;
        //         var interpolate = d3.interpolate(this._current, d);
        //         this._current = interpolate(0);
        //         return function(t) {
        //             var d2 = interpolate(t);
        //             var pos = outerArc.centroid(d2);
        //             pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
        //             return [arc.centroid(d2), outerArc.centroid(d2), pos];
        //         };
        //     });

        // polyline.exit()
        //     .remove();

        legend = svg.append("g")
            .attr("class","legend")
            .attr("transform","translate(120,0)")
            .style("font-size","12px")
            .call(d3.legend);

          // setTimeout(function() {
          //   legend
          //     .style("font-size","20px")
          //     .attr("data-style-padding",10)
          //     .call(d3.legend)
          // },1000)


      //   /* --- LEGEND --- */
      //   var legend = svg.selectAll(".legend")
      //     .data(txt_domain)
      //   .enter().append("g")
      //     .attr("class", "legend")
      //     .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      // legend.append("rect")
      //     .attr("x", width - 18)
      //     .attr("width", 18)
      //     .attr("height", 18)
      //     .style("fill", color);

      // legend.append("text")
      //     .attr("x", width - 24)
      //     .attr("y", 9)
      //     .attr("dy", ".35em")
      //     .style("text-anchor", "end")
      //     .text(function(d) { return d; });
    };

};
