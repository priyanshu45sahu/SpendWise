const mongoose = require("mongoose");

const transectionSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: true,
    },
    amount:{
        type: Number,
        required: [true, "amount is required"]
    },
    type:{
        type: String,
        required: [true, "Type is required"]
    },
    category:{
        type:String,
        required: [true, "cat is required"]
    },
    refrence:{
        type:String,
    },
    description:{
        type:String,
        required: [true, "desc is required"]
    },
    date:{
        type: Date,
        required: [true, "date is req"]
    }
},{ timestamps: true}
);

const transectionModel = mongoose.model("transections", transectionSchema);
module.exports = transectionModel;