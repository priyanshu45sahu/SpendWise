const transectionModel = require("../models/transectionModel");
const moment = require("moment");
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');

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
    const { frequency, selectedDate, type, userid } = req.body;

    const query = {
      ...(frequency !== "custom"
        ? { date: { $gt: moment().subtract(Number(frequency), "d").toDate() } }
        : { date: { $gte: moment(selectedDate[0]).startOf('day').toDate(), $lte: moment(selectedDate[1]).endOf('day').toDate() } }),
      ...(type !== "all" && { type }),
      userid,
    };

    let expenses;
    try {
      expenses = await transectionModel.find(query);
      console.log('Fetched expenses:', expenses);
    } catch (dbError) {
      console.error('Database query error:', dbError);
      return res.status(500).send('Database query error');
    }

    if (!expenses.length) {
      return res.status(404).send('No transactions found');
    }

    // Map data for CSV
    const records = expenses.map(expense => ({
      date: moment(expense.date).format('YYYY-MM-DD'),
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
    }));

    // Convert JSON data to CSV
    const json2csvParser = new Parser();
    const csvData = json2csvParser.parse(records);

    // Set response headers for file download
    res.setHeader('Content-disposition', 'attachment; filename=expenses.csv');
    res.set('Content-Type', 'text/csv');

    // Send CSV data as the response
    res.status(200).send(csvData);
  } catch (err) {
    console.error('Error in makeDoc:', err);
    return res.status(500).send('Error exporting data');
  }
};


module.exports = { getAllTransection, addTransection, editTransection, deleteTransection, makeDoc };