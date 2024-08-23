const transectionModel = require("../models/transectionModel");
const moment = require("moment");
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');
const path = require('path');


const getAllTransection = async (req, res) => {
  try {
    const { frequency, selectedDate, type } = req.body;
    const transections = await transectionModel.find({
      ...(frequency !== "custom"
        ? {
          date: {
            $gt: moment().subtract(Number(frequency), "d").toDate(),
          },
        }
        : {
          date: {
            $gte: selectedDate[0],
            $lte: selectedDate[1],
          },
        }),
      userid: req.body.userid,
      ...(type !== "all" && { type }),
    });
    res.status(200).json(transections);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const deleteTransection = async (req, res) => {
  try {
    await transectionModel.findOneAndDelete({ _id: req.body.transectionId });
    res.status(200).send("Transection Deleted");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

const editTransection = async (req, res) => {
  try {
    await transectionModel.findOneAndUpdate({ _id: req.body.transectionId }, req.body.payload);
    res.status(200).send("Edit Successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const addTransection = async (req, res) => {
  try {
    // const newTransection = new transectionModel(req.body);
    const newTransection = new transectionModel(req.body);
    await newTransection.save();
    res.status(201).send("Transection Created");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const makeDoc = async (req, res) => {
  try {
    // Extract filters from the request body
    const { frequency, selectedDate, type } = req.body;

    // Build the query object based on filters
    const query = {
      ...(frequency !== "custom"
        ? {
          date: {
            $gt: moment().subtract(Number(frequency), "d").toDate(),
          },
        }
        : {
          date: {
            $gte: moment(selectedDate[0]).startOf('day').toDate(),  // Use moment to ensure correct date format
            $lte: moment(selectedDate[1]).endOf('day').toDate(),    // Use moment to ensure correct date format
          },
        }),
      ...(type !== "all" && { type }),  // If type is not "all", filter by type
      userid: req.body.userid,  // Ensure only the current user's transactions are fetched
    };

    // Fetch filtered data from MongoDB
    const expenses = await transectionModel.find(query);

    // Map data for CSV
    const records = expenses.map(expense => ({
      date: moment(expense.date).format('YYYY-MM-DD'), // Ensure date is formatted correctly
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
    }));

    // Define CSV writer
    const csvWriter = createObjectCsvWriter({
      path: 'expenses.csv',
      header: [
        { id: 'date', title: 'Date' },
        { id: 'amount', title: 'Amount' },
        { id: 'category', title: 'Category' },
        { id: 'description', title: 'Description' },
      ],
    });

    // Write data to CSV
    await csvWriter.writeRecords(records);

    // Send file to client
    const filePath = path.join(__dirname, '..', 'expenses.csv');
    res.download(filePath, 'expenses.csv', (err) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error downloading the file');
      } else {
        // Optional: Delete the file after download
        fs.unlinkSync(filePath);
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).send('Error exporting data');
  }
};



module.exports = { getAllTransection, addTransection, editTransection, deleteTransection, makeDoc };