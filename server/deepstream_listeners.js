import { publishOrders, publishMinutes, publishHourly, publishDaily, publishPortfolios, publishProfit, publishFeeds, publishLogin } from './deepstream_publishers';
import { getCollection } from './mongo_interface';

const subscribed_users = [];

const subscribed_orders = [];
const subscribed_minutes = [];
const subscribed_hourly = [];
const subscribed_daily = [];

export async function triggerOrderListeners() {

  for (var _type of subscribed_orders) {

    await publishOrders(_type);
  }
}

export async function triggerMinutesListeners() {

  for (var _type of subscribed_minutes) {

    await publishMinutes(_type);
  }
}

export async function triggerHourlyListeners() {

  for (var _type of subscribed_hourly) {

    await publishHourly(_type);
  }
}

export async function triggerDailyListeners() {

  for (var _type of subscribed_daily) {

    await publishDaily(_type);
  }
}

export async function triggerPortfolioListeners() {

  for (var user_id of subscribed_users) {

    await publishPortfolios(user_id);
  }
}

export async function triggerProfitListeners() {

  for (var user_id of subscribed_users) {

    await publishProfit(user_id);
  }
}

export async function triggerFeedsListeners() {

  for (var user_id of subscribed_users) {

    await publishFeeds(user_id);
  }
}

export async function configureListeners(deepstream) {

  deepstream.presence.subscribe((name, isLoggedIn) => {

    getCollection('users').findOne({user_name: name}, (err, result) => { 

      if (err || !result ) {
        console.log(`Failed to handle login for user ${name}`);
        return;
      }

      const user_id = result.user_id;

      if (isLoggedIn) {
        subscribed_users.push(user_id);
      } else {
        subscribed_users.splice(subscribed_users.indexOf(user_id), 1);
      }
    });
  });

  deepstream.record.listen('market_orders/\\d*', (eventName, isSubscribed, response) => {

    const type = parseInt(/market_orders\/(\d*)/.exec(eventName)[1]);

    if (isSubscribed) {

      // Become provider for this record
      response.accept();

      // Add to tracking list
      subscribed_orders.push(type);
      
      // Publish a record for this item
      publishOrders(type);
    } else {

      // Remove from update list
      subscribed_orders.splice(subscribed_orders.indexOf(type), 1);

      // Remove record so its not in memory
      deepstream.record.getRecord(eventName).delete();
    }
  });

  deepstream.record.listen('market_minutes/\\d*', (eventName, isSubscribed, response) => {

    const type = parseInt(/market_minutes\/(\d*)/.exec(eventName)[1]);

    if (isSubscribed) {

      // Become provider for this record
      response.accept();

      // Add to tracking list
      subscribed_minutes.push(type);
      
      // Publish a record for this item
      publishMinutes(type);
    } else { 

      // Remove from update list
      subscribed_minutes.splice(subscribed_minutes.indexOf(type), 1);

      // Remove record so its not in memory
      deepstream.record.getRecord(eventName).delete();
    }
  });

  deepstream.record.listen('market_hourly/\\d*', (eventName, isSubscribed, response) => {

    const type = parseInt(/market_hourly\/(\d*)/.exec(eventName)[1]);

    if (isSubscribed) {

      // Become provider for this record
      response.accept();

      // Add to tracking list
      subscribed_hourly.push(type);
      
      // Publish a record for this item
      publishHourly(type);
    } else {

      // Remove from update list
      subscribed_hourly.splice(subscribed_hourly.indexOf(type), 1);

      // Remove record so its not in memory
      deepstream.record.getRecord(eventName).delete();
    }
  })

  deepstream.record.listen('market_daily/\\d*', (eventName, isSubscribed, response) => {

    const type = parseInt(/market_daily\/(\d*)/.exec(eventName)[1]);

    if (isSubscribed) {

      // Become provider for this record
      response.accept();

      // Add to tracking list
      subscribed_daily.push(type);
      
      // Publish a record for this item
      publishDaily(type);
    } else {

      // Remove from update list
      subscribed_daily.splice(subscribed_daily.indexOf(type), 1);

      // Remove record so its not in memory
      deepstream.record.getRecord(eventName).delete();
    }
  });
  
  deepstream.record.listen('settings/.*', (eventName, isSubscribed, response) => {

    const id = parseInt(/settings\/(\d*)/.exec(eventName)[1]);

    if (isSubscribed) {
      deepstream.event.subscribe(eventName, data => {

        delete data._id;
        getCollection('settings').findOneAndReplace({user_id: data.user_id}, data);
      });
    } else {
    }
  });
}
