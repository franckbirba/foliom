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
    var i, margin, totalHeight, totalWidth, width, height, tree, diagonal, svg;
    var i = 0,
        duration = 750,
        root;

    // First autorun that set the tree SVG, and will be re-run if the Portfolio doc changes >> means that we have to redraw the tree
    this.autorun(function () {
        // but only start it when he Portfolio is defined
        if(Session.get('current_portfolio_doc')) {

          //Set totalHeight dynamically
          var building_nb = Buildings.find({portfolio_id: Session.get('current_portfolio_doc')._id }).fetch().length;
          totalHeight = 35*building_nb + 100;
          // console.log(totalHeight);

          margin = {top: 20, right: 120, bottom: 20, left: 120};
          // totalHeight = 1800,
          // totalWidth = 600;
          totalWidth = $("#treePlaceholder").width() - 10; // Set width dynamically to occupy almost all width
          width = totalWidth - margin.right - margin.left;
          height = totalHeight - margin.top - margin.bottom;



          clickedBuilding_d3ref = null ;

          tree = d3.layout.tree()
              .size([height, width]);

          diagonal = d3.svg.diagonal()
              .projection(function(d) { return [d.y, d.x]; });

          //Remove all previous trees
          d3.select("svg")
            .remove();

          svg = d3.select("#treePlaceholder").append("svg")
              .attr("width", width + margin.right + margin.left)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        }
      });

      //Second autorun that is in charge of drawing the nodes and tree (and redrawing on events)
      this.autorun(function () {
        // but only start it when he Portfolio is defined
        if(Session.get('current_portfolio_doc')) {

          // Create our own JSON-structured file
          var foliom_data = new Object();
          foliom_data = {
              "name": Session.get('current_portfolio_doc').name,
               "children": []
          };

          // Calc all relevant Data
          var treeData = calcBuildingToActionData();

          // Set the data corresponding to the selected mode
          // foliom_data.children = treeData.building_to_actions ;
          foliom_data.children = treeData.actions_to_buildings ;


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
          console.log(root);
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
              .attr("x", function(d) { return d.children || d._children ? -15 : 15; })
              .attr("dy", ".35em")
              .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
              .text(function(d) { return d.name; })
              .style("fill-opacity", 1e-6)
              .attr("id", function(d) { return d.id; }); // Add an ID to be able to select

          // Transition nodes to their new position.
          var nodeUpdate = node.transition()
              .duration(duration)
              .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

          nodeUpdate.select("circle")
              .attr("r", 8.5)
              .style("fill", function(d) { return d._children ? "#a9c700" : "#ececed"; });

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

          // Test to wrap text
          node.each(function(d) {

            console.log("I'm in loop", d3.select(this) );
            if (d.depth == 1){
              console.log("node: ", node, "d.depth: ", d.depth, "d: ", d);
              console.log("this:", this);
              d3.select(this).select("text").call(wrap, 155);
              // node.select("text").call(wrap, 155);
            }; // Only wrap for depth = 1 (ie. first level)
          });


          // New: force click on Building after a refresh
          // if(clickedBuilding_d3ref) {
          //   click(clickedBuilding_d3ref);
          //   clickedBuilding_d3ref = null;
          // }

        } // END UPDATE FUNCTION

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
                // console.log(d);
                // console.log(d.name);

                // clickedBuilding_d3ref = d; // To be able to keep track of it and expand it
                // delete clickedBuilding_d3ref.parent ;

                var clickedBuilding = Buildings.findOne({
                            portfolio_id: Session.get('current_portfolio_doc')._id,
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
                // find the Action
                actionExists = Actions.findOne({
                                    "action_type":"child",
                                    "building_id": Session.get('current_building_doc')._id,
                                    "name": d.name
                                    });

                Session.set('childActionToEdit', actionExists);
                Router.go('action-form');
            }

            update(d);
        }

        // http://bl.ocks.org/mbostock/7555321
        function wrap(text, width) {
          var left_offset = -15;
          text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", left_offset).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
              line.push(word);
              tspan.text(line.join(" "));
              if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", left_offset).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
              }
            }
          });
        }

    }); // END OF AUTORUN





}
