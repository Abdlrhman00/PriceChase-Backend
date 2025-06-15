const { Client } = require("elasticsearch");
const dotenv = require("dotenv");

dotenv.config();


const client = new Client({
  host: process.env.BONSAI_URI,
  auth: {
    username:  process.env.BONSAI_USERNAME,
    password:  process.env.BONSAI_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});


module.exports = client;