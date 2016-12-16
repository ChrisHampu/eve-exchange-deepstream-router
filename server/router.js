import Koa from 'koa';
import KoaRouter from 'koa-router';
import body from 'koa-better-body';
import { connectDeepstream } from './deepstream_interface';
import { publishLogin, publishPortfolios, publishSubscription, publishNotifications, publishSettings, publishAuditLog, publishFeeds } from './deepstream_publishers';
import { configureListeners, triggerOrderListeners, triggerMinutesListeners, triggerHourlyListeners, triggerDailyListeners, triggerPortfolioListeners, triggerProfitListeners } from './deepstream_listeners';
import { configureAdminListeners } from './deepstream_admin';

const router = KoaRouter();
let deepstream = null;

router.post('/user/create', async (ctx) => {

  deepstream.record.getRecord(`settings/${ctx.request.fields.user_id}`).set(ctx.request.fields);

  ctx.body = "Success";
});

router.post('/user/login', async (ctx) => {

  await publishLogin(ctx.request.fields.user_id);

  ctx.body = "Success";
});

router.post('/publish/portfolios', async (ctx) => {

  await triggerPortfolioListeners();

  ctx.body = "Success";
});

router.post('/publish/portfolios/:id', async (ctx) => {

  await publishPortfolios(ctx.params.id);

  ctx.body = "Success";
});

router.post('/publish/notifications/:id', async (ctx) => {

  await publishFeeds(ctx.params.id);

  ctx.body = "Success";
});

router.post('/publish/subscription/:id', async (ctx) => {

  await publishSubscription(ctx.params.id).catch(err => {
    console.log(err);
  });

  ctx.body = "Success";
});

router.post('/publish/settings/:id', async (ctx) => {

  await publishSettings(ctx.params.id).catch(err => {
    console.log(err);
  });

  ctx.body = "Success";
});

router.post('/publish/feeds/:id', async (ctx) => {

  await publishFeeds(ctx.params.id).catch(err => {
    console.log(err);
  });

  ctx.body = "Success";
});

router.post('/publish/profit', async (ctx) => {

  await triggerProfitListeners();

  ctx.body = "Success";
});

router.post('/publish/market/orders', async (ctx) => {

  console.log("Publishing market orders");

  var t1 = process.hrtime();

  await triggerOrderListeners();

  var diff = process.hrtime(t1);
  console.log(`Market orders published in ${diff[0]} seconds`);

  ctx.body = "Success";
});

router.post('/publish/market/minutes', async (ctx) => {

  console.log("Publishing minute aggregates");

  var t1 = process.hrtime();

  await triggerMinutesListeners();

  var diff = process.hrtime(t1);
  console.log(`Minute aggregates published in ${diff[0]} seconds`);

  ctx.body = "Success";
});

router.post('/publish/market/hourly', async (ctx) => {

  console.log("Publishing hourly aggregates");

  var t1 = process.hrtime();

  await triggerHourlyListeners();

  var diff = process.hrtime(t1);
  console.log(`Minute aggregates published in ${diff[0]} seconds`);

  ctx.body = "Success";
});

router.post('/publish/market/daily', async (ctx) => {

  console.log("Publishing minute daily");

  var t1 = process.hrtime();

  await triggerDailyListeners();

  var diff = process.hrtime(t1);
  console.log(`Daily aggregates published in ${diff[0]} seconds`);

  ctx.body = "Success";
});

router.post('/publish/audit', async (ctx) => {

  publishAuditLog();

  ctx.body = "Success";
});

connectDeepstream()
.then((_deepstream) => {

  deepstream = _deepstream;

  configureListeners(deepstream);
  configureAdminListeners(deepstream);
});

// API Router
const api = new Koa(); 
  
api.use(body({
  jsonLimit: '250mb'
}));
api.use(router.routes())
api.use(router.allowedMethods())

api.listen(4501, () => console.log('API server is listening on port 4501'));
