const mongoose= require('mongoose')

//creating schema for tickets
const tickets = mongoose.Schema ({ 
    name :{type:String},
    description :{type:String},
    assignedTo :{type:String},
    type :{type:String},
    status:{type:String,default:"to-do"}
    
})

//creating schema for sprints
const sprints = mongoose.Schema ({ 
    _id : mongoose.Schema.Types.ObjectId,
    projectId:{type:String},
    createdBy:{type:String},
    active :{type:String,default:"no"},
    completed :{type:String,default:"no"},
    tickets: [tickets]
})

module.exports=mongoose.model('Sprints',sprints)
