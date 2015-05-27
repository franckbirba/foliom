Template.graygreenBar.rendered = () ->
  #the barId is passed when calling the template. It's accessible in @data

  # bar = d3.select("#bar_global_lifetime").select("svg")
  bar = d3.select("#{@data.barId}").select("svg")

  height=14

  x_val = 5
  y_val = 20

  value = "35"
  triangle_color = "#7F7F7F"

  # Create scale
  x_scale = d3.scale.linear().range([0, 105])

  # Create group
  g = bar.append('g')

  # Append text to group
  g.append("text")
    .attr("x", x_val )
    .attr("y", y_val - 8 )
    .attr("dy", ".35em")
    .text( value )
    # .style("font-weight", "bold")
    .style("font-size", "0.8em" )
    .attr "fill", triangle_color

  g.append("text")
    .attr("x", x_val + 15 )
    .attr("y", y_val - 8 )
    .attr("dy", ".35em")
    .text( "%" )
    # .style("font-weight", "bold")
    .style("font-size", "0.5em" )
    .attr "fill", triangle_color

  # Append triangles to group
  g.append('path')
    .attr("d", () ->
        # middle = (y(barHeight) - barVerticalSpacing)/2
        "M #{x_val} #{y_val} l #{height} 0 l -#{height/2} #{height} z"
      )
    .attr "fill", triangle_color


  # Get data for triangle position
  current_building_doc_id = Session.get('current_building_doc')._id
  allLeases = Leases.find(building_id: current_building_doc_id).fetch()

  data =
    'merged': Session.get('current_building_doc').properties.leases_averages
  for lease in allLeases
    data[lease._id]=
      global_comfort_index: lease.comfort_qualitative_assessment.global_comfort_index
      global_lifetime : lease.technical_compliance.global_lifetime
      global_conformity : lease.technical_compliance.global_conformity

  # Autorun to animate
  this.autorun =>
    switch @data.barId
      when '#bar_global_lifetime'
        if Session.get("current_lease_id")
          value = data[Session.get("current_lease_id")].global_lifetime
        else
          value = data.merged.technical_compliance.global_lifetime
        break
      when '#global_conformity'
        if Session.get("current_lease_id")
          value = data[Session.get("current_lease_id")].global_conformity
        else
          value = data.merged.technical_compliance.global_conformity
        break
      when '#global_comfort_index'
        if Session.get("current_lease_id")
          value = data[Session.get("current_lease_id")].global_comfort_index
        else
          value = data.merged.global_comfort_index
        break
    # Update Text (with a special case if only one number)
    value_text = (value * 100).toFixed(0)
    if value_text.length < 2 then value_text = "\u00A0#{value_text}"
    g.select('text').text(value_text)
    # Create position and Transition
    position = x_scale(value)
    translate_command = "translate(" + position + ",0)"
    g.transition().duration(700).attr("transform", translate_command )

  ###
  Examples
  triangle = d3.select('#bar_global_lifetime').select('path')
  triangle.transition().duration(700).attr("transform", "translate(110,0)" );
  ###
