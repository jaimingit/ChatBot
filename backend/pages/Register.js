const express = require('express');
const app = express();
const cores = require('cors');
app.use(cores());
const router=express.Router();
const { UserModel } = require('../mongodb');

router.post('/',async(req,res)=>{
    let data=await req.body;

    let add= new UserModel(data);
    await add.save();
    res.json({ success: true, userId: add._id });
})
module.exports=router;
