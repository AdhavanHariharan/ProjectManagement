const express=require('express')
const router= express.Router();
const mongoose=require('mongoose')
const checkAuth=require('../authentication/check-auth')
const asyncHandler = require('express-async-handler')
const validUser = require('../authentication/validUser');
const getEmail = require('../utils/decode');
const Projects=require('../models/projects')
const Sprints=require('../models/sprints')
const Tickets=require('../models/tickets')


//Router to create sprints for a project
router.patch('/:projectId',checkAuth,validUser,asyncHandler(async(req,res,next)=>{

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
        
        const project = await Projects.findById({_id:projectId});
        project.sprints.push(sprints._id);
        project.save();

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

//Router to move tickets to an active sprint from a project
router.patch('/tickets/:ticketId',checkAuth,asyncHandler(async(req,res,next)=>{

    var ticketId= req.params.ticketId;
    
   
    try{

        const ticket= await Tickets.findOne({_id:ticketId});
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
        sprint.tickets.push(ticketId);
        sprint.save();
        ticket.sprintId=sprint._id;
        ticket.save();

          res.status(200).json({ 
          message: "Tickets moved to the sprint",
          createdTicket: {
            tickets: ticketId,
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

// router.patch('/status/status/:sprintId',checkAuth, asyncHandler(async(req,res,next)=>{

//       const sprintId = req.params.sprintId;
     
//       const completed = req.body.completed;
//      try{
//          const sprint = await Sprints.findById({_id:sprintId});
//          const projects = await Sprints.find({projectId:sprint.projectId});
//          const tickets={};
//          var result= sprint.tickets.filter(ticket=>ticket.status!="Closed");
//          result.splice(0,result.length);
//          result1= projects.filter(project=>project.completed=="no");
         
//          if(result1.length>=1)
//          {
//             for(var i =0;i<result.length;i++)
//             {
//                tickets.status=result[i].status;
//                tickets._id=result[i]._id;
//                tickets.name=result[i].name;
//                tickets.description=result[i].description;
//                tickets.assignedTo=result[i].assignedTo;
//                tickets.type=result[i].type;
//                result1[0].tickets.push(tickets);
               
//             }
//             sprint.completed=completed
//          }
//          else
//          {
//              throw new Error("No active sprints")
//          }
        
//           await sprint.save();
//          res.status(200).json({message:"Completed the sprint"});
//     }
//     catch(err)
//     {
//         console.log(err);
//         res.status(500).json({error:err});
//     }
// }))


module.exports=router;