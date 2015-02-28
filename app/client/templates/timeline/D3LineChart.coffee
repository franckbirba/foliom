###*
 * Responsive D3 charts for lines
###
class @D3LineChart
  ###*
   * C-tor
   * @param  {String} @svgContainer DOM container with a .d3-svg-container
   * @param  {Object} @margin       Margins as an Object of Number
   *                                with top, right, bottom, left keys,
   *                                default to { top: 10, right: 30,
   *                                bottom: 20, left: 30 }
   * @param  {Number} @svgWidth     Width of the SVG, default to 490
   * @param  {Number} @svgHeight    Heigh of the SVG, default to 195
  ###
  constructor: (
    @svgContainer,
    @margin = { top: 10, right: 15, bottom: 20, left: 45 },
    @svgWidth = 750,
    @svgHeight = 170
  ) ->
    # Graph's width
    @graphWidth = @svgWidth - @margin.left - @margin.right
    # Graph's height
    @graphHeight = @svgHeight - @margin.top - @margin.bottom
    # Chart's display functions
    @lines = []
    # Add an SVG element with the desired dimensions and margin.
    @graph = d3.select @svgContainer
      .append 'svg:svg'
      # Make SVG responsive
      .attr 'preserveAspectRatio', 'xMinYMin meet'
      .attr 'viewBox', "0 0 #{@svgWidth} #{@svgHeight}"
      .attr 'class', 'd3-svg-content'
      # Group chart's components
      .append 'svg:g'
      .attr 'transform', "translate(#{@margin.left}, #{@margin.top})"
    # Number of legends
    @nbLegend = 0
  ###*
   * Set the abscissa for each lines, calulate the xScalingFct, hold the
   * abscissa as a member reused for displaying date values within tooltips,
   * and display the chart's name.
   * @param {String} chartName Chart's name as set on the xAxis.
   * @param {Array} arr An array of Number.
  ###
  _setXAxis: (chartName, arr) ->
    @abscissa = arr
    @xScalingFct = d3.scale.linear()
      .domain [0, arr.length]
      .range [0, @graphWidth]
    # Create xAxis
    xAxis = d3.svg.axis()
      .scale @xScalingFct
      .tickFormat (d, i) -> arr[d]
      .tickSize -@graphHeight
      .tickPadding 6
    # Add the xAxis
    @graph.append 'svg:g'
      .attr 'class', 'x axis'
      .attr 'transform', "translate(0, #{@graphHeight})"
      .call xAxis
    .append 'text'
      .attr 'class', 'label'
      .attr 'x', @graphWidth
      .attr 'y', -6
      .style 'text-anchor', 'end'
      .text chartName
  ###*
   * Set yAxis, calculate yScalingFctn and display units.
   * @param {String} unit Unit for the yAxis.
   * @param {Array} arr  Array of Number used for drawing the first chart.
  ###
  _setYAxis: (@unit, arr) ->
    @yScalingFct = d3.scale.linear()
      .domain [(d3.max arr), 0]
      .range [0, @graphHeight]
    # Create yAxis
    yAxis = d3.svg.axis()
      .scale @yScalingFct
      .tickFormat (d, i) -> numeral(d).format('0.0a')
      .tickSize -@graphWidth
      .tickPadding 6
      .orient 'left'
    # Add the yAxis
    @graph.append 'svg:g'
      .attr 'class', 'y axis'
      .call yAxis
    .append 'text'
      .attr 'transform', 'rotate(-90)'
      .attr 'y', -35
      .attr 'dy', '.71em'
      .style 'text-anchor', 'end'
      .text unit
  ###*
   * Display legends.
   * @param {String} name Legend's name.
  ###
  _setLegend: (name) ->
    @graph.append 'circle'
      .attr 'class', "data#{@lines.length} legend"
      .attr 'r', 4
      .attr 'cx', @graphWidth - 180
      .attr 'cy', @nbLegend * 12 + 16
    @graph.append 'text'
      .attr 'class', "data#{@lines.length} legend"
      .attr 'x', @graphWidth - 170
      .attr 'y', @nbLegend * 12 + 20
      .text name
    @nbLegend++
  ###*
   * Set the chart line and store the line function as a line member.
   * @param {Array} arr Array of Number.
  ###
  _setChartLine: (arr) ->
    # Set the line properties
    line = d3.svg.line()
      .x (d, i) =>
        # Return the X coordinate where we want to plot this datapoint
        @xScalingFct i
      .y (d) =>
        # Return the Y coordinate where we want to plot this datapoint
        @yScalingFct d
    # Add lines after axis and tick lines have been drawn
    lineGroup = @graph.append 'svg:g'
      .attr 'class', "data#{@lines.length}"
    lineGroup.append 'svg:path'
      .attr 'd', line arr
    line['group'] = lineGroup
    @lines.push line
  ###*
   * Set circles on a graph line and create tooltip shown when circles hovered.
   * @param {String} name Chart's name.
   * @param {Array} arr Array of Number used for drawing a chart.
  ###
  _setCirclesTooltip: (name, arr) ->
    # Add circles and tips
    tip = d3.tip()
      .attr 'class', 'd3-tip'
      .offset [-12, 0]
      .html (d, i) =>
        "<div class='animated fadeInUp'>
        <div class='d3-tip-content'>
        <strong>#{name}</strong><br>\
        <span>#{d} #{@unit}</span><br>\
        <span>#{@abscissa[i]}</span>
        </div></div>"
    @graph.call tip
    line = _.last @lines
    line.group.selectAll 'circle'
      .data arr
      .enter()
      .append 'circle'
      .attr 'r', 4
      .attr 'cx', (d, i) => @xScalingFct i
      .attr 'cy', (d) => @yScalingFct d
      .on 'mouseover', tip.show
      .on 'mouseout', tip.hide
  ###*
   * Set data for each lines.
   * @param {Object} obj An Object describing each chart.
  ###
  setData: (obj) ->
    @_setXAxis obj.chartName, obj.quarters
    for dataObj, idx in obj.series
      # Prevent hoisting by performing immediate actions
      do (name=dataObj.name, data=dataObj.data, unit=obj.unit, idx=idx) =>
        # Only display xAxis and yAxis on the first data set
        @_setYAxis unit, data if idx is 0
        # Display legend
        @_setLegend name
        # Display chart
        @_setChartLine data
        # Display circles and tooltips
        @_setCirclesTooltip name, data
  ###*
   * Update lines and circles.
   * @param {Object} obj An Object describing each chart.
  ###
  updateData: (obj) ->
    for dataObj, idx in obj.series
      do (data=dataObj.data, idx=idx) =>
        line = @lines[idx]
        line.group.selectAll 'circle'
          .data data
          .transition()
          .attr 'cx', (d, i) => @xScalingFct i
          .attr 'cy', (d) => @yScalingFct d
        stuff = line.group.selectAll 'path'
          .transition()
          .attr 'd', line data
