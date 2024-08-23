const mongoose = require("mongoose");
const transectionModel = require("./models/transectionModel.js"); // Adjust the path to your model file
const dotenv = require("dotenv");
const connectDb = require("./config/connectDb");
//config dot env file
dotenv.config();


//database call
connectDb();

// Sample data
const sampleData = [
    {
        userid: '66bca3b110811f46b87ccd75',
        amount: 150.75,
        type: 'income',
        category: 'salary',
        refrence: 'Monthly Salary',
        description: 'Salary for the month of August',
        date: new Date('2024-08-01'),
    },
    {
        userid: '66bca3b110811f46b87ccd75',
        amount: 50.00,
        type: 'expense',
        category: 'food',
        refrence: 'Dinner',
        description: 'Dinner with friends',
        date: new Date('2024-08-02'),
    },
    {
        userid: '66bca3b110811f46b87ccd75',
        amount: 200.00,
        type: 'income',
        category: 'project',
        refrence: 'Freelance Work',
        description: 'Payment for freelance project',
        date: new Date('2024-08-03'),
    },
];

// Insert sample data into the collection
transectionModel.insertMany(sampleData)
    .then(() => {
        console.log('Sample data inserted');
        mongoose.disconnect();
    })
    .catch(err => {
        console.error('Error inserting data:', err);
        mongoose.disconnect();
    });
