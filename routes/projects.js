const express=require('express')
const router= express.Router();
const mongoose=require('mongoose')
const checkAuth=require('../authentication/check-auth')
const jwt = require("jsonwebtoken");
const Projects=require('../models/projects')

// Router to create a project
router.post('/',checkAuth,(req,res,next)=>{
        
        const projects = new Projects({
                _id: mongoose.Types.ObjectId(),
                email : req.body.email,
                name : req.body.name
            })
            projects.save()
            .then(result => {
                console.log(result);
                res.status(201).json({
                message: "Project saved",
                createdTopic: {
                    name: result.name,
                    invite:`/projects/accept/${result._id}`
                }
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                error: err
                });
            }) });

//Router to accept the invitation of a particular project
router.post('/accept/:projectId',checkAuth,(req,res,next)=>{

    var email= getEmail(req.headers);
    const projectId = req.params.projectId;

    Projects.findById({_id:projectId})
    .exec().then(
        project => {

            const projects = new Projects({
                _id: mongoose.Types.ObjectId(),
                email : email,
                name : project.name
            })

            projects.save()
            .then(result => {
            console.log(result);
            res.status(201).json({
            message: "You can now view this project",
            AccessProjectTo: {
                name: result.name
            }
            });})
            .catch(err => {
                console.log(err);
                res.status(500).json({
                error: err
                });
            })
        }
    )
})

//Router to get all the projects of a particular user
router.get('/',(req,res,next)=>{

    var email= getEmail(req.headers);
    Projects.find({email:email}).then(result=>{

        res.status(200).json({
            result
        })

    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
        error: err
        });
    })
})


//common function to getEmail from the request headers
function getEmail(headers)
{
    var authorization = headers.authorization.split(' ')[1];
    var decoded = jwt.verify(authorization,process.env.JWT_KEY);
    return decoded.email;
}

module.exports=router;