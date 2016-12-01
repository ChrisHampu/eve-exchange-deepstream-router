import { deepstream } from './deepstream_interface';
import { recordReady } from './deepstream_helpers';
import { getCollection } from './mongo_interface';

export async function publishLogin(user_id) {

  return new Promise((resolve, reject) => {

    getCollection('settings').findOne({user_id}, async (err, result) => {

      if (!result) {
        return;
      }

      var record = deepstream.record.getRecord(`settings/${user_id}`).set(result);

      await recordReady(record);
    });

    getCollection('profit_alltime').findOne({user_id}, async (err, result) => {

      if (!result) {
        return;
      }

      var record = deepstream.record.getRecord(`profit_alltime/${user_id}`).set(result);

      await recordReady(record);
    });

    publishSubscription(user_id);

    getCollection('profit_top_items').findOne({user_id}, async (err, result) => {

      if (!result) {
        return;
      }

      var record = deepstream.record.getRecord(`profit_top_items/${user_id}`).set(result);

      await recordReady(record);
    });

    getCollection('profit_transactions').find({user_id}).toArray(async (err, docs) => {

      if (!docs) {
        return;
      }

      var record = deepstream.record.getRecord(`profit_transactions/${user_id}`).set(docs);

      await recordReady(record);
    });

    getCollection('portfolios').find({user_id}).toArray(async (err, docs) => {

      if (!docs) {
        return;
      }

      var record = deepstream.record.getRecord(`portfolios/${user_id}`).set(docs);

      await recordReady(record);
    });

    getCollection('notifications').find({user_id}).toArray(async (err, docs) => {

      if (!docs) {
        return;
      }

      var record = deepstream.record.getRecord(`notifications/${user_id}`).set(docs);

      await recordReady(record);
    });

    getCollection('user_orders').find({user_id: parseInt(user_id)}).toArray(async (err, docs) => {

      try {
        var record = deepstream.record.getRecord(`user_orders/${parseInt(user_id)}`).set(docs);
        await recordReady(record);

      } catch (err) {
        console.log("Error setting user_orders record for user " + user_id);
        console.log(err);
      }
    });

    getCollection('profit_chart').find({user_id: parseInt(user_id)}).toArray(async (err, docs) => {

      try {
        var record = deepstream.record.getRecord(`profit_chart/${parseInt(user_id)}`).set(docs);
        await recordReady(record);

      } catch (err) {
        console.log("Error setting profit_chart record for user " + user_id);
        console.log(err);
      }
    });    

    getCollection('login_log').insertOne({
      user_id: user_id,
      time: new Date()
    }, (err, db) => {

      getCollection('login_log').find().sort({time: -1}).limit(100).toArray(async (err, docs) => {

        if (!docs) {
          return;
        }

        var record = deepstream.record.getRecord('admin/login_log').set(docs);

        await recordReady(record);
      });
    });

    resolve();
  });
}

export async function publishAuditLog() {

  return new Promise((resolve, reject) => {

    getCollection('audit_log').find().sort({time: -1}).limit(100).toArray(async (err, docs) => {

      if (!docs) {
        return;
      }

      var record = deepstream.record.getRecord('admin/audit_log').set(docs);

      await recordReady(record);

      resolve();
    });
  }) 
}

export async function publishOrders(type) {

  return new Promise((resolve, reject) => {

    getCollection('orders').find({type}).toArray(async (err, docs) => {

      var record = deepstream.record.getRecord(`market_orders/${type}`).set(docs);

      await recordReady(record);

      resolve();
    });
  })
}

export async function publishMinutes(type) {

  return new Promise((resolve, reject) => {

    getCollection('minutes').find({type}).toArray(async (err, docs) => {

      var record = deepstream.record.getRecord(`market_minutes/${type}`).set(docs);

      await recordReady(record);

      resolve();
    });
  })
}

export async function publishHourly(type) {

  return new Promise((resolve, reject) => {
    getCollection('hourly').find({type}).toArray(async (err, docs) => {

      var record = deepstream.record.getRecord(`market_hourly/${type}`).set(docs);

      await recordReady(record);

      resolve();
    });
  })
}

export async function publishDaily(type) {

  return new Promise((resolve, reject) => {
    getCollection('daily').find({type}).toArray(async (err, docs) => {

      var record = deepstream.record.getRecord(`market_daily/${type}`).set(docs);

      await recordReady(record);

      resolve();
    });
  })
}

export async function publishPortfolios(user_id) {

  return new Promise((resolve, reject) => {

    getCollection('portfolios').find({user_id: parseInt(user_id)}).toArray(async (err, docs) => {

      for (var i = 0; i < docs.length; i++) {
        if (docs[i].simulation === null) {
          delete docs[i].simulation;
        }
      }

      var record = deepstream.record.getRecord(`portfolios/${parseInt(user_id)}`).set(docs);

      await recordReady(record);

      resolve();
    });
  })
}

export async function publishSubscription(user_id) {

  return new Promise((resolve, reject) => {
    getCollection('subscription').findOne({user_id: parseInt(user_id)}, async (err, doc) => {

      try {
        // Remove null values
        if (doc.subscription_date === null) {
          delete doc.subscription_date;
        }
        if (doc.subscription_data) {
          delete doc.subscription_data;
        }

        var record = deepstream.record.getRecord(`subscription/${parseInt(user_id)}`).set(doc);
        await recordReady(record);

      } catch (err) {
        console.log("Error setting subscription record for user " + user_id);
        console.log(err);
      }

      publishAdminSubscriptions();

      resolve();
    });
  });
}

export async function publishAdminSubscriptions() {

  return new Promise((resolve, reject) => {
    getCollection('subscription').find().toArray(async (err, docs) => {

      try {

        // Remove null values
        for (var i = 0; i < docs.length; i++) {
          if (docs[i].subscription_date === null) {
            delete docs[i].subscription_date;
          }

          if (docs[i].subscription_data) {
            delete docs[i].subscription_data;
          }
        }
  
        var record = deepstream.record.getRecord(`admin_subscriptions`).set(docs);

        await recordReady(record);

      } catch (err) {
        console.log("Error setting admin subscriptions");
        console.log(err);
      }

      resolve();
    });
  });
}

export async function publishNotifications(user_id) {

  return new Promise((resolve, reject) => {

    getCollection('notifications').find({user_id: parseInt(user_id)}).toArray(async (err, docs) => {

      try {
        var record = deepstream.record.getRecord(`notifications/${parseInt(user_id)}`).set(docs);
        await recordReady(record);

      } catch (err) {
        console.log("Error setting notification record for user " + parseInt(user_id));
        console.log(err);
      }
      resolve();
    });
  });
}

export async function publishSettings(user_id) {

  return new Promise((resolve, reject) => {
    getCollection('settings').findOne({user_id: parseInt(user_id)}, async (err, result) => {

      if (!result) {
        console.log("No settings found for user " + user_id);
        resolve();
        return;
      }

      try {
        var record = deepstream.record.getRecord(`settings/${parseInt(user_id)}`).set(result);

        await recordReady(record);

      } catch (err) {
        console.log("Error publishing settings record for user " + user_id);
        console.log(err);
      }

      resolve();
    });
  });
}

export async function publishProfit(user_id) {

  return new Promise((resolve, reject) => {
    getCollection('profit_chart').find({user_id: parseInt(user_id)}).toArray(async (err, docs) => {

      try {
        var record = deepstream.record.getRecord(`profit_chart/${parseInt(user_id)}`).set(docs);
        await recordReady(record);

      } catch (err) {
        console.log("Error setting profit_chart record for user " + user_id);
        console.log(err);
      }
    });

    getCollection('profit_transactions').find({user_id: parseInt(user_id)}).toArray(async (err, docs) => {

      try {
        var record = deepstream.record.getRecord(`profit_transactions/${user_id}`).set(docs);
        await recordReady(record);

      } catch (err) {
        console.log("Error setting profit_transaction record for user " + user_id);
        console.log(err);
      }
    });

    getCollection('profit_top_items').findOne({user_id: parseInt(user_id)}, async (err, docs) => {

      try {
        var record = deepstream.record.getRecord(`profit_top_items/${parseInt(user_id)}`).set(docs);
        await recordReady(record);

      } catch (err) {
        console.log("Error setting profit_top_items record for user " + user_id);
        console.log(err);
      }
    });

    getCollection('profit_alltime').findOne({user_id: parseInt(user_id)}, async (err, docs) => {

      try {
        var record = deepstream.record.getRecord(`profit_alltime/${parseInt(user_id)}`).set(docs);
        await recordReady(record);

      } catch (err) {
        console.log("Error setting profit_alltime record for user " + user_id);
        console.log(err);
      }
    });

    getCollection('user_orders').find({user_id: parseInt(user_id)}).toArray(async (err, docs) => {

      try {
        var record = deepstream.record.getRecord(`user_orders/${parseInt(user_id)}`).set(docs);
        await recordReady(record);

      } catch (err) {
        console.log("Error setting user_orders record for user " + user_id);
        console.log(err);
      }
    });

    resolve();
  });
}