Template.settings.rendered = () ->
  # AutoForm.debug();
  # Total number of years
  nb_years = $("[name^='icc.evolution_index'][name$='.cost']").length

  # Function to calc the difference between Last & First val
  calcEvolutionIndex = (currentVal, previousVal) ->
    total_in_percent = ( (currentVal / previousVal) - 1 ) * 100
    total_in_percent.toFixed(1) * 1


  applyEvolutionIndex = (object_name, index) ->
    current_cost = $("[name='#{object_name}.#{index}.cost']").val() *1
    previous_cost = $("[name='#{object_name}.#{index-1}.cost']").val() *1

    result = calcEvolutionIndex(current_cost, previous_cost)
    # console.log "For index (#{index}): current_cost is #{current_cost}, previous_cost is #{previous_cost}, result is #{result}"
    $("[name='#{object_name}.#{index}.evolution_index']").val(result).change()

  monitorSettingsCosts = () ->
    # Track all items whose name end by ".cost"
    $("[name$='.cost']").change ->
      # Start with splitting the name of the item that changed
      name_split = $(@).attr("name").split(".")

      # name looks like fluids.0.yearly_values.6.cost, or icc.evolution_index.5.cost
      index_position = name_split.length - 2 # index position is always at -2 from the end of the name
      index = name_split[index_position]*1
      object_name = name_split[0...index_position].join(".") # get all items until the index (excluded)

      # console.log "object_name is #{object_name}, and index is #{index}"

      # Apply index through a function - so that we can update both index and index+1 (but make special cases for the first and last cell)
      if (index >0) then applyEvolutionIndex(object_name, index)
      if (index <nb_years-1) then applyEvolutionIndex(object_name, index+1)

      # Always update global_index. Could be optimized
      lastCost = $("[name='#{object_name}.30.cost']").val()*1
      firstCost = $("[name='#{object_name}.0.cost']").val()*1
      result = calcEvolutionIndex(lastCost, firstCost)
      # The name of the global evolution index is slightly different depending on the object, eg: icc.global_evolution_index OR fluids.3.global_evolution_index
      if name_split[0] is 'fluids' then global_evolution_index_name = name_split[0..1].join(".")
      else global_evolution_index_name = name_split[0]
      $("[name='#{global_evolution_index_name}.global_evolution_index']").val(result)


  monitorSettingsCosts()
