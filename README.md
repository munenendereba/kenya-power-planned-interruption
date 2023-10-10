# Kenya Power Planned Power Interruption Notifier

A project to improve access to Kenya Power Planned Power Interruption publications which appear on their [website](https://www.kplc.co.ke/category/view/50/planned-power-interruptions) and on their [twitter handle](https://twitter.com/KenyaPower_Care).

## Problem

There is currently no accessible way to know if your area will be affected by planned power interruption. For most Kenyans, this comes as a suprise when around 9am, your power goes off. You reach out to Kenya Power customer service who then tell you that there is a planned maintenance on your line and this was published on their website.

On the website, the information is available as a pdf download which you then need to open and check a week before. These are published once a week.

Alternatively, you can check on their twitter handle which is published the night before as a screenshot.

The information is not easily searchable especially if you are on mobile.

## Description

The solution aspires to accomplish the following:

- Automated pdf and screenshot downloader
- Read the contents and insert into a SQL db
- Web app to display the scheduled maintenance by date and are
- Allow users to update their email and area they need notifications for
- Send automated notifications to users who subscribe to the feed

## Getting Started

### Dependencies

- You need Node installed in your environment
- npm packages required: express, sharp, morgan-body, mariadb, sequelize, body-parser, ejs and nodemon (for dev auto-restart)

### Installing

- Just clone the repo or download from this repo
- Copy to a directory in your computer.

#### Set up your .env

Using the [.env.example](./.env.example) file, edit the values of the db connection as you wish, then rename the file as .env.

Ensure you are able to connect to the db.

#### Run the migration

Run the migration to create the tables in the db using the command below:

`npx sequelize-cli db:migrate`

The output should be as below:

![Run migration](resources/images/run-migration.png?raw=true "Run migration")

Check the db to confirm the tables have been created.

#### Run the seed

Run the seed to populate the tables in the db using the command below:
`npx sequelize-cli db:seed:all`

The output should be as below:
![Run seeder](resources/images/run-seeder.png?raw=true "Run seeder")

Check the db to confirm the tables region, county and app-config have been populated.

#### Run the app

Run the app using the command below:
`npm run dev`

The output should be as below:

![Run app](resources/images/run-app.png?raw=true "Run app")

Check in your browser or postman to confirm the app is running by accessing the url: http://localhost:3000 . The output should be as below:

![Alt text](resources/images/app-running.png?raw=true "App running")

#### Set up postman

Import the postman collection from the folder resources/postman-collection into your postman. This will allow you to test the endpoints. Ensure you have the environment {{baseUrl}} set to http://localhost:3000 or the url where you are running the app.

#### Update the app-config table

Call the app-config update endpoint to update the folder to save the pdfs and screenshots. The endpoint is: http://localhost:3000/app-config and the method is PUT. The body should be as below:

```
{
    "remoteUrl": "https://www.kplc.co.ke/category/view/50",
    "downloadPath": "/root/node-apps/kenya-power-ppi-files",
    "twitterAccount": "KenyaPowerCare"
}
```

### Executing program

- Install all the dependencies as shown above by running commands below

```
npm init -y
```

If any dependency is not installed, you can install as below:

```
- npm install express sharp morgan-body sequelize ejs mariadb body-parser
- npm install --save-dev nodemon
```

Start the application using the normal npm commands:

```
npm run dev
```

#### Scraping the website

To scrape the website, call the endpoint under download folder: http://localhost:3000/get-upload-files. The method is POST. This call will update the file-details table in the db with the list of files to download. Each record will have the field of downloadStatus set to "pending".

#### Downloading the files

To download the files, call the endpoint under download folder: http://localhost:3000/download-files. The method is POST. This call will download the files (whose downloadStatus is "pending") from the website and save them in the folder specified in the app-config table.

#### Parsing the files

To parse the files, call the endpoint under download folder: http://localhost:3000/parse-files. The method is POST. This call will parse the files (whose parseStatus is "pending") and update the parseStatus as "completed" and the parseText with the JSON data that has been constructed from the parsed pdfs.

## Packages used

- [express](https://www.npmjs.com/package/express) for handling server requests and routing
- [express-validator](https://www.npmjs.com/package/express-validator) for validating and sanitizing inputs
- [ejs](https://www.npmjs.com/package/ejs) template engine for node to create front-end pages
- [body-parser](https://www.npmjs.com/package/body-parser) enable parsing of requests and responses
- [cheerio](https://www.npmjs.com/package/cheerio) for parsing scraped data
- [dotenv](https://www.npmjs.com/package/dotenv) for loading environment variables from .env file
- [mariadb](https://www.npmjs.com/package/mariadb) for handling connection to MariaDB database
- [sequelize](https://www.npmjs.com/package/sequelize) ORM for handling db CRUD operations
- [morgan-body](https://www.npmjs.com/package/morgan-body) to log requests and responses
- [nodemon](https://www.npmjs.com/package/nodemon) auto-restart the node application when changes are made and saved to files - Dev environment

## Improvements

The project needs to improve in the following:

-

## Help

If you get errors when processing, check the following:

-

## Authors

[Munene Ndereba](https://github.com/munenendereba)

## Version History

- 0.0.1

  - Initial release
  - See [commit change]()

## License

This project is licensed under the MIT License.

## References and Acknowledgments

- [Kenya Power PPI](https://www.kplc.co.ke/category/view/50)
- [Kenya Power Regions](https://www.kplc.co.ke/content/item/830/kenya-power-regions)
