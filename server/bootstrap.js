// if the database is empty on server start, create some sample data.
Meteor.startup(function () {


  /*TODO: try to put this soewhere else*/
  Meteor.methods({
        addUser: function(user){
           return Accounts.createUser(user);
        },
        addRole: function(user, roles){
          return Roles.addUsersToRoles(Meteor.users.findOne({_id:user}), roles);
        },
        updateUser: function(user){

          return Meteor.users.update(user.id, user.update);
        },
        copyMasterCfg: function(estateId){
          var MasterCfg = Configurations.findOne({master:true});
          delete MasterCfg._id;
          MasterCfg.master = false;
          MasterCfg.creation_date = new Date();
          MasterCfg.estate_id = estateId;
          Configurations.insert(MasterCfg);
        },
        updateSelector: function(selectorToUpdate, labelToUpdate){
          // Selectors.update({name:"fluid_type", labels: "gas"}, { $pull: { "labels": "gas"} } );
            searchQuery = {"name":selectorToUpdate, "labels": labelToUpdate};

            if (Selectors.findOne(searchQuery).labels.length == 1) {
                // If there's only one label in the item, the we delete it
                Selectors.remove(searchQuery) ;
            } else {
                Selectors.update(
                    searchQuery, //Search
                    { $pull: { "labels": labelToUpdate} } // update query
                  );
            }
        },
        // toEnglish: function(itemToTranslate){
        //     console.log( TAPi18n.__("Faisabilité site occupé", null, { lng: 'en' } ) );
        //     console.log( TAPi18n.__("lead_disconnector", null, 'fr' ) );
        //     console.log( TAPi18n.__("Conformité technique", 'en' ) );
        // },

        myServerMethod: function(doc) {
          try {
            check(doc, Schema.User);
            Schema.User.clean(doc);
          }catch(e){
            throw new Meteor.Error(e);
          }

          //do some stuff here and throw a new Meteor.Error if there is a problem
        }
  });

	if (Meteor.users.find().count() === 0) {
		console.log("creating user test");
    var testUser = Accounts.createUser({
      profile: {
        firstName: "test",
        lastName: "tester"
      },
      email: "test@test.com",
      password: "test"
    });

    var Admin = Accounts.createUser({
      profile:{
        firstName: "admin",
        lastName: "admin"
      },
      email: "admin@test.com",
      password: "admin"
    });

    Roles.addUsersToRoles(testUser, ['user']);
    Roles.addUsersToRoles(Admin, ['admin']);
	}
	if(Configurations.find().count() === 0) {
		var tmpMasterConfig = {
        	master: true,
        	creation_date: new Date(),
        	indexes: [],
        	project_type_static_index: {
            	classic: 0,
            	cpe: 0,
            	cr: 0,
            	crem: 0,
            	ppp: 0,
            	cpi: 0,
        	},
        	fluids: [],
        	mailing_list: "admin@test.com"
		};
		var masterCfgId = Configurations.insert(tmpMasterConfig);
		console.log('created master configuration ' + masterCfgId);
	}
    if(Estates.find().count() === 0) {
        var tmpConfig = {
            estate_name: "77",
        };
        var estate_id = Estates.insert(tmpConfig);
        console.log('inserted estate 77, ' + estate_id);
        var estateCfg = tmpMasterConfig;
        estateCfg.master = false;
        estateCfg.creation_date = new Date();
        estateCfg.estate_id = estate_id;
        estateCfg.mailing_list = "test@test.com"
        var cfgId = Configurations.insert(estateCfg);
        console.log('Inserted Cfg for estate 77 ' +  cfgId);
    }
    if(Selectors.find().count() === 0) {
        var tmpSelectorList = [
                {
                    name: 'fluid_type',
                    labels: ["fluid_electricity", "fluid_water", "fluid_heat" ],
                    portfolio_id: ""
                },
                {
                    name: 'fluid_provider',
                    labels: ["EDF", "Poweo", "Lyonnaise des Eaux"],
                    portfolio_id: ""
                },
                {
                    name: 'lease_usage',
                    labels: ["office", "retail", "residential"],
                    portfolio_id: ""
                },
                {
                    name: 'conformity_options',
                    labels: ["compliant", "not_compliant_minor", "not_compliant_major"],
                    portfolio_id: ""
                },

            ];

        _.each(tmpSelectorList, function(item) {
            Selectors.insert(
                    item
                    // estate_id: item.estate_id
                );
            console.log(item);
        });

        console.log('created first Selector list - 2 items!');

    };
    if(EndUse.find().count() === 0) {
        var data = [
                {
                    end_use_name: 'end_use_heating',
                    color: "DarkRed",
                    portfolio_id: ""
                },
                {
                    end_use_name: 'end_use_AC',
                    color: "RoyalBlue",
                    portfolio_id: ""
                },
                {
                    end_use_name: 'end_use_ventilation',
                    color: "LightGray",
                    portfolio_id: ""
                },
                {
                    end_use_name: 'end_use_lighting',
                    color: "GreenYellow",
                    portfolio_id: ""
                },
                {
                    end_use_name: 'end_use_aux',
                    color: "Gray",
                    portfolio_id: ""
                },
                {
                    end_use_name: 'end_use_ecs',
                    color: "IndianRed",
                    portfolio_id: ""
                },
                {
                    end_use_name: 'end_use_specific',
                    color: "MediumPurple",
                    portfolio_id: ""
                },

            ];

        _.each(data, function(item) {
            EndUse.insert( item );
        });

        console.log('created endUse!');

    };

    if(Actions.find().count() === 0) {
        var data = [
                {
                    "name": "Robinet thermostatique",
                    "logo": "/icon/actionIcons/iconmonstr-volume-control-2-icon-256.png",
                    "impact_assessment_fluids": [
                        {
                          "opportunity": "end_use_heating",
                          "per_cent": "5"
                        }
                    ],
                    "project_type": "NA",
                    "technical_field": "heat_production",
                    "feasable_while_occupied": "no",
                    "priority": "high",
                    "impact_assessment_general": {
                        "comfort": "NA",
                        "technical_compliance_a": "NA",
                        "regulatory_compliance": "NA",
                        "residual_lifetime": "no"
                    },
                    "design_duration": 3,
                    "works_duration": 2,
                    "action_lifetime": 15,
                    "investment": {
                        "ratio": "5"
                    },
                    "operating": {
                        "ratio": "0.5"
                    },
                    "raw_roi": 0,
                    "actualised_roi": 0,
                    "value_analysis": 0,
                    "lec": 0,
                    "internal_return": 0,
                    "action_type": "generic"
                },
                {
                    "name": "Désembouage des réseaux",
                    "logo":"/icon/actionIcons/iconmonstr-loading-14-icon-256.png",
                    "impact_assessment_fluids": [
                        {
                          "opportunity": "end_use_heating",
                          "per_cent": "1"
                        }
                    ],
                    "project_type": "cr",
                    "technical_field": "thermal_delivery",
                    "feasable_while_occupied": "yes",
                    "priority": "high",
                    "impact_assessment_general": {
                        "comfort": "NA",
                        "technical_compliance_a": "NA",
                        "regulatory_compliance": "no",
                        "residual_lifetime": "NA"
                    },
                    "design_duration": 1,
                    "works_duration": 1,
                    "action_lifetime": 3,
                    "investment": {
                        "cost":"3000"
                    },
                    "raw_roi": 0,
                    "actualised_roi": 0,
                    "value_analysis": 0,
                    "lec": 0,
                    "internal_return": 0,
                    "action_type": "generic"
                },

            ];

        _.each(data, function(item) {
            Actions.insert( item );
        });

        // console.log('created endUse!');

    };


  if (Lists.find().count() === 0) {
    var data = [
      {name: "Meteor Principles",
       items: ["Data on the Wire",
         "One Language",
         "Database Everywhere",
         "Latency Compensation",
         "Full Stack Reactivity",
         "Embrace the Ecosystem",
         "Simplicity Equals Productivity"
       ]
      },
      {name: "Languages",
       items: ["Lisp",
         "C",
         "C++",
         "Python",
         "Ruby",
         "JavaScript",
         "Scala",
         "Erlang",
         "6502 Assembly"
         ]
      },
      {name: "Favorite Scientists",
       items: ["Ada Lovelace",
         "Grace Hopper",
         "Marie Curie",
         "Carl Friedrich Gauss",
         "Nikola Tesla",
         "Claude Shannon"
       ]
      }
    ];

    var timestamp = (new Date()).getTime();
    _.each(data, function(list) {
      var list_id = Lists.insert({name: list.name,
        incompleteCount: list.items.length});

      _.each(list.items, function(text) {
        Todos.insert({listId: list_id,
                      text: text,
                      createdAt: new Date(timestamp)});
        timestamp += 1; // ensure unique timestamp.
      });
    });
  }
});
