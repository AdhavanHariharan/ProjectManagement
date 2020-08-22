const express=require('express')
const router= express.Router();
const mongoose=require('mongoose')
const checkAuth=require('../authentication/check-auth')
const asyncHandler = require('express-async-handler')
const Projects=require('../models/projects')
const getEmail = require('../utils/decode');
const { body } = require('express-validator');
const requsetBodyValidate=require('../authentication/requestBodyValidation')

// Router to create a project
router.post('/',
[
    body('name').notEmpty()
],
requsetBodyValidate,checkAuth,asyncHandler(async(req,res)=>{

    var decoded= getEmail(req.headers);
    var email = decoded.email;

    const projects = new Projects({
        _id: mongoose.Types.ObjectId(),
        email : email,
        name : req.body.name
    })
        try{
        const result = await projects.save();
        res.status(200).json({ message: "Project saved",
            createdTopic: {
                name: result.name,
                invite:`/projects/accept/${result._id}`
            }
            });
        }
        catch(err)
        {
            res.status(500).json({error: err.message});
        }
}))


//Router to accept the invitation of a particular project
router.patch('/accept/:projectId',checkAuth,asyncHandler(async(req,res)=>
{
    var decoded= getEmail(req.headers);
    var email = decoded.email;
    try{
    const projectId = req.params.projectId;
    const project = await Projects.findById({_id:projectId});

    if(project.email.includes(email))
    {
        throw new Error("You are already part of this project");
    }
    project.email.push(email);
    project.save();
   
    res.status(201).json({
        message: "You can now view this project",
        AccessProjectTo: {
            name: project.name
        }
        })
    }
    catch(err)
    {
        res.status(500).json({error: err.message});
    }
}))

//Router to get all the projects of a particular user
router.get('/',asyncHandler(async(req,res)=>
{
    try{
    var decoded= getEmail(req.headers);
    var email = decoded.email;
    const result = await Projects.find({email},{_id:0,email:0,__v:0});
    res.status(200).json(result);
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({error:err.message});
    }
}))

module.exports=router;