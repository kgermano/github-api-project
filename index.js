//import Koa from 'koa'
const PORT = process.env.PORT || 3000

const Koa = require('koa');
const app = new Koa(); 
const Router = require('koa-router');
const router = new Router();
const apiRouter = new Router({
    prefix: '/api'
  });

  // require our external routes and pass in the router
require('./routes/basic')({ router });
require('./routes/api')({ apiRouter });




// error handling
app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = err.message;
      ctx.app.emit('error', err, ctx);
    }
  });


app.use(router.routes());
app.use(router.allowedMethods());

app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`)
  })

