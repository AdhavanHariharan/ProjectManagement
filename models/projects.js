const mongoose= require('mongoose')

//creating schema for projects
const projects = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    email :[String],
    name: {type:String}

})

module.exports=mongoose.model('Projects',projects)
