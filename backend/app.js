//https://www.youtube.com/watch?v=-MTSQjw5DrM

var Airtable = require("airtable");
const express = require("express");
require("dotenv").config();

const app = express();
const port = 3000;

var base = new Airtable({ apiKey: process.env.API_KEY }).base(
  "apph5ZHsGu53j9WAx"
);

function getTable(table) {
  const tables = {
    users: base("Users"),
    articles: base("Articles"),
    tips: base("Tips"),
    sensorlogs: base("SensorLogs"),
    conditions: base("Conditions"),
  };
  return tables[table.toLowerCase()] ?? "Table not found";
}

function getQueryName(queryName) {
  const queryNames = {
    getuserbyid: async function (id) {
      return base("Users")
        .select({
          view: "Grid view",
        })
        .firstPage(function (err, records) {
          if (err) {
            console.error(err);
            return;
          }
          if (records)
            records.forEach(function (record) {
              console.log(id);
              console.log("Retrieved", record.get("Name"));
            });
        });
    },
    getArticleById: function () {
      getTable("articles")
        .select({
          view: "Grid view",
        })
        .firstPage(function (err, records) {
          if (err) {
            console.error(err);
            return;
          }
          records.forEach(function (record) {
            console.log("Retrieved", record.get("Name"));
          });
        });
    },
  };
  return queryNames[queryName.toLowerCase()] ?? "Queryname not found";
}

app.get("/queryname/:queryname/queryterms/:query", function (req, res) {
  console.log(getQueryName(req.params.queryname)(req.params.query));
  res.status(200).send(req.params);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
