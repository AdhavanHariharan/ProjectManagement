const express=require('express')
const router= express.Router();
const mongoose=require('mongoose')
const checkAuth=require('../authentication/check-auth')
const asyncHandler = require('express-async-handler')
const validUser = require('../authentication/validUser');
const getEmail = require('../utils/decode');
const Sprints=require('../models/sprints')
const Tickets=require('../models/tickets')

const { body } = require('express-validator');
const requsetBodyValidate=require('../authentication/requestBodyValidation')

//Router to create sprints for a project
router.patch('/:projectId',
[
    body('name').notEmpty()
],
requsetBodyValidate, checkAuth,validUser,asyncHandler(async(req,res)=>{

    var projectId= req.params.projectId;
    var decoded= getEmail(req.headers);
    var email = decoded.email;
    try{    
        const sprints = new Sprints({
            _id: mongoose.Types.ObjectId(),
            name:req.body.name,
            projectId:projectId,
            createdBy:email
        })

        await sprints.save();

        res.status(200).json({ 
          message: "Sprint added to the project",
          createdSprint: {
            tickets: sprints.name
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
router.patch('/active/:sprintId',checkAuth,asyncHandler(async(req,res)=>{

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

//Router to move tickets to an active sprint from a project
router.patch('/tickets/:ticketId',checkAuth,asyncHandler(async(req,res)=>{

    var ticketId= req.params.ticketId;
    
   
    try{

        const ticket= await Tickets.findOne({_id:ticketId});
        if(ticket.sprintId!=null)
        {   
            throw new Error(`This ticket has already been assigned to the sprint ${ticket.sprintId}`);
        }
        const projectId= ticket.projectId;
        const sprint= await Sprints.findOne({
            $and:[
                {
                    projectId:projectId
                },
                {
                    active:"yes"
                }
            ]
        });
   
        ticket.sprintId=sprint._id;
        ticket.save();

          res.status(200).json({ 
          message: "Tickets added to the sprint",
          createdTicket: {
            ticket: ticket.name,
            sprint: sprint.name
        }
        });
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({error: err.message});
    }
  
}))


//Router to get all the sprints 
router.get('/',asyncHandler(async(req,res)=>
{
    try{
    const result = await Sprints.find();
    res.status(200).json(result);
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({error:err.message});
    }
}))


//Router to move the tickets that are not closed to another sprint while completing a sprint
router.patch('/status/:sprintId',checkAuth, asyncHandler(async(req,res)=>{
    
      const sprintId = req.params.sprintId;
     
      const completed = req.body.completed;

     try{
         const sprint = await Tickets.find({sprintId});
         const sprint1 = await Sprints.findOne({_id:sprintId});

         const sprintsNotCompleted = await Sprints.find({$and:[{projectId:sprint1.projectId},{_id:{$ne:sprintId}},{completed:"no"}]});

         var tickets = sprint.filter( ticket=>{
             return ticket.status!="Closed"
            })

         if(sprintsNotCompleted.length<0)   
         {
            throw new Error("No sprints available for this project, hence the sprint cannot be completed")
         }
         else
         {
            await Sprints.update(
                { _id: sprintId }, 
                { $set:
                    {completed:completed, active:"no"}
                }
            )

           await Sprints.update(
                { _id: sprintsNotCompleted[0]._id }, 
                {$set:{active:"yes"}}
            )

            for(let i in tickets)
            {
            await Tickets.update(
                 {_id:tickets[i]._id},
                { $set:{sprintId: sprintsNotCompleted[0]._id} },
            )
            }
        }

         res.status(200).json({message:"Completed the sprint"});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({error:err});
    }
}))


module.exports=router;
