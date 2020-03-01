const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

const noop = () => {};
let users = [];

router.get('/subscribe', async (ctx, next) => {
  users.push(ctx.res);
  ctx.res.on('close', () => {
    users.splice(users.indexOf(ctx.res), 1);
  });
  await new Promise(noop);
});

router.post('/publish', async (ctx, next) => {
  const message = ctx.request.body.message;
  if (message) {
    users.forEach((res) => {
      res.statusCode = 200;
      res.end(message);
    });
    users = [];
  }
  ctx.body = 'ok';
});

app.use(router.routes());

module.exports = app;
