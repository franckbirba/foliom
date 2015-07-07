Template.ges.rendered = ->
  # Current selected building is set as 'this'
  buildingId = @data._id

  this.autorun =>
    graphBuilder "ges", Template.currentData().ges_data #Reactive Data source (@data is not reactive)
