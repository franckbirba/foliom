@toAddCriterionList = [
  {
    type: 'scenarioLevelCriterion',
    criterion: [
      {"label": "yearly_expense_max", "unit": "u_euro_year"},

      # filter
      {"label": "obsolescence_lifetime_greater_than", "type":"selector"},


      {"label": "energy_consum_atLeast_in_E_year", "unit": "u_percent"},
    ]
  }
  {
    type: 'buildingLevelCriterion',
    criterion: [
      {"label": "priority_to_gobal_obsolescence", "type":"checkbox", "desc": "priority_to_gobal_obsolescence_desc"}
    ]
  }
  {
    type: 'actionLevelCriterion',
    criterion: [
      {"label": "priority_to_techField", "type":"selector", "multiple":true},

      # Filter
      {"label": "gain_energy_consumption_kwhef_greater_than", "unit":"u_kwhEF_year"},
      {"label": "gain_water_consumption_greater_than", "unit":"u_m3_year"},
      {"label": "gain_euro_savings_greater_than", "unit":"u_euro_year"},
    ]
  }
]
