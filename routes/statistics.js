const express=require('express')
const router= express.Router();
const mongoose=require('mongoose')
const asyncHandler = require('express-async-handler')
const Projects=require('../models/projects')
const Sprints=require('../models/sprints')

router.get('/:projectId',asyncHandler(async(req,res,next)=>{

    const projectId = req.params.projectId;

    try{
        
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

        result2 = await Sprints.aggregate([
            {
                "$match":
                {
                    projectId:"5f38d558108589162863a820"
                }
            },

        { $unwind: "$tickets"},
        {
            "$group":{
                _id:{
                    "assignedTo":"$tickets.assignedTo",
                    "status":"$tickets.status"
                },
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