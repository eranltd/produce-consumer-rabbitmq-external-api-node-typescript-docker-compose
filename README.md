# **data-management-interview**

### Description
This repository contains the technical interview assignment for the data management team.

---

## Assignment Overview

Your task is to process and store street name data from Israel into a database using a queueing platform. The assignment must be implemented in **Node.js** with **TypeScript**, adhering to the following versions:
- **Node.js**: 16.X
- **npm**: 8.X
- **TypeScript**: 4.X

### Key Details:
- A `StreetsService` class is provided to fetch data from the API.
- A list of cities is available in the `cities.ts` file.
- You may modify the `StreetsService` class if needed.
- Raw data can be accessed [here](https://data.gov.il/dataset/israel-streets-synom/resource/1b14e41c-85b3-4c21-bdce-9fe48185ffca).

---

## Requirements

1. **Database**: Choose either an SQL or NoSQL database (e.g., MongoDB, SingleStore).
2. **Queueing Platform**: Use a queueing service (e.g., RabbitMQ, Kafka). You may use the provided dependencies or add your own.
3. **Services to Implement**:
	- **Publishing Service**:
	  - A CLI tool that accepts a city name as input.
	  - Fetches street data for the specified city using the `StreetsService`.
	  - Publishes the data to the queueing platform.
	- **Consuming Service**:
	  - Listens for messages from the queueing platform.
	  - Saves the street data into the selected database.
	- Ensure all data from the API is persisted.

---

## Provided Tools

A `docker-compose` file is included with the following services:

### Databases:
1. **MongoDB**:
	- NoSQL database (Version: 4.2).
	- Accessible at `localhost:27017`.
	- Connect using Robo 3T/Studio 3T ([Download Robo 3T](https://robomongo.org/)).

2. **SingleStore**:
	- SQL database (MySQL-compatible).
	- Accessible at `localhost:3306`.
	- UI Studio available at `localhost:8012`.
	  - **Credentials**:
		- Username: `root`
		- Password: `Password1`

### Queueing Platforms:
1. **RabbitMQ**:
	- Backend: `localhost:5672`
	- Management UI: `localhost:15672`
	  - **Credentials**:
		- Username: `guest`
		- Password: `guest`

2. **Redpanda**:
	- Kafka-compatible platform.
	- Broker: `localhost:9092`
	- UI: `localhost:8014` (no authentication required).

> **Note**: You may use other services if they meet the assignment requirements.

---

## Submission Instructions

1. Push your completed assignment to a new repository.
2. Send the repository link via email to:
	- info@dataloop.ai
	- reut@dataloop.ai

For any questions, feel free to reach out to the above email addresses.

Good luck!

---

## Running the Assignment

### Adjustments for M1 MacBook Pro:
If you're using an M1 MacBook Pro, ensure the `docker-compose` file specifies the platform as `linux/amd64/v8`.

### Commands:
- **Start Services**:
  ```bash
  docker compose up -d
  ```
- **Stop Services**:
  ```bash
  docker compose down -v
  ```
  *(Remove the `-v` flag if you want to retain data in the volumes.)*

### RabbitMQ Health Check:
- Verify RabbitMQ is running:
  ```bash
  nc -zv localhost 15672
  nc -zv localhost 5672
  ```
- Access RabbitMQ Management UI:
  - URL: [http://localhost:15672](http://localhost:15672)
  - Username: `guest`
  - Password: `guest`

---

## Service Overview

1. **Consuming Service**:
	- A long-running process that listens for new messages from the queueing platform.
	- Receives messages and saves the data to the database.

2. **Publishing Service**:
	- A CLI script executed on demand.
	- Accepts a city name as an argument (e.g., `node publisher.js "Tel Aviv"`).
	- Fetches street data using the `StreetsService`.
	- Publishes the data to the queue.
	- Exits upon completion.

---

## Example Usage

1. Start the services:
   ```bash
   docker compose up -d
   ```

2. Run the publisher for a specific city (e.g., Haifa):
   ```bash
   npm run publisher-ts Haifa
   ```

3. Run the consumer to process the data:
   ```bash
   npm run consumer-ts
   ```

---

## Visual Demonstration

Below are two short GIFs demonstrating the entire process:

1. **Publishing Data**: Shows how to run the publisher and send data to the queue.
2. **Consuming Data**: Shows how to run the consumer and save data to the database.

1. **Publishing Data**:  
	![Publishing Data](./demo/poc_1.gif)

2. **Consuming Data**:  
	![Consuming Data](./demo/poc_2.gif)


## TODOs

- Add linter
- Add formatter
- Add rate limiter
- Add graceful shutdown
- Add tests
- Add documentation
- Add error handling
- Add logging
- Add monitoring
- Add health checks
- Add retry mechanism for failed messages
- Add dead-letter queue for failed messages
- Add environment variables for configuration
