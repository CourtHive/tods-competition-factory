<p align="center">
  <a href="http://courthive.com/" target="blank"><img src="./src/common/images/red-ch-logo.png" width="220" alt="CourtHive Logo" /></a>
</p>

  <p align="center">CourtHive is an Open Source / Open Data initiative to develop components to support the emergence of a standards based ecosystem of services for competition.</p>
    <p align="center">
<a href="https://www.npmjs.com/~tods-competition-factory" target="_blank"><img src="https://img.shields.io/npm/v/tods-competition-factory" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~tods-competition-factory" target="_blank"><img src="https://img.shields.io/npm/l/tods-competition-factory" alt="Package License" /></a>
<a href="https://www.npmjs.com/~tods-competition-factory" target="_blank"><img src="https://img.shields.io/npm/dm/tods-competition-factory" alt="NPM Downloads" /></a>
</p>

## Description

Lightweight NestJS example server for testing client/server use cases with tods-competition-factory

## Installation

```bash
$ pnpm install
```

## .env file

Create an `.env` file in the root directory

```txt
APP_NAME='Competition Factory Server'
APP_PORT=8383

JWT_SECRET='Replace this string with a truly random string'
JWT_VALIDITY=2h
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Support

- Author - [Charles Allen](https://github.com/CourtHive)
- Website - [https://CourtHive.com](https://CourtHive.com/)

## License

The Competition Factory is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
