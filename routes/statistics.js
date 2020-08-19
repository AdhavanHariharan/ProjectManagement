const express=require('express')
const router= express.Router();
const mongoose=require('mongoose')
const asyncHandler = require('express-async-handler')
const Projects=require('../models/projects')
const Sprints=require('../models/sprints');
const Tickets = require('../models/tickets');

router.get('/:projectId',asyncHandler(async(req,res,next)=>{

    const projectId = req.params.projectId;

    try{
       
       const sprint = await Sprints.findOne({$and:[{active:"yes"},{projectId:projectId}]});
       var id=sprint._id.toString();
       result =await Tickets.aggregate([{$match:{sprintId:id}},
            {
                "$group":{
                    _id:"$status",
                    count:{$sum:1}
                }
            },
            {
                "$project" :{
                    status:"$_id",
                    count:1,
                    _id:0
                }
            }
        
        ])


        result1 =await Tickets.aggregate([{$match:{sprintId:id}},
            
            {
                "$group":{
                    _id:{
                        "assignedTo":"$assignedTo",
                        "status":"$status"
                    },
                    count:{$sum:1}
                }
            }
        
        ])

        result2 =await Tickets.aggregate([{$match:{projectId:projectId}},
            
            {
                "$group":{
                    _id:{
                        "assignedTo":"$assignedTo",
                        "status":"$status"
                    },
                    count:{$sum:1}
                }
            }
        
        ])
 
        res.status(201).json({
            UserPerformance : result2,
            SprintPerformance: result,
            SprintUserPerformance : result1
            })
        }
        catch(err)
        {
            res.status(500).json({error: err});
        }
}))

module.exports=router;