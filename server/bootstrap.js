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
          MasterCfg.estate_id = estateId;
          Configurations.insert(MasterCfg);
          console.log(MasterCfg);
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
        	mailing_list: "eggre"
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
        delete estateCfg.master;
        estateCfg.estate_id = estate_id;
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
                    labels: ["EDF", "Poweo"],
                    portfolio_id: ""
                },
                {
                    name: 'lease_usage',
                    labels: ["office", "retail", "residential"],
                    portfolio_id: ""
                },

            ];

        _.each(tmpSelectorList, function(item) {
            Selectors.insert(
                    item
                    // estate_id: item.estate_id
                );

            // var list_id = Lists.insert({name: list.name,
            //     incompleteCount: list.items.length});

            // _.each(list.items, function(text) {
            //     Todos.insert({listId: list_id,
            //                   text: text,
            //                   createdAt: new Date(timestamp)});
            //     timestamp += 1; // ensure unique timestamp.
            //   });
        });

        console.log('created first Selector list - 2 items!');

    }

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
