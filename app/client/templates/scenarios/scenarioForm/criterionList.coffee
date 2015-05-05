@toAddCriterionList = [
  {
    type: 'scenarioLevelCriterion',
    criterion: [
      {"label": "yearly_expense_max", "unit": "u_euro_year", "weight": 0},
      {"label": "obsolescence_lifetime_greater_than", "type":"selector", "weight": 0},


      {"label": "energy_consum_atLeast_in_E_year", "unit": "u_percent", "weight": 0},
    ]
  }
  {
    type: 'buildingLevelCriterion',
    criterion: [
      {"label": "priority_to_gobal_obsolescence", "type":"checkbox", "desc": "priority_to_gobal_obsolescence_desc", "weight": 0}
    ]
  }
  {
    type: 'actionLevelCriterion',
    criterion: [
      {"label": "priority_to_techField", "type":"selector", "multiple":true, "weight": 0},
    ]
  }
]
