Template.settings.rendered = () ->
  monitorSettingsCosts()

  ## BugFix: for some reason, the Array a new Fluid is not taken into account by the .on('change')
  ## We monitor clicks on Autoform's "add" button, to remove and restart the monitoring
  $(document).bind 'DOMSubtreeModified', ->
    $("[name$='.cost']").off()
    monitorSettingsCosts()
    restrict_visible_years()
    return

  # Restrict visible years for users who are not 'admin' or 'estate_manager'
  restrict_visible_years()



Template.settings.events
  'click #edit-master': (event, template) ->
    Session.set 'editingMasterCfg', true
    return

Template.settings.destroyed = ->
  Session.set 'editingMasterCfg', false
  # And stop the monitoring of new elements
  $(document).unbind('DOMSubtreeModified')
  return

Template.settings.helpers
  getCfg: ->
    curEstate = Session.get('current_estate_doc')
    masterCfg = Session.get('editingMasterCfg')
    if !curEstate or masterCfg
      if !masterCfg
        Session.set 'editingMasterCfg', true
      return Configurations.findOne(master: true)
    curEstateId = curEstate._id
    Configurations.findOne estate_id: curEstateId
  getType: ->
    'update'
  isEditingMasterCfg: ->
    if Session.get('editingMasterCfg') then 'active btn-success' else ''
