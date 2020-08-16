const express=require('express')
const router= express.Router();
const mongoose=require('mongoose')
const asyncHandler = require('express-async-handler')
const Projects=require('../models/projects')
const Sprints=require('../models/sprints')

router.get('/:projectId',asyncHandler(async(req,res,next)=>{

    const projectId = req.params.projectId;

    try{
        var sprints=await Sprints.find({projectId:projectId});
        var tickets= await Projects.find({_id:projectId});
        
       result =await Sprints.aggregate([{$match:{active:"yes"}},
            { $unwind: "$tickets"},
            {
                "$group":{
                    _id:"$tickets.status",
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

        result1 =await Sprints.aggregate([{$match:{active:"yes"}},
            { $unwind: "$tickets"},
            {
                "$group":{
                    _id:{
                        "assignedTo":"$tickets.assignedTo",
                        "status":"$tickets.status"
                    },
                    count:{$sum:1}
                }
            }
        
        ])

        res.status(201).json({
            SprintPerformance: result,
            SprintUserPerformance : result1
            })
        }
        catch(err)
        {
            res.status(500).json({error: "There is already one active sprint"});
        }
}))

module.exports=router;