const express = require('express');
const app = express();
const csv = require('csv-parser');
const fs = require('fs');
const report = require('./report');
const util = require('./util');

const ip = 'localhost';
const port = 8000;
const reportPath = './public/reports/';
const authSecret = process.env.AUTH_SECRET;

// GET - latest report
app.get('/api/v1/reports', async (req, res) => {
  const { country, start, end } = req.query; // query params for filtering
  const latestReport = util.report(); // get the latest report file

  // No file is found
  if (!latestReport) {
    res.status(404).send({ok: false, message: 'Report not found.'});
  }

  const reportFullPath = reportPath + latestReport.file; // full path for csv parse
  let cases = [];

  // Read csv
  fs.createReadStream(reportFullPath)
      .pipe(csv())
      .on('data', (csvRow) => {
        // parse date to JS format
        const row = csvRow;
        row.date = new Date(csvRow.date);

        if (country && row.location !== country) {
          return;
        }

        if (start && new Date(start) > row.date) {
          return;
        }

        if (end && new Date(end) < row.date) {
          return;
        }

        cases.push(row);
      })
      .on('end', () => {
        res.status(200).send({
          ok: true,
          file: latestReport,
          data: cases
        });
      })
      .on('error', () => {
        res.status(400).send({ok: false, message: 'Error reading CSV.'});
      });
});

// POST - request a refresh on report from source
app.post('/api/v1/reports', async (req, res) => {
  try {
    await report.download();
    res.status(200).send({ok: true});
  } catch(e) {
    res.status(400).send({ok: false});
  }
});

// Run server
app.listen(port);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app;
