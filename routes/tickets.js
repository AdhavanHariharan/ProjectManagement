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

const { body } = require('express-validator');
const requsetBodyValidate=require('../authentication/requestBodyValidation')

//Router to create tickets for a particular project
router.patch('/:projectId',
[
    body('name').notEmpty(),
    body('type').notEmpty(),
    body('assignedTo').optional().isEmail(),
    body('description').optional().notEmpty()
], 
requsetBodyValidate, checkAuth,validUser,asyncHandler(async(req,res)=>{

    console.log()
    const projectId = req.params.projectId;
    var decoded= getEmail(req.headers);
    var email = decoded.email;

        try{
                
            if(req.body.assignedTo!=null)
            {
                const registeredUser = await Users.find({email:email});
                const assignedUser= await Projects.find({_id:projectId,email:req.body.assignedTo})
                    if(!registeredUser.length>0)
                    {
                        throw new Error("Assign to a registered user")
                    }
                    if(!assignedUser.length>0)
                    {
                        throw new Error("Assigned user is not part of the project")
                    }

            }
           
            const tickets = new Tickets({
                _id: mongoose.Types.ObjectId(),
                projectId : projectId,
                name:req.body.name,
                description:req.body.description,
                assignedTo :req.body.assignedTo,
                type : req.body.type
            })

           // await tickets.save();

            res.status(200).json({ 
            message: "Follwing ticket is saved to the project",
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
    router.patch('/status/:ticketId',checkAuth,asyncHandler(async(req,res)=>{

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
router.get('/:projectId',asyncHandler(async(req,res)=>
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