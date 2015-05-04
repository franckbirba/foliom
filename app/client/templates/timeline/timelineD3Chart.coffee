# Local alias on the namespaced variables for the Timeline
TV = TimelineVars

###*
 * Create 2 series, one taking no action in account and a second with actions.
 * @param {Array}  pactions  An array of planned actions.
 * @param {String} chartType A property used for the chart's type.
 * @param {String} fluidType A fluid kind or type.
 * @param {String} color     A color for each serie.
###
setSeries = (pactions, chartType, fluidType, color) ->
  firstUpperCase = fluidType.substr(0, 1).toUpperCase() + fluidType.substr(1)
  for act in [true, false]
    name: TAPi18n.__ \
      "#{chartType}_#{if act then 'no' else ''}action_#{fluidType}"
    style: "#{if act then 'no' else ''}action #{color}"
    data: if act then TV.charts[chartType][fluidType] else \
      sum2Suites TV.charts[chartType][fluidType],
        sumSuiteFromArray pactions, "#{chartType}#{firstUpperCase}"

###*
 * Chart's functions
###
ChartFct =
  ###*
   * Calculate and present data suite for the Water consumption chart.
  ###
  waterConsumptionChart: (pactions) ->
    quarters: TV.charts.ticks
    unit: TAPi18n.__ 'u_m3'
    chartName: TAPi18n.__ 'consumption_label'
    series: setSeries pactions, 'consumption', 'water', 'blue'
  ###*
   * Calculate and present data suite for the CO2 consumption chart.
  ###
  co2ConsumptionChart: (pactions) ->
    quarters: TV.charts.ticks
    unit: TAPi18n.__ 'u_kg_eqC02_m2_year'
    chartName: TAPi18n.__ 'consumption_label'
    series: setSeries pactions, 'consumption', 'co2', 'darkgray'
  ###*
   * Calculate and present data suite for the kWh consumption chart.
  ###
  kwhConsumptionChart: (pactions) ->
    quarters: TV.charts.ticks
    unit: TAPi18n.__ 'u_kwhEF'
    chartName: TAPi18n.__ 'consumption_label'
    series: setSeries pactions, 'consumption', 'kwh', 'orange'
  ###*
   * Calculate and present data suite for the Expense chart.
  ###
  invoiceChart: (pactions) ->
    quarters: TV.charts.ticks
    unit: TAPi18n.__ 'u_euro'
    chartName: TAPi18n.__ 'invoice_label'
    series: []
      .concat setSeries pactions, 'invoice', 'water', 'blue'
      .concat setSeries pactions, 'invoice', 'electricity', 'violet'
      .concat setSeries pactions, 'invoice', 'cool', 'darkgray'
      .concat setSeries pactions, 'invoice', 'heat', 'red'
  ###*
   * Calculate and present data suite for the Investment chart.
  ###
  investmentChart: (pactions) ->
    quarters: TV.charts.ticks
    unit: TAPi18n.__ 'u_euro'
    chartName: TAPi18n.__ 'investment_label'
    series: [
      {
        name: TAPi18n.__ 'investment_budget'
        style: 'action green'
        data: TV.charts.budget
      }
      {
        name: TAPi18n.__ 'investment_raw'
        style: 'action darkgray'
        data: sumSuiteFromArray pactions, 'investment'
      }
      {
        name: TAPi18n.__ 'investment_minus_subventions'
        style: 'action gray'
        data: sumSuiteFromArray pactions, 'investmentSubventioned'
      }
      {
        name: TAPi18n.__ 'total_cost_noaction'
        style: 'action violet'
        data: sumAllSuites TV.charts.invoice
      }
      # {
      #   name: TAPi18n.__ 'total_cost_action'
      #   style: 'action red'
      #   data: sumSuiteFromArray pactions, 'investmentSubventioned'
      # }
    ]

###*
 * Set the template created callback for creating the reactive vars.
###
Template.timelineD3Chart.created = ->
  @rxDisplayLegend = new ReactiveVar
  @rxDisplayLegend.set true
  @rxFullScreen = new ReactiveVar
  @rxFullScreen.set false

createChart = (t, isFullscreen) ->
  width = 750
  height = 180
  top = 23
  if isFullscreen
    $window = $ window
    width = $window.width()
    height = $window.height()
    # Leave space for the tooltips
    top = 80
  t['chart'] = new D3LineChart "[data-chart='#{t.data.chartName}']", \
    t.rxDisplayLegend.get(),
      { top: top, right: 1, bottom: 20, left: 40, rightLegend: 185 },
      width, height
  t.chart.setData t.chartData
  # Meteor's event helper is not used here as the charts are rendered
  #  after the template rendering. Thus, the event assignement is done
  #  on the next requestAnimationFrame.
  Meteor.setTimeout ->
    (t.$ '.showhide-legend').on 'click', ->
      t.rxDisplayLegend.set not t.rxDisplayLegend.get()
    (t.$ '.fullscreen').on 'click', ->
      t.rxFullScreen.set not t.rxFullScreen.get()
  , 32

###*
 * Set the template rendered callback for creating the charts and their
 * behavior once the reactive vars are modified.
###
Template.timelineD3Chart.rendered = ->
  @chartFct = ChartFct[@data.chartName]
  pactions = _.filter TV.rxPlannedActions.get(), (action) ->
    action.start isnt null
  @chartData = @chartFct pactions
  # Specific behavior for the investment chart
  if @data.chartName is 'investmentChart'
    console.log 'Add some specific data for investmentChart'

  # An autorun is used for drawing the chart as its layout may change
  #  when the legend show/hide button is toggled.
  @autorun (computation) =>
    isFullscreen = @rxFullScreen.get()
    displayLegend = @rxDisplayLegend.get()
    isSetFullscreen = false
    # When the chart needs to be redrawn for legend or fullscreen toggling,
    #  the former content needs to be removed from the screen.
    unless computation.firstRun
      # Remove the former chart and the associated event.
      chartContainer = (@$ "[data-chart='#{@data.chartName}']")
      chartContainer.find('.mFadeIn').remove()
      if isFullscreen isnt screenfull.isFullscreen
        if isFullscreen
          screenfull.request chartContainer[0]
          isSetFullscreen = true
        else
          screenfull.exit()
    # Wait few seconds for the screen resolution to settle when
    # going in fullscreen.
    if isSetFullscreen
      Meteor.setTimeout (=> createChart @, isFullscreen), 1500
    else
      createChart @, isFullscreen
  # Update chart when reactive variables change
  # NOTE: We use the computation on the Template.Tracker for avoiding
  # the first call to the chart's update.
  @autorun (computation) =>
    pactions = _.filter TV.rxPlannedActions.get(), (action) ->
      action.start isnt null
    unless computation.firstRun
      @chartData = @chartFct pactions
      # Specific behavior for the investment chart
      if @data.chartName is 'investmentChart'
        console.log 'Update some specific data for investmentChart'

      @chart.updateData @chartData

###*
 * Object containing event actions for the template.
###
Template.timelineD3Chart.events
  'webkitfullscreenchange': (e, t) ->
    if t.rxFullScreen.get() and not screenfull.isFullscreen
      t.rxFullScreen.set false

###*
 * Create an Array of the provided size filled with 0.
 * @param {Number} size Size of the expected Array.
 * @return {Array} The created Array.
###
createArrayFilledWithZero = (size) ->
  (Array.apply null, new Array size).map Number.prototype.valueOf, 0

###*
 * Sum suites from an Array of Object with suites reachable with the same
 *  property key.
 * @param {Array} arr The Array of Object.
 * @param {String} key The property of the Object.
 * @result {Array} The suite as a sum of all the Array of Object suite.
###
sumSuiteFromArray = (arr, key) ->
  results = createArrayFilledWithZero arr[0][key].length
  for idx in [0...results.length]
    for item in arr
      results[idx] += item[key][idx]
  results

###*
 * Sum 2 suites of exact same length.
 * @param {Array} suite1 First suite. Its length is used as the reference.
 * @param {Array} suite2 Second suite.
 * @return {Array} The result of the sum.
###
sum2Suites = (suite1, suite2) ->
  results = createArrayFilledWithZero suite1.length
  for idx in [0...results.length]
    results[idx] = suite1[idx] + suite2[idx]
  results

###*
 * Sum all suites in a dictionnary of suite.
 * @param {Object} suites A dictionnary of suites with same length.
 * @return {Array} The result of the sum.
###
sumAllSuites = (suites) ->
  keys = (key for key of suites)
  results = createArrayFilledWithZero suites[keys[0]].length
  for idx in [0...results.length]
    results[idx] += results[idx - 1] unless idx is 0
    for key in keys
      results[idx] += suites[key][idx]
  results
