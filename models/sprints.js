const mongoose= require('mongoose')

//creating schema for sprints
const sprints = mongoose.Schema ({ 
    _id : mongoose.Schema.Types.ObjectId,
    name:{type:String},
    projectId:{type:String},
    createdBy:{type:String},
    active :{type:String,default:"no"},
    completed :{type:String,default:"no"},
    tickets: [String]
})

module.exports=mongoose.model('Sprints',sprints)
