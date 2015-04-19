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
  'click .dropdownBtn': (e) ->
    e.stopPropagation(); # Prevent propagation
    $('#'+ this._id).dropdown('toggle')

  # 'click .editItem': function(e) { //Sends to the Action form for updating
  #       e.preventDefault();
  #       Session.set('updateAction', this);
  #       Router.go('action-form');
  #   },
