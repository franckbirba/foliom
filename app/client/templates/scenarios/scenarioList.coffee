Template.scenarioList.helpers
  getScenarios: ->
    Scenarios.find() if Session.get 'current_estate_doc'

Template.scenarioList.events
  'click .newScenario': (e) ->
    e.preventDefault()
    Session.set 'current_scenario_doc', null
    Router.go 'scenario-form'
  'click .scenarioItem': (e) ->
    Router.go 'scenario-form', this
