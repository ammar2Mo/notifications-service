const config = require('./config')('production');
const init = require('./init')(config)();
const app = require('./app');

async function run() {
  const server = await app(init);

  // this line required for server to work well
  // when separating the definition it won't not work well
  // eslint-disable-next-line global-require
  const http = require('http').Server(server);

  const { port } = config.app;
  http.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server started @ ${port}`);
  });

  process.on('unhandledRejection', (err) => {
    // eslint-disable-next-line no-console
    console.error('unhandledRejection', err);
  });
}

run();
