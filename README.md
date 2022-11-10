# prerequisites

- [sanity](https://www.sanity.io/) account
- install [nodejs](http://nodejs.org) version 16 or higher
- `npm i yarn -g`
- cd to project directory then run: <br />`yarn install`
- create `.env` file and copy contents in .env.example and replace project id and dataset from your sanity account

# build for static production

- run `yarn build`
- you have now a `./build` folder containing all the files necessary including `index.html` for static website.
- run `yarn start` or move contents in `./build` to **nginx** folder

# how to run project in development mode

- run `yarn dev` to start in development
