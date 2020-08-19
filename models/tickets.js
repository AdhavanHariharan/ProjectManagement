const mongoose= require('mongoose')

//creating schema for tickets
const tickets = mongoose.Schema ({ 
    name :{type:String},
    projectId:{type:String},
    description :{type:String},
    assignedTo :{type:String},
    type :{type:String},
    status:{type:String,default:"to-do"}
    
})

module.exports=mongoose.model('Tickets',tickets)
