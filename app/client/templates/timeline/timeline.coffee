# Local alias on the namespaced variables for the Timeline
TV = TimelineVars

###*
 * Prepare calculation at template creation.
###
Template.timeline.created = ->
  Log.info 'Timeline created'
  window.scroll 0, 0
  # Reactive var for choosing consumption chart for energy type
  @rxEnergyType = new ReactiveVar
  @rxEnergyType.set 'water'
  # Reset current TimelineVars
  TV.reset()
  # Get denormalized scenario, buildings and portfolios from router
  Log.info 'Routed data'
  TV.getRouterData @data
  console.log "data from router is", @data
  # debugger
  # Set minimum and maximum date
  Log.info 'Min max date'
  TV.setMinMaxDate()
  # Get fluids and coefficients
  Log.info 'Fluids and coefs'
  TV.getFluidsAndCoefs()
  # Create ticks, consumption and budget charts
  Log.info 'Static charts'
  TV.calculateStaticCharts()
  # Reactively perform TimelineTable refresh based on filter changes
  @autorun ->
    buildingFilter = Session.get 'timeline-filter-portfolio-or-building'
    Log.info 'Filter on portfolio or building changed: Recalculate timeline'
    # Calculate values used in the TimelineTable
    TV.calculateTimelineTable buildingFilter
  # Reactively perform TimelineTable and chart refresh on Scenario change
  @autorun (computation) ->
    scenario = Scenarios.findOne TV.scenario._id
    Log.info 'Scenario content changed: Recalculate timeline and charts'
    TV.calculateTimelineTable() unless computation.firstRun
    TV.calculateDynamicChart()

###*
 * Set the consumption chart filter at template rendering.
###
Template.timeline.rendered = ->
  $btnGroup = @$ '[data-role=\'energy-type\']'
  $btnGroup.children().removeClass 'active'
  energyType = @rxEnergyType.get()
  $selected = $btnGroup.find "[data-value=\'#{energyType}\']"
  $selected.addClass 'active'

###*
 * Object containing helper keys for the template.
###
Template.timeline.helpers
  scenarioName: -> TV.scenario.name
  isEnergyTypeWater: -> Template.instance().rxEnergyType.get() is 'water'
  isEnergyTypeCo2: -> Template.instance().rxEnergyType.get() is 'co2'
  isEnergyTypeKwh: -> Template.instance().rxEnergyType.get() is 'kwh'

###*
 * Object containing event actions for the template.
###
Template.timeline.events
  # Change filter on action bucket
  'click [data-role=\'energy-type\']': (e, t) ->
    $btnGroup = t.$ '[data-role=\'energy-type\']'
    $selected = $ e.target
    value = $selected.attr 'data-value'
    unless value is undefined
      $btnGroup.children().removeClass 'active'
      $selected.addClass 'active'
      t.rxEnergyType.set $selected.attr 'data-value'

###*
 * Remove DOM elements not created by Blaze.
###
Template.timeline.destroyed = -> ($ 'span[role=\'status\']')?.remove()
