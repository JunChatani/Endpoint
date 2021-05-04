//https://www.youtube.com/watch?v=-MTSQjw5DrM
require("dotenv").config();
var Airtable = require("airtable");
const express = require("express");
const app = express();
const PORT = process.env.PORT;
const API_KEY = process.env.API_KEY;

var base = new Airtable({ apiKey: API_KEY }).base("apph5ZHsGu53j9WAx");

let usersTable = [];
let tipsTable = [];
let articlesTable = [];
let conditionsTable = [];
let sensorlogsTable = [];

const cacheTables = () => {
  getRecordOfTable("users", usersTable);
  getRecordOfTable("articles", articlesTable);
  getRecordOfTable("tips", tipsTable);
  getRecordOfTable("conditions", conditionsTable);
  getRecordOfTable("sensorlogs", sensorlogsTable);
};

const getRecord = (table, cachedTable) =>
  table
    .select({
      view: "Grid view",
    })
    .firstPage(function (err, records) {
      if (err) {
        console.error(err);
        return;
      }
      records.forEach(function (record) {
        cachedTable.push(record);
      });
    });

const getTable = (table) => {
  const tables = {
    users: base("Users"),
    articles: base("Articles"),
    tips: base("Tips"),
    sensorlogs: base("SensorLogs"),
    conditions: base("Conditions"),
  };
  return tables[table.toLowerCase()] ?? "Table not found";
};

const getRecordOfTable = (table, cachedTable) => {
  getRecord(getTable(table), cachedTable);
};

const getUserByID = (id) => {
  return usersTable.filter((user) => {
    return user.id === id;
  });
};

const getObjectsFromTable = (idList, objects) => {
  let mappedObjects = [];
  idList.map((id) => {
    objects.some((object) => {
      if (id === object.id) {
        mappedObjects.push(object.fields);
      }
      return id === object.id;
    });
  });
  return mappedObjects;
};

const getQueryName = (queryName) => {
  const queryNames = {
    gethomepageinfoofuserbyid: async function (id) {
      const user = getUserByID(id);
      const userInfo = user[0].fields;
      const name = userInfo.Name;
      const hrv = userInfo.HRV;
      const tips = getObjectsFromTable(userInfo.Tips, tipsTable);
      const articles = getObjectsFromTable(userInfo.Articles, articlesTable);
      const sensorlogs = getObjectsFromTable(
        userInfo.Sensorlogs,
        sensorlogsTable
      );
      const homepageinfoofuserbyid = { name, hrv, articles, tips, sensorlogs };
      return homepageinfoofuserbyid;
    },
    getcredentialsofuserbyid: async function (id) {
      const user = getUserByID(id);
      const userInfo = user[0].fields;
      const email = userInfo.Email;
      const password = userInfo.Password;
      const credentialsofuserbyid = { email, password };
      return credentialsofuserbyid;
    },
  };
  return queryNames[queryName.toLowerCase()] ?? "Queryname not found";
};

cacheTables();

app.get("/queryname/:queryname/queryterms/:queryterms", function (req, res) {
  getQueryName(req.params.queryname)(req.params.queryterms).then((result) => {
    return res.status(200).send(result);
  });
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
