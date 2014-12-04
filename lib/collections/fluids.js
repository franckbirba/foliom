 // estate_id : Estate ref
 //     fluid_type : Selector // sélecteur modifiable
 //     fluid_provider : Selector // idem

 //     yearly_values : [
 //        { year : Number,
 //         cost : Number,
 //         evolution_index : Number } ]
 //     global_evolution_index : Number

Fluids = new Mongo.Collection("fluids");

YearlyValues = new SimpleSchema({
    year: {
        type: Number,
        defaultValue: function(){
            return Number(new Date().getFullYear()) + Number(this.name.split('.')[1]);
        }
    },
    cost: {
        type: Number,
        defaultValue: 0
    },
    evolution_index: {
        type: Number,
        defaultValue: 0
    }
});

Fluids.attachSchema(new SimpleSchema({
    estate_id: {
        type: String,
        autoform: {
            omit:true
        }
    },
    fluid_type: {
        type: String,
        autoform: {
            type: "select",
            options: function () {
                return getSelectors('fluid_type');
            }
        }
    },
    fluid_provider: {
        type: String,
        autoform: {
            type: "select",
            options: function () {
                return getSelectors('fluid_provider');
            }
        }
    },
    yearly_values: {
        type: [YearlyValues],
        autoform: {
            minCount: 31,
            maxCount: 31,
        }
    },
    global_evolution_index: {
        type: Number
    },


}));
