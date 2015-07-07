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

    this.autorun(function () {
        // Get the data, tree SVG, and will be re-run if the Portfolio doc changes >> means that we have to redraw the tree
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
          if (Session.equals('current_tree_mode', 'building_to_actions')) {
            foliom_data.children = treeData.building_to_actions ;
          } else if (Session.equals('current_tree_mode', 'actions_to_buildings')) {
            foliom_data.children = treeData.actions_to_buildings ;
          }

          totalHeight = 45*foliom_data.children.length + 100; //Set totalHeight dynamically

          // DRAW TREE

          margin = {top: 20, right: 120, bottom: 20, left: 120};
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

          // Normalize for fixed-depth. Evol: adjust depth depending on level
          nodes.forEach(function(d) {
            if (d.depth == 1) {
              d.y = d.depth * 200;
            } else {
              d.y = d.depth * 140;
            }
          });

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
              .attr("id", function(d) { return d.id; }) // Add an ID to be able to select
              .attr("level", function(d) { return d.level; }) // Add an ID to be able to select
              .call(wraptext_wrapper); // Test to wrap at enter only

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

          if (Session.equals('current_tree_mode', 'building_to_actions')) {
            if (d.depth == 1) { // Depth==1 means it's a building
              building_to_actions_click_depth1(d);
            } else if (d.depth == 2) { // Depth==2 means it's an action
              building_to_actions_click_depth2(d);
            }
          } else if (Session.equals('current_tree_mode', 'actions_to_buildings')) {

          }


          update(d);
        }


        // Function to add functionnalities to wraptext
        function wraptext_wrapper(text){
          text.each(function(d) {
            if(  d.depth == 1 ){ // Specific rule for wrapping text at depth == 1
              wraptext(d3.select(this), 200, -15);
            }
          });
        };

        // http://bl.ocks.org/mbostock/7555321
        // Evolved function with x_offset parameter: we want a left offset for depth = 1, and right offset for children
        function wraptext(text, width, x_offset) {
          // x_offset = -15;
          // debugger
          text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", x_offset).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
              line.push(word);
              tspan.text(line.join(" "));
              if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", x_offset).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
              }
            }
          });
        }

    }); // END OF AUTORUN





}
