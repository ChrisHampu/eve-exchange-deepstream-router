import { MongoClient } from 'mongodb';

let mongodb = null;
var collections = {};

export async function connectMongoDB() {
  return new Promise((resolve, reject) => {
    MongoClient.connect('mongodb://localhost:27017/eveexchange', (err, db) => {

      if (err) {
        console.log("MongoDB unavailable");
        reject();
        return;
      }

      console.log("Connected to MongoDB");

      mongodb = db;

      collections['orders'] = mongodb.collection("orders");
      collections['minutes'] = mongodb.collection("aggregates_minutes");
      collections['hourly'] = mongodb.collection("aggregates_hourly");
      collections['daily'] = mongodb.collection("aggregates_daily");
      collections['settings'] = mongodb.collection("settings");
      collections['profit_alltime'] = mongodb.collection("profit_alltime");
      collections['profit_chart'] = mongodb.collection("profit_chart");
      collections['profit_top_items'] = mongodb.collection("profit_top_items");
      collections['profit_transactions'] = mongodb.collection("profit_transactions");
      collections['subscription'] = mongodb.collection("subscription");
      collections['user_orders'] = mongodb.collection("user_orders");
      collections['portfolios'] = mongodb.collection("portfolios");
      collections['notifications'] = mongodb.collection("notifications");
      collections['login_log'] = mongodb.collection("login_log");
      collections['audit_log'] = mongodb.collection("audit_log");

      resolve();
    });
  });
}

export function getCollection(name) {

  return collections[name];
}
