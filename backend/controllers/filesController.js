const express = require("express");
const AWS = require("aws-sdk");
const Expense = require("../models/Expense");
const crypto = require("crypto");
const app = express();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
const bucketName = "etdr";
let fileName;

const generateFileHash = (content) => {
  return crypto.createHash("sha256").update(content).digest("hex");
};

exports.downloadReport = async (req, res) => {
  try {
    // Fetching the expenses for the user
    let data = await Expense.find({ userId: req.user.id });

    // Stringify the data to store it as a JSON file in S3
    data = JSON.stringify(data);

    // Generate a unique hash for the file name
    const dataHash = generateFileHash(data);
    fileName = dataHash + ".json";

    // Check if the file already exists in S3
    await s3.headObject({ Bucket: bucketName, Key: fileName }).promise();

    // Generate a signed URL to download the file
    const url = s3.getSignedUrl("getObject", {
      Bucket: bucketName,
      Key: fileName,
      Expires: 60,
    });

    res.json({ url });
  } catch (err) {
    // If the file doesn't exist, upload it to S3
    if (err.code === "NotFound") {
      const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: data,
        ContentType: "application/json",
      };

      // Upload the file to S3
      await s3.putObject(params).promise();

      // Generate a signed URL to access the newly uploaded file
      const url = s3.getSignedUrl("getObject", {
        Bucket: bucketName,
        Key: fileName,
        Expires: 60,
      });

      res.json({ url });
    } else {
      // If any other error occurs
      res.status(500).send(`Error: ${err.message}`);
    }
  }
};
