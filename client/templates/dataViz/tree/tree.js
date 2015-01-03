// Add hyperlink to nodes :
// http://stackoverflow.com/questions/14951392/add-hyperlink-to-node-text-on-a-collapsible-tree?rq=1
// et http://jsfiddle.net/empie/EX83X/

// tree origin: http://bl.ocks.org/mbostock/4339083

Template.treeTplt.rendered = function () {

    // Extend jQuery click method so that we can call it with jQuery selectors
    // Ref: http://stackoverflow.com/questions/9063383/how-to-invoke-click-event-programmaticaly-in-d3
    jQuery.fn.d3Click = function () {
      this.each(function (i, e) {
        var evt = document.createEvent("MouseEvents");
        evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

        e.dispatchEvent(evt);
      });
    };

    // Tree
    var margin = {top: 20, right: 120, bottom: 20, left: 120},
    totalHeight = 700,
    totalWidth = 600,
    width = totalWidth - margin.right - margin.left,
    height = totalHeight - margin.top - margin.bottom;

    var clickedBuilding_d3ref = null ;

    var i = 0,
        duration = 750,
        root;

    var tree = d3.layout.tree()
        .size([height, width]);

    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; });

    var svg = d3.select("#treePlaceholder").append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Set up an autorun that will be destroyed with the template is destroyed
    this.autorun(function () {
        // but only start it when he Portfolio is defined
        if(Session.get('current_portfolio_doc')) {

        // Create our own JSON-structured file
        var foliom_data = new Object();
        foliom_data = {
            "name": "flare",
             "children": []
        };

        foliom_data.name = Session.get('current_portfolio_doc').name ;

        var tmp_current_portfolio_doc = Portfolios.findOne(Session.get('current_portfolio_doc')._id);

        var building_list = Buildings.find({portfolio_id: tmp_current_portfolio_doc._id },
                            {sort: {name:1}}
                            ).fetch();

        // Method to get all Actions for Each building + build a children list for the Tree
        function getActionsForBuilding(id_param) {
            var action_list = Actions.find({
                                "action_type":"child",
                                "building_id": id_param
                            },
                            {sort: {name:1}}
                            ).fetch();

            var tmp_list = [];

            _.each(action_list, function(item) {
                tmp_list.push(
                        {
                            "name": item.name,
                        }
                    );
            });

            console.log(tmp_list);

            return tmp_list;
        };

        // OLD VERSION: display all Estates > Portfolios > Buildings
        // trick to make sure the Portfolio Collection is reactive
        // var tmp_current_estate_doc = Estates.findOne(Session.get('current_estate_doc')._id);

        // var portfolio_list = Portfolios.find({_id: {$in : tmp_current_estate_doc.portfolio_collection} },
        //                     {sort: {name:1}}
        //                     ).fetch();

        // function getBuildingsForPortfolio(id_param) {
        //     var building_list = Buildings.find({portfolio_id: id_param },
        //                     {sort: {name:1}}
        //                     ).fetch();

        //     var tmp_list = [];

        //     _.each(building_list, function(item) {
        //         tmp_list.push(
        //                 {
        //                     "name": item.building_name,
        //                 }
        //             );
        //     });

            // console.log("tmp_list is:");
            // console.log(tmp_list);

        //     return tmp_list;
        // };

        _.each(building_list, function(item) {
                foliom_data.children.push(
                        {
                            "name": item.building_name,
                            "children": getActionsForBuilding(item._id)
                        }
                    );
            });

          root = foliom_data;
          root.x0 = height / 2;
          root.y0 = 0;

          function collapse(d) {
            if (d.children) {
              d._children = d.children;
              d._children.forEach(collapse);
              d.children = null;
            }
          }

          root.children.forEach(collapse);
          update(root);
        }


        d3.select(self.frameElement).style("height", totalHeight);

        function update(source) {

          // Compute the new tree layout.
          var nodes = tree.nodes(root).reverse(),
              links = tree.links(nodes);

          // Normalize for fixed-depth.
          nodes.forEach(function(d) { d.y = d.depth * 150; });

          // Update the nodes…
          var node = svg.selectAll("g.node")
              .data(nodes, function(d) { return d.id || (d.id = ++i); });

          // Enter any new nodes at the parent's previous position.
          var nodeEnter = node.enter().append("g")
              .attr("class", "node")
              .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
              .on("click", click);

          nodeEnter.append("circle")
              .attr("r", 1e-6)
              .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

          nodeEnter.append("text")
              .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
              .attr("dy", ".35em")
              .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
              .text(function(d) { return d.name; })
              .style("fill-opacity", 1e-6)
              .attr("id", function(d) { return d.name; }); // Add an ID to be able to select

          // Transition nodes to their new position.
          var nodeUpdate = node.transition()
              .duration(duration)
              .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

          nodeUpdate.select("circle")
              .attr("r", 5.5)
              .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

          nodeUpdate.select("text")
              .style("fill-opacity", 1);

          // Transition exiting nodes to the parent's new position.
          var nodeExit = node.exit().transition()
              .duration(duration)
              .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
              .remove();

          nodeExit.select("circle")
              .attr("r", 1e-6);

          nodeExit.select("text")
              .style("fill-opacity", 1e-6);

          // Update the links…
          var link = svg.selectAll("path.link")
              .data(links, function(d) { return d.target.id; });

          // Enter any new links at the parent's previous position.
          link.enter().insert("path", "g")
              .attr("class", "link")
              .attr("d", function(d) {
                var o = {x: source.x0, y: source.y0};
                return diagonal({source: o, target: o});
              });

          // Transition links to their new position.
          link.transition()
              .duration(duration)
              .attr("d", diagonal);

          // Transition exiting nodes to the parent's new position.
          link.exit().transition()
              .duration(duration)
              .attr("d", function(d) {
                var o = {x: source.x, y: source.y};
                return diagonal({source: o, target: o});
              })
              .remove();

          // Stash the old positions for transition.
          nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
          });

          // New: force click on Building after a refresh
          // if(clickedBuilding_d3ref) {
          //   click(clickedBuilding_d3ref);
          //   clickedBuilding_d3ref = null;
          // }

        }

        // Toggle children on click.
        function click(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }

            if (d.depth == 1) { // Depth==1 means it's a building
                console.log("I'm a building!");
                // console.log(d);
                // console.log(d.name);

                // clickedBuilding_d3ref = d; // To be able to keep track of it and expand it
                // delete clickedBuilding_d3ref.parent ;

                var clickedBuilding = Buildings.findOne({
                            portfolio_id: tmp_current_portfolio_doc._id,
                            building_name: d.name
                        });

                // Set building session var
                Session.set('current_building_doc', clickedBuilding);

                // Set checkboxes
                $(".ActionCheckbox").each(function () {
                    // Look in child Actions if we find a match
                    var actionID = $(this).val();
                    actionExists = Actions.findOne({
                                                "action_type":"child",
                                                "building_id": Session.get('current_building_doc')._id,
                                                "action_template_id": actionID
                                                });

                    if(actionExists) {
                        $(this).prop("checked", true);
                    } else {
                        $(this).prop("checked", false);
                    }
                });

            }
            if (d.depth == 2) { // Depth==2 means it's an action
                console.log("I'm an action!");
            }

            update(d);
        }

    }); // END OF AUTORUN



}
