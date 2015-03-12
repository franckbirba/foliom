@isERP = (param) ->
  if param is "" or param is "NA" then false
  else true

@periodicityToMoment = (param) ->
  result = switch
    when param is "monthly" then {months:1}
    when param is "quaterly" then {quarters:1}
    when param is "bi_annual" then {quarters:2}
    when param is "yearly" then {years:1}
    when param is "2_years" then {years:2}
    when param is "5_years" then {years:5}
    when param is "7_years" then {years:7}
    when param is "10_years" then {years:10}
