const mongoose= require('mongoose')

//creating schema for tickets
const tickets = mongoose.Schema ({ 
    name :{type:String},
    description :{type:String},
    assignedTo :{type:String},
    type :{type:String},
    status:{type:String,default:"to-do"}
    
})

//creating schema for projects
const projects = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    email :{type:String},
    name: {type:String},
    tickets:[tickets]

})

module.exports=mongoose.model('Projects',projects)
