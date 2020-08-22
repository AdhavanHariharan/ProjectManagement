const mongoose= require('mongoose')

var permitted = ['To-do','In Progress','Done','Tested','Closed'];

//creating schema for tickets
const tickets = mongoose.Schema ({ 
    name :{type:String},
    projectId:{type:String},
    sprintId:{type:String},
    description :{type:String},
    assignedTo :{type:String},
    type :{type:String},
    status:{type:String,default:"To-do",enum:permitted}
    
})

module.exports=mongoose.model('Tickets',tickets)
