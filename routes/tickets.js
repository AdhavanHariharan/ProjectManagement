const express=require('express')
const router= express.Router();
const checkAuth=require('../authentication/check-auth')
const asyncHandler = require('express-async-handler')
const Projects=require('../models/projects')
const Tickets=require('../models/tickets')
const Users=require('../models/user')
const getEmail = require('../utils/decode');
const validUser = require('../authentication/validUser');
const mongoose=require('mongoose');


//Router to create tickets for a particular project
router.patch('/:projectId',checkAuth,validUser,asyncHandler(async(req,res,next)=>{

    const projectId = req.params.projectId;
    var decoded= getEmail(req.headers);
    var email = decoded.email;

        try{
                
            if(req.body.assignedTo!=null)
            {
                const userName = await Users.find({email:email});
                    if(!userName.length>0)
                    {
                        throw new Error("Assign to a registered user")
                    }

            }
           
            const tickets = new Tickets({
                _id: mongoose.Types.ObjectId(),
                projectId : projectId,
                name:req.body.name,
                assignedTo : req.body.assignedTo,
                type : req.body.type
            })

            const project = await Projects.findById({_id:projectId});
            project.tickets.push(tickets._id);
            project.save();

            await tickets.save();

            res.status(200).json({ 
            message: "Tickets saved to the project",
            createdTicket: {
                tickets: tickets.name
                }
                });
            }
            catch(err){
            res.status(500).json({error: err.message});

            }
        }))

    //Router to update the status of a ticket
    router.patch('/status/:ticketId',checkAuth,validUser,asyncHandler(async(req,res,next)=>{

        const ticketId = req.params.ticketId;
        const status = req.body.status;
        try{
            const ticket = await Tickets.findById({_id:ticketId});
            ticket.status=status;
            await ticket.save();
            res.status(200).json({message:"Status updated"});
        }
        catch(err)
        {
            console.log(err);
            res.status(500).json({error:err.message});
        }
}))

//Router to get all the tickets of a particular project
router.get('/:projectId',asyncHandler(async(req,res,next)=>
{
    try{
    const result = await Tickets.find({projectId:req.params.projectId},{__v:0,projectId:0});
    res.status(200).json(result);
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({error:err.message});
    }
}))

module.exports=router;