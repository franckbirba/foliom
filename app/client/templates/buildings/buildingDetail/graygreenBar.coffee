Template.graygreenBar.created = ->
  instance = this
  instance.draw_triangle = new ReactiveVar(true)

Template.graygreenBar.rendered = () ->
  #the barId is passed when calling the template. It's accessible in @data

  draw_triangle = Template.instance().draw_triangle.get()

  if draw_triangle is true
    # bar = d3.select("#bar_global_lifetime").select("svg")
    bar = d3.select("#{@data.barId}").select("svg")

    height=15

    x_val = 0
    y_val = 20

    value = "35 %"
    triangle_color = "#7F7F7F"

    #text
    bar.append("text")
      .attr("x", x_val )
      .attr("y", y_val - 8 )
      .attr("dy", ".35em")
      .text( value )
      # .style("font-weight", "bold")
      .style("font-size", "0.9em" )
      .attr "fill", triangle_color

    #triangles
    bar.append('path')
      .attr("d", () ->
          # middle = (y(barHeight) - barVerticalSpacing)/2
          "M #{x_val} #{y_val} l #{height} 0 l -#{height/2} #{height} z"
        )
      .attr "fill", triangle_color

    Template.instance().draw_triangle.set(false) #Only draw the triangle once
