const https = require('https');
const fs = require('fs');

const downloadReport = async function(url, dest, cb) {
  const file = fs.createWriteStream(dest);
  const request = https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);
    });
  });
};

module.exports.download = function() {
  const reportUrl = 'https://covid.ourworldindata.org/data/ecdc/full_data.csv';
  const date = new Date();
  const dateStr = date.toISOString();

  const filePath = 'public/reports/';
  const fileName = dateStr + '.csv';

  downloadReport(reportUrl, filePath + fileName);
};
