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
        toEnglish: function(itemToTranslate){
            // var endUses = EndUse.find().fetch()
            // var endUsesWithBothLang =  _.map(endUses, function(item){
            //     return { en: item.end_use_name, fr: TAPi18n.__(item.end_use_name, null, 'fr' ) }
            // });
            // console.log(endUsesWithBothLang);

            return TAPi18n.__(itemToTranslate, null, 'fr' );

            //@BSE ICI

            // console.log( TAPi18n.__("Faisabilité site occupé", null, { lng: 'en' } ) );
            // console.log( TAPi18n.__("lead_disconnector", null, 'fr' ) );
            // console.log( TAPi18n.__("Conformité technique", 'en' ) );
        },

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


  // Fixtures : inserting some data at startup, if MongoDB is empty

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
            portfolio_collection:["3tdkJMaCWcuHLotJw"],
            estate_properties:{
                endUseList: ["end_use_heating", "end_use_AC", "end_use_ventilation", "end_use_lighting", "end_use_aux", "end_use_ecs", "end_use_specific"]
            }
        };
        var estate_id = Estates.insert(tmpConfig);
        console.log('inserted estate 77, ' + estate_id);
        var estateCfg = tmpMasterConfig;
        estateCfg.master = false;
        estateCfg.creation_date = new Date();
        estateCfg.estate_id = estate_id;
        estateCfg.fluids = [
              {
                "fluid_type": "fluid_heat",
                "fluid_provider": "EDF",
                "yearly_values": [
                  {
                    "year": 2014,
                    "cost": 10,
                    "evolution_index": 0
                  },
                  {
                    "year": 2015,
                    "cost": 10,
                    "evolution_index": 0
                  },
                  {
                    "year": 2016,
                    "cost": 10.1,
                    "evolution_index": 1
                  },
                  {
                    "year": 2017,
                    "cost": 10.1,
                    "evolution_index": 0
                  },
                  {
                    "year": 2018,
                    "cost": 10.1,
                    "evolution_index": 0
                  },
                  {
                    "year": 2019,
                    "cost": 10.1,
                    "evolution_index": 0
                  },
                  {
                    "year": 2020,
                    "cost": 10.2,
                    "evolution_index": 0.99
                  },
                  {
                    "year": 2021,
                    "cost": 10.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2022,
                    "cost": 10.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2023,
                    "cost": 10.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2024,
                    "cost": 10.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2025,
                    "cost": 10.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2026,
                    "cost": 10.3,
                    "evolution_index": 0.98
                  },
                  {
                    "year": 2027,
                    "cost": 10.3,
                    "evolution_index": 0
                  },
                  {
                    "year": 2028,
                    "cost": 10.3,
                    "evolution_index": 0
                  },
                  {
                    "year": 2029,
                    "cost": 10.3,
                    "evolution_index": 0
                  },
                  {
                    "year": 2030,
                    "cost": 10.3,
                    "evolution_index": 0
                  },
                  {
                    "year": 2031,
                    "cost": 10.3,
                    "evolution_index": 0
                  },
                  {
                    "year": 2032,
                    "cost": 10.4,
                    "evolution_index": 0.971
                  },
                  {
                    "year": 2033,
                    "cost": 10.4,
                    "evolution_index": 0
                  },
                  {
                    "year": 2034,
                    "cost": 10.4,
                    "evolution_index": 0
                  },
                  {
                    "year": 2035,
                    "cost": 10.4,
                    "evolution_index": 0
                  },
                  {
                    "year": 2036,
                    "cost": 10.4,
                    "evolution_index": 0
                  },
                  {
                    "year": 2037,
                    "cost": 10.5,
                    "evolution_index": 0.962
                  },
                  {
                    "year": 2038,
                    "cost": 10.5,
                    "evolution_index": 0
                  },
                  {
                    "year": 2039,
                    "cost": 10.5,
                    "evolution_index": 0
                  },
                  {
                    "year": 2040,
                    "cost": 10.5,
                    "evolution_index": 0
                  },
                  {
                    "year": 2041,
                    "cost": 10.5,
                    "evolution_index": 0
                  },
                  {
                    "year": 2042,
                    "cost": 10.5,
                    "evolution_index": 0
                  },
                  {
                    "year": 2043,
                    "cost": 10.5,
                    "evolution_index": 0
                  },
                  {
                    "year": 2044,
                    "cost": 10.5,
                    "evolution_index": 0
                  }
                ],
                "global_evolution_index": 5
              },
              {
                "fluid_type": "fluid_water",
                "fluid_provider": "Lyonnaise des Eaux",
                "yearly_values": [
                  {
                    "year": 2014,
                    "cost": 20,
                    "evolution_index": 0
                  },
                  {
                    "year": 2015,
                    "cost": 20,
                    "evolution_index": 0
                  },
                  {
                    "year": 2016,
                    "cost": 20.1,
                    "evolution_index": 0.5
                  },
                  {
                    "year": 2017,
                    "cost": 20.1,
                    "evolution_index": 0
                  },
                  {
                    "year": 2018,
                    "cost": 20.1,
                    "evolution_index": 0
                  },
                  {
                    "year": 2019,
                    "cost": 20.1,
                    "evolution_index": 0
                  },
                  {
                    "year": 2020,
                    "cost": 20.1,
                    "evolution_index": 0
                  },
                  {
                    "year": 2021,
                    "cost": 20.2,
                    "evolution_index": 0.498
                  },
                  {
                    "year": 2022,
                    "cost": 20.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2023,
                    "cost": 20.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2024,
                    "cost": 20.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2025,
                    "cost": 20.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2026,
                    "cost": 20.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2027,
                    "cost": 20.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2028,
                    "cost": 20.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2029,
                    "cost": 20.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2030,
                    "cost": 20.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2031,
                    "cost": 20.3,
                    "evolution_index": 0.495
                  },
                  {
                    "year": 2032,
                    "cost": 20.3,
                    "evolution_index": 0
                  },
                  {
                    "year": 2033,
                    "cost": 20.3,
                    "evolution_index": 0
                  },
                  {
                    "year": 2034,
                    "cost": 20.3,
                    "evolution_index": 0
                  },
                  {
                    "year": 2035,
                    "cost": 20.3,
                    "evolution_index": 0
                  },
                  {
                    "year": 2036,
                    "cost": 20.3,
                    "evolution_index": 0
                  },
                  {
                    "year": 2037,
                    "cost": 20.3,
                    "evolution_index": 0
                  },
                  {
                    "year": 2038,
                    "cost": 20.3,
                    "evolution_index": 0
                  },
                  {
                    "year": 2039,
                    "cost": 20.3,
                    "evolution_index": 0
                  },
                  {
                    "year": 2040,
                    "cost": 20.3,
                    "evolution_index": 0
                  },
                  {
                    "year": 2041,
                    "cost": 20.3,
                    "evolution_index": 0
                  },
                  {
                    "year": 2042,
                    "cost": 20.3,
                    "evolution_index": 0
                  },
                  {
                    "year": 2043,
                    "cost": 20.3,
                    "evolution_index": 0
                  },
                  {
                    "year": 2044,
                    "cost": 20.3,
                    "evolution_index": 0
                  }
                ],
                "global_evolution_index": 1.5
              },
              {
                "fluid_type": "fluid_electricity",
                "fluid_provider": "EDF",
                "yearly_values": [
                  {
                    "year": 2014,
                    "cost": 30,
                    "evolution_index": 0
                  },
                  {
                    "year": 2015,
                    "cost": 30,
                    "evolution_index": 0
                  },
                  {
                    "year": 2016,
                    "cost": 30,
                    "evolution_index": 0
                  },
                  {
                    "year": 2017,
                    "cost": 30,
                    "evolution_index": 0
                  },
                  {
                    "year": 2018,
                    "cost": 30,
                    "evolution_index": 0
                  },
                  {
                    "year": 2019,
                    "cost": 30,
                    "evolution_index": 0
                  },
                  {
                    "year": 2020,
                    "cost": 30,
                    "evolution_index": 0
                  },
                  {
                    "year": 2021,
                    "cost": 30,
                    "evolution_index": 0
                  },
                  {
                    "year": 2022,
                    "cost": 30,
                    "evolution_index": 0
                  },
                  {
                    "year": 2023,
                    "cost": 30,
                    "evolution_index": 0
                  },
                  {
                    "year": 2024,
                    "cost": 30,
                    "evolution_index": 0
                  },
                  {
                    "year": 2025,
                    "cost": 30,
                    "evolution_index": 0
                  },
                  {
                    "year": 2026,
                    "cost": 30.1,
                    "evolution_index": 0.333
                  },
                  {
                    "year": 2027,
                    "cost": 30.1,
                    "evolution_index": 0
                  },
                  {
                    "year": 2028,
                    "cost": 30.1,
                    "evolution_index": 0
                  },
                  {
                    "year": 2029,
                    "cost": 30.1,
                    "evolution_index": 0
                  },
                  {
                    "year": 2030,
                    "cost": 30.1,
                    "evolution_index": 0
                  },
                  {
                    "year": 2031,
                    "cost": 30.1,
                    "evolution_index": 0
                  },
                  {
                    "year": 2032,
                    "cost": 30.1,
                    "evolution_index": 0
                  },
                  {
                    "year": 2033,
                    "cost": 30.1,
                    "evolution_index": 0
                  },
                  {
                    "year": 2034,
                    "cost": 30.1,
                    "evolution_index": 0
                  },
                  {
                    "year": 2035,
                    "cost": 30.1,
                    "evolution_index": 0
                  },
                  {
                    "year": 2036,
                    "cost": 30.1,
                    "evolution_index": 0
                  },
                  {
                    "year": 2037,
                    "cost": 30.1,
                    "evolution_index": 0
                  },
                  {
                    "year": 2038,
                    "cost": 30.1,
                    "evolution_index": 0
                  },
                  {
                    "year": 2039,
                    "cost": 30.1,
                    "evolution_index": 0
                  },
                  {
                    "year": 2040,
                    "cost": 30.2,
                    "evolution_index": 0.332
                  },
                  {
                    "year": 2041,
                    "cost": 30.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2042,
                    "cost": 30,
                    "evolution_index": -0.662
                  },
                  {
                    "year": 2043,
                    "cost": 31,
                    "evolution_index": 3.333
                  },
                  {
                    "year": 2044,
                    "cost": 31,
                    "evolution_index": 0
                  }
                ],
                "global_evolution_index": 3.333
              },
              {
                "fluid_type": "fluid_heat",
                "fluid_provider": "Poweo",
                "yearly_values": [
                  {
                    "year": 2014,
                    "cost": 12,
                    "evolution_index": 0
                  },
                  {
                    "year": 2015,
                    "cost": 12,
                    "evolution_index": 0
                  },
                  {
                    "year": 2016,
                    "cost": 12.1,
                    "evolution_index": 0.833
                  },
                  {
                    "year": 2017,
                    "cost": 12.1,
                    "evolution_index": 0
                  },
                  {
                    "year": 2018,
                    "cost": 12.1,
                    "evolution_index": 0
                  },
                  {
                    "year": 2019,
                    "cost": 12.1,
                    "evolution_index": 0
                  },
                  {
                    "year": 2020,
                    "cost": 12.1,
                    "evolution_index": 0
                  },
                  {
                    "year": 2021,
                    "cost": 12.1,
                    "evolution_index": 0
                  },
                  {
                    "year": 2022,
                    "cost": 12.1,
                    "evolution_index": 0
                  },
                  {
                    "year": 2023,
                    "cost": 12.1,
                    "evolution_index": 0
                  },
                  {
                    "year": 2024,
                    "cost": 12.2,
                    "evolution_index": 0.826
                  },
                  {
                    "year": 2025,
                    "cost": 12.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2026,
                    "cost": 12.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2027,
                    "cost": 12.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2028,
                    "cost": 12.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2029,
                    "cost": 12.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2030,
                    "cost": 12.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2031,
                    "cost": 12.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2032,
                    "cost": 12.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2033,
                    "cost": 12.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2034,
                    "cost": 12.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2035,
                    "cost": 12.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2036,
                    "cost": 12.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2037,
                    "cost": 12.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2038,
                    "cost": 12.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2039,
                    "cost": 12.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2040,
                    "cost": 12.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2041,
                    "cost": 12.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2042,
                    "cost": 12.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2043,
                    "cost": 12.2,
                    "evolution_index": 0
                  },
                  {
                    "year": 2044,
                    "cost": 12.2,
                    "evolution_index": 0
                  }
                ],
                "global_evolution_index": 1.667
              }
            ];
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
                {
                    name: 'certifications',
                    labels: ["nf_hqe", "breeam", "us_leed", "effinergie", "bepos2013"]
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

    // get all pictos from 'foliom-picto' font
    var foliomPictoSelection = Assets.getText('foliom-picto-selection.json');
    var foliomPictoSelectionJson = EJSON.parse(foliomPictoSelection);

    var actionLogo = _.map(foliomPictoSelectionJson.icons, function(item){
      return "&#" + item.properties.code + ";" ;
    });
    // console.log("actionLogo is: ");
    // console.log(actionLogo);

    var actionLogoObject = {
                      name: 'action_logo',
                      labels: actionLogo
                  };
    Selectors.upsert({name: 'action_logo'}, {$set: actionLogoObject});


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

    if(Portfolios.find().count() === 0) {
        var data = [
            {
              "_id": "3tdkJMaCWcuHLotJw",
              "name": "Porfolio 1",
              "address": {
                "street": "1 rue des Pyrénées",
                "zip": 75020,
                "city": "Paris",
                "country": "France"
              }
            }
        ];
        _.each(data, function(item) {
            Portfolios.insert( item );
        });
    }
    if(Buildings.find().count() === 0) {
        var data = [
            {
              "_id": "25bQcnwe2RZHdjsu5",
              "building_name": "Bâtiment Test",
              "address": {
                "street": "1 rue des Prairies",
                "zip": 75020,
                "city": "Paris",
                "country": "France",
                "gps_lat": "48.8610739",
                "gps_long": "2.4048792999999478"
              },
              "building_info": {
                "construction_year": 1990,
                "building_control": "control_shared",
                "building_user": "own_use",
                "area_total": 1000,
                "area_useful": 990,
                "building_nb_floors": 1,
                "carpark_spaces": 0,
                "carpark_area": 0
              },
              "portfolio_id": "3tdkJMaCWcuHLotJw"
            }
        ];
        _.each(data, function(item) {
            Buildings.insert( item );
        });
    }
    if(Leases.find().count() === 0) {
        var data = [
          {
            "_id": "xPxb47pbPSZm2trcE",
            "lease_name": "Lease1Test",
            "rental_status": "rented",
            "rent": 67,
            "last_significant_renovation": 1999,
            "lease_usage": "office",
            "area_by_usage": 700,
            "lease_nb_floors": 1,
            "igh": "no",
            "erp_status": "erp_L",
            "erp_category": "erp_1",
            "dpe_energy_consuption": {
              "grade": "dpe_A",
              "value": 42
            },
            "dpe_co2_emission": {
              "grade": "dpe_A",
              "value": 5
            },
            "fluid_consumption_meter": [
              {
                "fluid_id": "EDF - fluid_heat",
                "yearly_subscription": 11,
                "first_year_value": 43,
                "yearly_cost": 441
              },
              {
                "fluid_id": "Lyonnaise des Eaux - fluid_water",
                "yearly_subscription": 43,
                "first_year_value": 17,
                "yearly_cost": 383
              },
              {
                "fluid_id": "EDF - fluid_electricity",
                "yearly_subscription": 17,
                "first_year_value": 24,
                "yearly_cost": 737
              },
              {
                "fluid_id": "Poweo - fluid_heat",
                "yearly_subscription": 14,
                "first_year_value": 31,
                "yearly_cost": 386
              }
            ],
            "consumption_by_end_use": [
              {
                "end_use_name": "end_use_heating",
                "fluid_id": "EDF - fluid_heat",
                "first_year_value": 12
              },
              {
                "end_use_name": "end_use_AC",
                "fluid_id": "EDF - fluid_electricity",
                "first_year_value": 7
              },
              {
                "end_use_name": "end_use_ventilation",
                "fluid_id": "EDF - fluid_electricity",
                "first_year_value": 4
              },
              {
                "end_use_name": "end_use_lighting",
                "fluid_id": "EDF - fluid_electricity",
                "first_year_value": 18
              },
              {
                "end_use_name": "end_use_aux",
                "fluid_id": "EDF - fluid_electricity",
                "first_year_value": 9
              },
              {
                "end_use_name": "end_use_ecs",
                "fluid_id": "Poweo - fluid_heat",
                "first_year_value": 14
              },
              {
                "end_use_name": "end_use_specific",
                "fluid_id": "EDF - fluid_electricity",
                "first_year_value": 34
              }
            ],
            "consumption_by_end_use_total": 98,
            "comfort_qualitative_assessment": {
              "acoustic": "good",
              "visual": "average",
              "thermic": "bad",
              "global_comfort_index": 0.22
            },
            "technical_compliance": {
              "categories": [
                {
                  "name": "core_and_shell",
                  "lifetime": "good_dvr",
                  "conformity": "compliant"
                },
                {
                  "name": "facade",
                  "lifetime": "average_dvr",
                  "conformity": "compliant"
                },
                {
                  "name": "roof_terrasse",
                  "lifetime": "average_dvr",
                  "conformity": "compliant"
                },
                {
                  "name": "heat_production",
                  "lifetime": "new_dvr",
                  "conformity": "not_compliant_minor"
                },
                {
                  "name": "chiller",
                  "lifetime": "average_dvr",
                  "conformity": "compliant"
                },
                {
                  "name": "power_supply",
                  "lifetime": "bad_dvr",
                  "conformity": "compliant"
                },
                {
                  "name": "electrical_delivery",
                  "lifetime": "bad_dvr",
                  "conformity": "compliant"
                },
                {
                  "name": "thermal_delivery",
                  "lifetime": "new_dvr",
                  "conformity": "not_compliant_minor"
                },
                {
                  "name": "heating_terminal",
                  "lifetime": "new_dvr",
                  "conformity": "not_compliant_minor"
                },
                {
                  "name": "chiller_terminal",
                  "lifetime": "bad_dvr",
                  "conformity": "not_compliant_major"
                },
                {
                  "name": "lighting_terminal",
                  "lifetime": "new_dvr",
                  "conformity": "not_compliant_major"
                },
                {
                  "name": "GTC/GTB",
                  "lifetime": "average_dvr",
                  "conformity": "not_compliant_minor"
                },
                {
                  "name": "air_system",
                  "lifetime": "good_dvr",
                  "conformity": "not_compliant_major"
                },
                {
                  "name": "ventilation_system",
                  "lifetime": "bad_dvr",
                  "conformity": "not_compliant_major"
                },
                {
                  "name": "hot_water_production",
                  "lifetime": "bad_dvr",
                  "conformity": "not_compliant_major"
                },
                {
                  "name": "hot_water_delivery",
                  "lifetime": "good_dvr",
                  "conformity": "not_compliant_major"
                },
                {
                  "name": "fire_security",
                  "lifetime": "bad_dvr",
                  "conformity": "not_compliant_major"
                }
              ],
              "global_lifetime": 0,
              "global_conformity": 0
            },

            "building_id": "25bQcnwe2RZHdjsu5"
          },
          {
            "_id": "t9myg9avS3Ny3k3st",
            "lease_name": "Lease2Test",
            "rental_status": "rented",
            "rent": 67,
            "last_significant_renovation": 1999,
            "lease_usage": "office",
            "area_by_usage": 290,
            "lease_nb_floors": 1,
            "igh": "no",
            "erp_status": "erp_L",
            "erp_category": "erp_1",
            "dpe_energy_consuption": {
              "grade": "dpe_B",
              "value": 70
            },
            "dpe_co2_emission": {
              "grade": "dpe_B",
              "value": 8
            },
            "fluid_consumption_meter": [
              {
                "fluid_id": "EDF - fluid_heat",
                "yearly_subscription": 50,
                "first_year_value": 60,
                "yearly_cost": 650
              },
              {
                "fluid_id": "Lyonnaise des Eaux - fluid_water",
                "yearly_subscription": 31,
                "first_year_value": 74,
                "yearly_cost": 1151
              },
              {
                "fluid_id": "EDF - fluid_electricity",
                "yearly_subscription": 50,
                "first_year_value": 61,
                "yearly_cost": 1180
              },
              {
                "fluid_id": "Poweo - fluid_heat",
                "yearly_subscription": 57,
                "first_year_value": 49,
                "yearly_cost": 645
              }
            ],
            "consumption_by_end_use": [
              {
                "end_use_name": "end_use_heating",
                "fluid_id": "EDF - fluid_electricity",
                "first_year_value": 30
              },
              {
                "end_use_name": "end_use_AC",
                "fluid_id": "EDF - fluid_electricity",
                "first_year_value": 14
              },
              {
                "end_use_name": "end_use_ventilation",
                "fluid_id": "EDF - fluid_electricity",
                "first_year_value": 14
              },
              {
                "end_use_name": "end_use_lighting",
                "fluid_id": "EDF - fluid_electricity",
                "first_year_value": 22
              },
              {
                "end_use_name": "end_use_aux",
                "fluid_id": "EDF - fluid_electricity",
                "first_year_value": 5
              },
              {
                "end_use_name": "end_use_ecs",
                "fluid_id": "Poweo - fluid_heat",
                "first_year_value": 24
              },
              {
                "end_use_name": "end_use_specific",
                "fluid_id": "EDF - fluid_electricity",
                "first_year_value": 61
              }
            ],
            "consumption_by_end_use_total": 170,
            "comfort_qualitative_assessment": {
              "acoustic": "good",
              "visual": "average",
              "thermic": "bad",
              "global_comfort_index": 0.22
            },
            "technical_compliance": {
              "categories": [
                {
                  "name": "core_and_shell",
                  "lifetime": "good_dvr",
                  "conformity": "compliant"
                },
                {
                  "name": "facade",
                  "lifetime": "average_dvr",
                  "conformity": "compliant"
                },
                {
                  "name": "roof_terrasse",
                  "lifetime": "average_dvr",
                  "conformity": "compliant"
                },
                {
                  "name": "heat_production",
                  "lifetime": "new_dvr",
                  "conformity": "not_compliant_minor"
                },
                {
                  "name": "chiller",
                  "lifetime": "average_dvr",
                  "conformity": "compliant"
                },
                {
                  "name": "power_supply",
                  "lifetime": "bad_dvr",
                  "conformity": "compliant"
                },
                {
                  "name": "electrical_delivery",
                  "lifetime": "bad_dvr",
                  "conformity": "compliant"
                },
                {
                  "name": "thermal_delivery",
                  "lifetime": "new_dvr",
                  "conformity": "not_compliant_minor"
                },
                {
                  "name": "heating_terminal",
                  "lifetime": "new_dvr",
                  "conformity": "not_compliant_minor"
                },
                {
                  "name": "chiller_terminal",
                  "lifetime": "bad_dvr",
                  "conformity": "not_compliant_major"
                },
                {
                  "name": "lighting_terminal",
                  "lifetime": "new_dvr",
                  "conformity": "not_compliant_major"
                },
                {
                  "name": "GTC/GTB",
                  "lifetime": "average_dvr",
                  "conformity": "not_compliant_minor"
                },
                {
                  "name": "air_system",
                  "lifetime": "good_dvr",
                  "conformity": "not_compliant_major"
                },
                {
                  "name": "ventilation_system",
                  "lifetime": "bad_dvr",
                  "conformity": "not_compliant_major"
                },
                {
                  "name": "hot_water_production",
                  "lifetime": "bad_dvr",
                  "conformity": "not_compliant_major"
                },
                {
                  "name": "hot_water_delivery",
                  "lifetime": "good_dvr",
                  "conformity": "not_compliant_major"
                },
                {
                  "name": "fire_security",
                  "lifetime": "bad_dvr",
                  "conformity": "not_compliant_major"
                }
              ],
              "global_lifetime": 0,
              "global_conformity": 0
            },
            "building_id": "25bQcnwe2RZHdjsu5"
          }
        ];
        _.each(data, function(item) {
            Leases.insert( item );
        });
    }

    if(Actions.find().count() === 0) {
        var data = [
                {
                    "name": "Robinet thermostatique",
                    "logo": "&#58972;",
                    "gain_fluids_kwhef": [
                      {
                        "opportunity": "end_use_heating",
                        "per_cent": 5
                      }
                    ],
                    "gain_fluids_water" : [
                      {
                        "opportunity" : "fluid_water",
                        "per_cent" : 0
                      }
                    ],
                    "project_type": "NA",
                    "technical_field": "heat_production",
                    "feasable_while_occupied": "no",
                    "priority": "high",
                    "other_gains": {
                        // "comfort": [],
                        "technical_compliance_a": "NA",
                        "regulatory_compliance": "no",
                        "residual_lifetime": "no"
                    },
                    "design_duration": 3,
                    "works_duration": 2,
                    "action_lifetime": 15,
                    "investment": {
                        "ratio": 5
                    },
                    "gain_operating": {
                        "ratio": 0.5
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
                    "logo":"&#58947;",
                    "gain_fluids_kwhef": [
                      {
                        "opportunity": "end_use_heating",
                        "per_cent": 1
                      }
                    ],
                    "gain_fluids_water" : [
                      {
                        "opportunity" : "fluid_water",
                        "per_cent" : 0
                      }
                    ],
                    "project_type": "cr",
                    "technical_field": "thermal_delivery",
                    "feasable_while_occupied": "yes",
                    "priority": "high",
                    "other_gains": {
                        // "comfort": [""],
                        "technical_compliance_a": "NA",
                        "regulatory_compliance": "no",
                        "residual_lifetime": "no"
                    },
                    "design_duration": 1,
                    "works_duration": 1,
                    "action_lifetime": 3,
                    "investment": {
                        "ratio": 2
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

    }
});
