# **data-management-interview**

### Description
 - Public repository with the data management team's technical interview assignment inside  
 ---

## Assignment specification:
Your assignment is to insert data about street names in israel to a database, using some kind of a queueing platform.\
The assignment is to be done in nodejs + Typescript (node version 16.X, npm version 8.X, typescript version 4.X).\

Inside of the repository you will find a StreetsService class which provides you the data from the api.\

The list of cities is provided inside of the cities.ts file.\

Feel free to make changes to the StreetsService class if you feel they are necessary.
 - If you want to take a look at the raw data - https://data.gov.il/dataset/israel-streets-synom/resource/1b14e41c-85b3-4c21-bdce-9fe48185ffca

To complete the assignment you will need to select a database, sql or no-sql (for example: mongo, singlestore) and a queueing service (for example - rabbitmq, kafka), either from the provided dependencies, or one of your choice (commit it to your solution if you chose a different one).\

You will need to create two services:
 - Publishing service - A service that will get the data from the StreetsService and publish it to the queuing platform
 - A service that will consume the data from the queuing service and persist it to the database

 Publishing service specification:
  - Will be activated by CLI, accepting a city name from the list of cities
  - Will query the StreetsService for all streets of that city
  - Will publish to the queuing platform the streets it needs to insert

Consuming service specification:
  - Will consume from the messaging queue
  - Will persist the streets data to the selected database

The persisted streets need to contain all data from the api
---
## Provided dependencies:
 Provided is a docker-compose file which contains all of the dependencies that you will need to complete the assignment.\
 **You do not need to lift all of the services**, you can choose which you need as listed in the assignment specification.
 ### The docker-compose exposes the following services:
  - mongoDB
  	- No-sql database, Version - 4.2
	- exposed on localhost port  27017
	- Can be connected to with robo3t/ studio 3t with no need for authentication - https://robomongo.org/
  - Singlestore (formerly memsql)
  	- ANSI SQL compliant and MySQL wire protocol compatible SQL database
	- exposed on port 3306
	- UI studio is exposed on port 8012
		- Authentication:
			- Username: root
			- Password: Password1
 - RabbitMQ
	- backend exposed on port 5672
	- management UI exposed on port 15672
		- Authentication:
			- Username: guest
			- Password: guest
 - Redpanda
	- Fully Kafka-api compatible data streaming platform
	- Kafka broker exposed on port 9092
	- UI exposed on port 8014 with no need for authentication

If you would like to a different service for a database/queueing system feel free to do so, as long as they adhere to the assignment specifications

---
When you finish the assignment please push it to a different repository and send me the link via email\
If you have any questions about the assignment you can send them to info@dataloop.ai or reut@dataloop.ai\
Good luck!


//spin-up

# To run the assignment, we need to make adjustments to the docker-compose file to ensure compatibility with the current environment.
- i'm running it on macbook pro with M1 chip, so we need to specify the platform for the services to run on linux/amd64/v8

# To spin up the services, run the following command:
docker compose up -d
# To stop the services, run the following command:
docker compose down -v //remove the -v flag if you want to keep the data in the volumes

# Check RabbitMQ is live:
nc -zv localhost 15672
nc -zv localhost 5672

# Access RabbitMQ management UI:
http://localhost:15672
# Username: myuser
# Password: mypassword

# what's running:
```
1. The Consuming Service Script
This is a long-running process. it will stay running in the background once you run it, constantly listening for new messages to arrive from the queuing platform. Its only job is to receive a message and save the data it contains to your database.

2. The Publishing Service Script
This is a script that you run on demand from your command line (CLI). It is not a process that runs continuously. Each time you run it, you will provide a city name as an argument (e.g., node publisher.js "San Francisco"). The script will then:

Query the StreetsService.

Publish the street data it receives to the queue.

Exit once it's done.
```