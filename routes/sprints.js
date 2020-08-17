const express=require('express')
const router= express.Router();
const mongoose=require('mongoose')
const checkAuth=require('../authentication/check-auth')
const asyncHandler = require('express-async-handler')
const getEmail = require('../utils/decode')
const Projects=require('../models/projects')
const Sprints=require('../models/sprints')

//Router to create sprints for a project
router.patch('/:projectId',checkAuth,asyncHandler(async(req,res,next)=>{

    var projectId= req.params.projectId;
    var email= getEmail(req.headers);
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
                    throw new Error("Assign to a registered user")
                }}
        }
       
        const sprints = new Sprints({
            _id: mongoose.Types.ObjectId(),
            createdBy:email,
            projectId:projectId,
            "tickets":[updateOps]
        })
        
        await sprints.save();

          res.status(200).json({ 
          message: "Tickets saved to the project",
          createdTopic: {
            tickets: updateOps
        }
        });
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({error: err.message});
    }
  
}))

//Router to make a sprint active
router.patch('/active/:sprintId',checkAuth,asyncHandler(async(req,res,next)=>{

    const sprintId = req.params.sprintId;
    const active = req.body.active;
    try{
        const sprint = await Sprints.findById({_id:sprintId});
        var projects=await Sprints.find({projectId:sprint.projectId});
        var result= projects.filter(project=>project.active=="yes");
        if(result.length>=1)
        {
            throw new Error("There is already one active sprint");
        }
        else
        {
            sprint.active=active;
            await sprint.save();
        }
        res.status(201).json({
            message: "Status of the sprint is changed"
            })
        }
        catch(err)
        {
            res.status(500).json({error: err.message});
        }


}))

//Router to create tickets for a sprint
router.patch('/tickets/:sprintId',checkAuth,asyncHandler(async(req,res,next)=>{

    var sprintId= req.params.sprintId;
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
                    throw new Error("Assign to a registered user")
                }}
        }
        
         await Sprints.updateOne({_id:sprintId},
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
    catch(err)
    {
        console.log(err);
        res.status(500).json({error: err.message});
    }
  
}))


//Router to update the status of a ticket
router.patch('/:sprintId/:ticketId',checkAuth, asyncHandler(async(req,res,next)=>{

    const sprintId = req.params.sprintId;
    const ticketId = req.params.ticketId;
    const status = req.body.status;
    try{
        const sprint = await Sprints.findById({_id:sprintId});
        const ticket = sprint.tickets.id(ticketId);
        ticket.status=status;
        await sprint.save();
        res.status(200).json({message:"Status updated"});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({error:err});
    }
}))

router.patch('/status/status/:sprintId',checkAuth, asyncHandler(async(req,res,next)=>{

      const sprintId = req.params.sprintId;
     
      const completed = req.body.completed;
     try{
         const sprint = await Sprints.findById({_id:sprintId});
         const projects = await Sprints.find({projectId:sprint.projectId});
         const tickets={};
         var result= sprint.tickets.filter(ticket=>ticket.status!="Closed");
         result.splice(0,result.length);
         result1= projects.filter(project=>project.completed=="no");
         
         if(result1.length>=1)
         {
            for(var i =0;i<result.length;i++)
            {
               tickets.status=result[i].status;
               tickets._id=result[i]._id;
               tickets.name=result[i].name;
               tickets.description=result[i].description;
               tickets.assignedTo=result[i].assignedTo;
               tickets.type=result[i].type;
               result1[0].tickets.push(tickets);
               
            }
            sprint.completed=completed
         }
         else
         {
             throw new Error("No active sprints")
         }
        
          await sprint.save();
         res.status(200).json({message:"Completed the sprint"});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({error:err});
    }
}))


module.exports=router;