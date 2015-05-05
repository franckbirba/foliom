# Local alias on the namespaced variables for the Timeline
TV = TimelineVars

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
    series: [
      {
        name: TAPi18n.__ 'consumption_action_water'
        style: 'noaction blue'
        data: TV.charts.consumption.water
      }
      {
        name: TAPi18n.__ 'consumption_noaction_water'
        style: 'action blue'
        data: TV.actionCharts.consumption.water
      }
    ]
  ###*
   * Calculate and present data suite for the CO2 consumption chart.
  ###
  co2ConsumptionChart: (pactions) ->
    quarters: TV.charts.ticks
    unit: TAPi18n.__ 'u_kg_eqC02_m2_year'
    chartName: TAPi18n.__ 'consumption_label'
    series: [
      {
        name: TAPi18n.__ 'consumption_action_co2'
        style: 'noaction darkgray'
        data: TV.charts.consumption.co2
      }
      {
        name: TAPi18n.__ 'consumption_noaction_co2'
        style: 'action darkgray'
        data: TV.actionCharts.consumption.co2
      }
    ]
  ###*
   * Calculate and present data suite for the kWh consumption chart.
  ###
  kwhConsumptionChart: (pactions) ->
    quarters: TV.charts.ticks
    unit: TAPi18n.__ 'u_kwhEF'
    chartName: TAPi18n.__ 'consumption_label'
    series: [
      {
        name: TAPi18n.__ 'consumption_action_kwh'
        style: 'noaction orange'
        data: TV.charts.consumption.kwh
      }
      {
        name: TAPi18n.__ 'consumption_noaction_kwh'
        style: 'action orange'
        data: TV.actionCharts.consumption.kwh
      }
    ]
  ###*
   * Calculate and present data suite for the Expense chart.
  ###
  invoiceChart: (pactions) ->
    quarters: TV.charts.ticks
    unit: TAPi18n.__ 'u_euro'
    chartName: TAPi18n.__ 'invoice_label'
    series: [
      {
        name: TAPi18n.__ 'invoice_noaction_water'
        style: 'noaction blue'
        data: TV.charts.invoice.water
      }
      {
        name: TAPi18n.__ 'invoice_action_water'
        style: 'action blue'
        data: TV.actionCharts.invoice.water
      }
      {
        name: TAPi18n.__ 'invoice_noaction_electricity'
        style: 'noaction violet'
        data: TV.charts.invoice.electricity
      }
      {
        name: TAPi18n.__ 'invoice_action_electricity'
        style: 'action violet'
        data: TV.actionCharts.invoice.electricity
      }
      {
        name: TAPi18n.__ 'invoice_noaction_cool'
        style: 'noaction darkgray'
        data: TV.charts.invoice.cool
      }
      {
        name: TAPi18n.__ 'invoice_action_cool'
        style: 'action darkgray'
        data: TV.actionCharts.invoice.cool
      }
      {
        name: TAPi18n.__ 'invoice_noaction_heat'
        style: 'noaction red'
        data: TV.charts.invoice.heat
      }
      {
        name: TAPi18n.__ 'invoice_action_heat'
        style: 'action red'
        data: TV.actionCharts.invoice.heat
      }
    ]
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
        data: TV.actionCharts.investment.raw
      }
      {
        name: TAPi18n.__ 'investment_minus_subventions'
        style: 'action gray'
        data: TV.actionCharts.investment.subventionned
      }
      {
        name: TAPi18n.__ 'total_cost_noaction'
        style: 'action violet'
        data: sumAllSuites TV.charts.invoice
      }
      # @NOTE Total costs with actions is achieved once all other
      # charts have been calculated.
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
  @calculateTotalCostChart = ->
    @chartData.series.push
      name: TAPi18n.__ 'total_cost_action'
      style: 'action red'
      data: []
    subventionnedInvestment = @chartData.series[2].data
    noAction = @chartData.series[3].data
    withAction = @chartData.series[4].data
    totalGain = 0
    triGlobal = 0
    for quarter, idx in @chartData.quarters
      totalGain += paction.allGains[idx] for paction in pactions
      # @NOTE Gain are negative values.
      withAction.push noAction[idx] + subventionnedInvestment[idx] + totalGain
      # Check if action chart cross no action chart
      if withAction[idx] < noAction[idx] and triGlobal is 0
        # In this case, we got our global return of invest
        m = moment.duration()
        triGlobal = (m.add idx, 'Q').years()
    TV.rxTriGlobal.set triGlobal
  # Specific behavior for CO2 / Water / link actions emission chart
  # @TODO Use TV.endBuildAction for setting the end of spares
  # Specific behavior for the investment chart
  @calculateTotalCostChart() if @data.chartName is 'investmentChart'
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
      if Template.instance().data.chartName is 'investmentChart'
        @calculateTotalCostChart()
      @chart.updateData @chartData

###*
 * Object containing event actions for the template.
###
Template.timelineD3Chart.events
  'webkitfullscreenchange': (e, t) ->
    if t.rxFullScreen.get() and not screenfull.isFullscreen
      t.rxFullScreen.set false

###*
 * Sum all suites in a dictionnary of suite.
 * @param {Object} suites A dictionnary of suites with same length.
 * @return {Array} The result of the sum.
###
sumAllSuites = (suites) ->
  keys = (key for key of suites)
  results = TV.createArrayFilledWithZero suites[keys[0]].length
  for idx in [0...results.length]
    results[idx] += results[idx - 1] unless idx is 0
    for key in keys
      results[idx] += suites[key][idx]
  results
