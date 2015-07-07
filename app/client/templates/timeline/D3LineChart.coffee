###*
 * Responsive D3 charts for lines
###
class @D3LineChart
  ###*
   * C-tor
   * @param  {String} @svgContainer DOM container with a .d3-svg-container
   * @param  {Boolean} @showLegend  Show or hide the legend, default to true
   * @param  {Object} @margin       Margins as an Object of Number
   *                                with top, right, bottom, left keys,
   *                                default to { top: 10, right: 15,
   *                                bottom: 20, left: 30, righLegend = 180}
   * @param  {Number} @svgWidth     Width of the SVG, default to 490
   * @param  {Number} @svgHeight    Heigh of the SVG, default to 160
  ###
  constructor: (
    @svgContainer,
    @showLegend = true,
    @margin = { top: 23, right: 1, bottom: 20, left: 40, rightLegend: 185 },
    @svgWidth = 750,
    @svgHeight = 180
  ) ->
    # Graph's width
    @graphWidth = @svgWidth - @margin.left - \
      if @showLegend then @margin.rightLegend else @margin.right
    # Graph's height
    @graphHeight = @svgHeight - @margin.top - @margin.bottom
    # Chart's display functions
    @lines = []
    # Add an SVG element with the desired dimensions and margin.
    @svg = d3.select @svgContainer
      .append 'div'
        .attr 'class', 'mFadeIn'
      .append 'svg:svg'
      # Make SVG responsive
      .attr 'preserveAspectRatio', 'xMinYMin meet'
      .attr 'viewBox', "0 0 #{@svgWidth} #{@svgHeight}"
      .attr 'class', 'd3-svg-content'
    # Get tooltip associated to the chart
    @tooltip = $ "[data-tooltip=#{(d3.select @svgContainer).attr 'data-chart'}]"
    @lazyShowHideTip = _.debounce @showHideTip, 300
    # Group chart's components
    @graph = @svg.append 'svg:g'
      .attr 'transform', "translate(#{@margin.left}, #{@margin.top})"
    # Number of legends
    @nbLegend = 0
    # Is graph in fullscreen
    @isFullScreen = false
  showHideTip: -> @tooltip.toggleClass 'show'
  showTip: -> Meteor.setTimeout (=> @tooltip.addClass 'show'), 300

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
      .tickFormat (d, i) -> (numeral d).format '0.0a'
      .tickSize -@graphWidth
      .tickPadding 6
      .orient 'left'
    # Add the yAxis
    @graph.append 'svg:g'
      .attr 'class', 'y axis'
      .call yAxis
    .append 'text'
      .attr 'transform', 'rotate(-90)'
      .attr 'y', -40
      .attr 'dy', '.8em'
      .style 'text-anchor', 'end'
      .text unit
  ###*
   * Display legends.
   * @param {String} name Legend's name.
   * @param {String} style Legend's style.
  ###
  _setLegend: (name, style) ->
    if @showLegend
      @graph.append 'circle'
        .attr 'class', "legend #{style}"
        .attr 'r', 4
        .attr 'cx', @graphWidth + 10
        .attr 'cy', @nbLegend * 12 + 16
      @graph.append 'text'
        .attr 'class', "legend #{style}"
        .attr 'x', @graphWidth + 17
        .attr 'y', @nbLegend * 12 + 20
        .text name
      @nbLegend++
  ###*
   * Set the chart line and store the line function as a line member.
   * @param {Array} arr Array of Number.
   * @param {String} style Chart line's style.
  ###
  _setChartLine: (arr, style) ->
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
      .attr 'class', style
      .attr 'd', line arr
    line['group'] = lineGroup
    @lines.push line
  ###*
   * Set circles on a graph line and create tooltip shown when circles hovered.
   * @param {String} name Chart's name.
   * @param {String} style Chart point's style.
   * @param {Array} arr Array of Number used for drawing a chart.
  ###
  _setCirclesTooltip: (name, style, arr) ->
    line = _.last @lines
    self = @
    group = line.group.selectAll 'g'
      .data arr
      .enter()
      .append 'svg:g'
        .attr 'class', 'point'
        .on 'mouseover', (d, i) ->
          circle = ($ @).find 'circle'
          content = self.tooltip.find 'span'
          content.html "<strong>#{name}</strong><br>\
            <span>#{(numeral d).format '0.0a'} #{self.unit}</span><br>\
            <span>#{self.abscissa[i]}</span>"
          rect = circle[0].getBoundingClientRect()
          self.tooltip.css 'transform', "translate3d(\
            #{rect.left + .5 * (rect.width - self.tooltip.width())}px,\
            #{rect.top - self.tooltip.height() - 5}px, 0)"
          self.showTip()
        .on 'mouseleave', (d, i) => @lazyShowHideTip()
    line.group.selectAll 'g.point'
      .append 'circle'
        .attr 'class', style
        .attr 'r', 3
        .attr 'cx', (d, i) => @xScalingFct i
        .attr 'cy', (d) => @yScalingFct d
    line.group.selectAll 'g.point'
      .append 'rect'
        .attr 'x', (d, i) => -10 + @xScalingFct i
        .attr 'y', (d) => -20 + @yScalingFct d
        .attr 'width', 20
        .attr 'height', 40
  ###*
   * Create a show / hide button usable by a reactive helper.
  ###
  _createShowHideLegend: ->
    @svg.append 'text'
      .attr 'class', 'showhide-legend'
      .attr 'x', @svgWidth - 15
      .attr 'y', 15
      .text if @showLegend then '' else ''  # Eyes are UTF8 from FontAwesome
  ###*
   * Create a fullscreen toggle button usable by a reactive helper.
  ###
  _createToggleFullscreen: ->
    @svg.append 'text'
      .attr 'class', 'fullscreen'
      .attr 'x', @svgWidth - 33
      .attr 'y', 15
      .text if @isFullScreen then '' else ''# Expand are UTF8 from FontAwesome
  ###*
   * Set data for each lines.
   * @param {Object} obj An Object describing each chart.
  ###
  setData: (obj) ->
    # Display axis
    @_setXAxis obj.chartName, obj.quarters
    @_setYAxis obj.unit, _.flatten(_.pluck obj.series, 'data')
    # Display the show / hide button
    @_createShowHideLegend()
    # Display the fullscreen button
    @_createToggleFullscreen()
    for dataObj, idx in obj.series
      # Prevent hoisting by performing immediate actions
      do (name=dataObj.name, data=dataObj.data, style=dataObj.style) =>
        # Display legend
        @_setLegend name, style
        # Display chart
        @_setChartLine data, style
        # Display circles and tooltips
        @_setCirclesTooltip name, style, data
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
        line.group.selectAll 'rect'
          .data data
          .transition()
          .attr 'x', (d, i) => -10 + @xScalingFct i
          .attr 'y', (d) => -20 + @yScalingFct d
        stuff = line.group.selectAll 'path'
          .transition()
          .attr 'd', line data
