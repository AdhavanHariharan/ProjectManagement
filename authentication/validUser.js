const Projects=require('../models/projects')
const getEmail = require('../utils/decode');

//common function to check if the user is valid
module.exports= async function (req, res, next)
{
    var projectId= req.params.projectId;
    var decoded= getEmail(req.headers);
    var email = decoded.email;
    try {
    const projects= await Projects.find(
        {
            $and:[
                {
                    _id:projectId
                },
                {
                    email:email
                }
            ]
        }
    );
 
     if(projects.length>0)
     {
         next();
     }
     else
     {
        throw new Error("Logged in user is not a part of the project")
     }
    }
    catch(error)
    {
        return res.status(401).json({
            message: error.message
        });
    }
}