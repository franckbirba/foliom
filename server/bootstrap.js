// if the database is empty on server start, create some sample data.
Meteor.startup(function () {
	if (Meteor.users.find().count() === 0) {
		console.log("creating user test");
    Accounts.createUser({
			username: "test",
      email: "test@test.com",
      password: "test"
    });
	}
	if(Configurations.find().count() === 0) {
		var tmpConfig = {
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
		Configurations.insert(tmpConfig);
		console.log('created master configuration');
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
