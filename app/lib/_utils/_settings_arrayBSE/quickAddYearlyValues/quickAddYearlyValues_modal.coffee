if Meteor.isClient
  Template.quickAddYearlyValues.events
    'submit form': (e, scenarioForm_template) ->
      e.preventDefault()
      # Get relevant data
      target = Session.get('quickAdd_for')
      initialValue = $(e.target).find('#initialValue').val() * 1
      evolIndex = $(e.target).find('#evolIndex').val() * 1/100
      # Apply calc
      $("[name^='#{target}.'][name$='.cost']").each (index) ->
        # N+1 = N * (1+%). Equivalent to N+n = N*(1+%)^n
        result = initialValue*(1+evolIndex)**index
        $(@).val( result.toFixed(1)*1 ).change()
      # Close modal
      $('#quickAddYearlyValues_modal').modal('hide')

