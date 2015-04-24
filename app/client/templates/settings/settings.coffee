Template.settings.rendered = () ->
  AutoForm.debug();

  # Function to calc the difference between Last & First val
  calcEvolutionIndex = (currentVal, previousVal) ->
    total_in_percent = ( (currentVal / previousVal) - 1 ) * 100
    total_in_percent.toFixed(3) * 1


  # FORMULA - evolution index : target is yearly_values.1.cost
  $("[name^='icc.evolution_index.'][name$='.cost']").keyup (e) ->

      position = $(this).attr("name").split(".")
      position_number = position.length - 2

      if (position[position_number] >0)
        current_cost = $(this).val() *1
        previous_cost = $("[name='icc.evolution_index.#{position[position_number]-1}.cost']").val() *1

        result = calcEvolutionIndex(current_cost, previous_cost)
        $("[name='icc.evolution_index.#{position[position_number]}.evolution_index']").val(result)

  @autorun ->
    lastCost = AutoForm.getFieldValue("icc.evolution_index.30.cost", "configAutoForm")
    firstCost = AutoForm.getFieldValue("icc.evolution_index.0.cost", "configAutoForm")
    result = calcEvolutionIndex(lastCost, firstCost)
    $("[name='icc.global_evolution_index']").val(result)


  # For Fluids
  # $("[name^='yearly_values.'][name$='.cost']").keyup (e) ->

  #   position = $(this).attr("name").split(".")
  #   position_number = position.length - 2

  #   if (position[position_number] >0)
  #     current_cost = $(this).val() *1
  #     previous_cost = $("[name='yearly_values.#{position[position_number]-1}.cost']").val() *1

  #     result = calcEvolutionIndex(current_cost, previous_cost)
  #     $("[name='yearly_values.#{position[position_number]}.evolution_index']").val(result)

  # this.autorun ()->
  #   lastCost = AutoForm.getFieldValue("yearly_values.30.cost", "fluidAutoForm")
  #   firstCost = AutoForm.getFieldValue("yearly_values.0.cost", "fluidAutoForm")
  #   result = calcEvolutionIndex(lastCost, firstCost)
  #   $("[name='global_evolution_index']").val(result)
