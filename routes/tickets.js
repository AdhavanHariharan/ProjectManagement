const express=require('express')
const router= express.Router();
const checkAuth=require('../authentication/check-auth')
const asyncHandler = require('express-async-handler')
const Projects=require('../models/projects')

//Router to create tickets for a particular project
router.patch('/:projectId',checkAuth,asyncHandler(async(req,res,next)=>{

    const projectId = req.params.projectId;
    const updateOps={};

    try{
    for(const ops of req.body)
    {
        updateOps[ops.propName]=ops.value;
        if(ops.propName=='assignedTo')
        {
            const userName = await Projects.find({email:ops.value});
            if(!userName.length>=1)
            {
                throw new Error()
            }}
    }
        const updatedProject = await Projects.updateOne({_id:projectId},
        {
            $push:{
                tickets:[updateOps]
            }
        })
        res.status(200).json({ 
        message: "Tickets saved to the project",
        createdTopic: {
            tickets: updateOps
        }
        });
    }
    catch(err){
        res.status(500).json({error: "Assign to a registered user"});

    }
}))

//Router to update the status of a ticket
router.patch('/:projectId/:ticketId',checkAuth, asyncHandler(async(req,res,next)=>{

    const projectId = req.params.projectId;
    const ticketId = req.params.ticketId;
    const status = req.body.status;
    try{
        const project = await Projects.findById({_id:projectId});
        const ticket = project.tickets.id(ticketId);
        ticket.status=status;
        await project.save();
        res.status(200).json({message:"Status updated"});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({error:err});
    }
}))

//Router to get all the tickets of a particular project
router.get('/:projectId',asyncHandler(async(req,res,next)=>
{
    try{
    const result = await Projects.findById({_id:req.params.projectId});
    res.status(200).json(result.tickets);
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({error:err});
    }
}))


module.exports=router;