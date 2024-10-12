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
            $gte: moment(selectedDate[0]).startOf('day').toDate(),
            $lte: moment(selectedDate[1]).endOf('day').toDate(),
          },
        }),
      ...(type !== "all" && { type }),
      userid: req.body.userid,
    };

    // Fetch filtered data from MongoDB
    const expenses = await transectionModel.find(query);
    console.log('Expenses fetched:', expenses);

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
    console.log('CSV file written successfully');

    // Send file to client
    const filePath = path.join(__dirname, '..', 'expenses.csv');
    console.log('File path:', filePath);

    res.download(filePath, 'expenses.csv', async (err) => {
      if (err) {
        console.log('Download error:', err);
        res.status(500).send('Error downloading the file');
      } else {
        // Delete the file asynchronously after download
        try {
          await fs.promises.unlink(filePath);
          console.log('File deleted after download');
        } catch (deleteErr) {
          console.error('Error deleting file:', deleteErr);
        }
      }
    });

  } catch (err) {
    console.log('Error:', err);
    res.status(500).send('Error exporting data');
  }
};


module.exports = { getAllTransection, addTransection, editTransection, deleteTransection, makeDoc };