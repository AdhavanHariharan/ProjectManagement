const express=require('express')
const bodyParser = require('body-parser')
const app=express();
const mongoose=require('mongoose')


//import routes
const userroutes=require('./routes/users')


//connecting database
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect('mongodb+srv://insent:'+process.env.MONGO_PW+
'@cluster0-0ycyo.mongodb.net/test?retryWrites=true&w=majority',(err)=>{
    if(err)
    {
        console.log("Error connecting database")
    }
    else{
        console.log("Database connected")
    }
    
})

//bodyparser
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//routing APIs
app.use('/user',userroutes)


module.exports=app;