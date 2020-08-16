const express=require('express')
const router= express.Router();
const mongoose=require('mongoose')
const checkAuth=require('../authentication/check-auth')
const asyncHandler = require('express-async-handler')
const Projects=require('../models/projects')
const getEmail = require('../utils/decode')

// Router to create a project
router.post('/',checkAuth,asyncHandler(async(req,res,next)=>{

    var email= getEmail(req.headers);

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
            res.status(500).json({error: err});
        }
}))


//Router to accept the invitation of a particular project
router.post('/accept/:projectId',checkAuth,asyncHandler(async(req,res,next)=>
{
    var email= getEmail(req.headers);
    try{
    const projectId = req.params.projectId;
    const project = await Projects.findById({_id:projectId});
    const projects = new Projects({
        _id: projectId,
        email : email,
        name : project.name
    })

    const result = await projects.save();
    res.status(201).json({
        message: "You can now view this project",
        AccessProjectTo: {
            name: result.name
        }
        })
    }
    catch(err)
    {
        res.status(500).json({error: err});
    }
}))

//Router to get all the projects of a particular user
router.get('/',asyncHandler(async(req,res,next)=>
{
    try{
    var email= getEmail(req.headers);
    const result = await Projects.find({email});
    res.status(200).json(result);
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({error:err});
    }
}))

module.exports=router;