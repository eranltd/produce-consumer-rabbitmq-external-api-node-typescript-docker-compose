# Q&A

## Why did we choose PostgreSQL as our main database for this assignment?

- **Structured Schema and Data Integrity**: PostgreSQL excels at enforcing a structured schema. Every street must have a name and belong to a city. I enforced this relationship using a `city_id` foreign key constraint, which guarantees that a new street cannot be added unless its corresponding city already exists in the `cities` table. This approach also allows for strict data typing and constraints like `NOT NULL` on critical fields, ensuring data integrity.

- **Flexibility with JSONB**: PostgreSQL's `JSONB` data type offers great flexibility. I can use a `JSONB` column to store the raw, unstructured data from the API. This is useful for archival purposes, debugging, or future analysis without needing to alter the core, structured schema.

## Why i chose RabbitMQ as the message broker? instead of Kafka?
- **Simplicity and Ease of Use**: RabbitMQ is generally easier to set up and use for smaller projects or simpler use cases. It has a straightforward configuration and management interface.

- **Message Acknowledgment**: RabbitMQ provides robust message acknowledgment features, which are essential for ensuring that messages are processed reliably. This is particularly useful in scenarios where you need to ensure that each street is processed exactly once.

## Overall Data Flow: (after the development setup has up and running)

let's summarize the overall data flow in this assignment:

-  CLI Tool: The user runs a CLI tool to publish street data for a specific city. This tool uses the `StreetsService` to fetch street data from the API.
-  Queueing Platform: The fetched street data is published to a RabbitMQ queue. This decouples the data fetching from the processing, allowing for asynchronous handling of the data.

-  Consumer Service: A consumer service listens to the RabbitMQ queue. When it receives a message (street data), it processes the data and saves it into the PostgreSQL database.

## potential bottlenecks and how to address them:

- **Database Connection Limits**: PostgreSQL has a limit on the number of concurrent connections. If the consumer service processes messages too quickly, it could exhaust the available connections. To mitigate this, we leverage the built-in connection pooling provided by Knex.js (which uses `tarn.js` under the hood). We have explicitly configured the pool size to control the number of concurrent connections, preventing the consumer from overwhelming the database.

- **Message Processing Speed**: If the consumer service is slower than the rate at which messages are produced, the queue may grow indefinitely. To address this, I can implement rate limiting in the consumer service or scale it horizontally by running multiple instances.
