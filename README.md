# notifications-service

service to handle notifications

# Pre-requisites

- Install [docker](https://www.docker.com)

# Getting started

- Clone the repository

```
git clone  https://github.com/ammar2Mo/notifications-service.git
```

### Running the build

All the different build steps are orchestrated via [npm scripts](https://docs.npmjs.com/misc/scripts).
Npm scripts basically allow us to call (and chain) terminal commands via npm.

| Npm Script | Description                                                                       |
| ---------- | --------------------------------------------------------------------------------- |
| `start`    | Runs full build docker image `docker-compose up --build -d && docker attach api ` |
| `dev`      | Runs full build before starting all watch tasks. Can be invoked with              |
| `bye`      | docker-compose down                                                               |
| `test`     | Runs build and run tests using mocha                                              |
| `coverage` | Runs coverage on project fils                                                     |
| `lint`     | Runs TSLint on project files                                                      |

Navigate to `http://localhost:5000`

- API Document endpoints

  swagger-ui Endpoint : http://localhost:5000/docs
