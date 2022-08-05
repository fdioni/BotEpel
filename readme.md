# BotEpel

## How to Run
This bot use [`nodemon`](https://www.npmjs.com/package/nodemon) when in development mode so it will reload/refresh the bot when any code changes occur.

1. create Bot config in root folder by copying `config.example.json` into `config.json` and don't forget to fill `token`
2. create Database config file in folder `config` by copying `config\config.example.json` into `config\config.json`
3. Run `npm install` to install all module
4. Run `npx sequalize db:migrate` to migrate all database
5. Run bot in development mode using this command:

    ```
    node start
    ```

    Bot will restart every code changes occure
6. Happy Development!