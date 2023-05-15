# Payments Wallet Backend API Service

This is a backend API service for a payments wallet. The API service allows users to:

- Create an account
- Log in to their account
- View their account balance
- Transfer funds to another user's account
- View their transaction history

## Technologies Used

- GraphQL for the API layer
- Node.js for the backend server
- MongoDB for the database
- TypeScript for the code
- Kafka for messaging between services


## Requirements

1. Implement a GraphQL schema that allows users to:
   - Create an account by providing their name, email, and password
   - Log in to their account by providing their email and password
   - View their account balance
   - Transfer funds to another user's account by providing the recipient's email and the amount to transfer
   - View their transaction history
2. Implement a backend server using Node.js that:
   - Connects to the MongoDB database
   - Implements the GraphQL API using the schema defined in step 1
   - Implements the following resolvers:
     - A resolver for creating an account
     - A resolver for logging in to an account
     - A resolver for fetching the user's account balance
     - A resolver for transferring funds to another user's account
     - A resolver for fetching the user's transaction history
   - Produces a Kafka message when a transfer is made
3. Implement a MongoDB database that stores user information, including the name, email, password, account balance, and transaction history.
4. Use TypeScript for all code.
5. Implement error handling and validation for all user input.
6. Use the Confluent Cloud cluster to create a topic to store transaction events and to produce transaction events.
7. Bonus (not mandatory): Implement a consumer that listens to transaction events and logs them to the console.

## Project Structure

Click [here](https://www.loom.com/share/cd70b906bc3f453ba16174d087b9ec90) to watch a video explaining the project structure.

## How to Run

### Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/collins169/payment-wallet-api.git
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Copy the `.env.example` file to `.env` and fill in the required environment variables.

4. Start the server:

   ```bash
   yarn start
   ```

### Docker

1. Clone the repository:

   ```bash
   git clone https://github.com/collins169/payment-wallet-api.git
   ```

2. Run docker-compose:

   ```bash
   docker-compose up -d
   ```

The API service should now be running on `http://localhost:4000/`. You can use a GraphQL client like [GraphiQL](https://github.com/graphql/graphiql) to interact with the API or launch the URL in a browser.

## Sample accounts

#### Alice Manny
- Email: alice@test.com
- Password: testpassword

#### Bob Joe
- Email: bob@test.com
- Password: testpassword

## List of Endpoints

- `POST /` - The endpoint for the GraphQL API. All requests should be sent to this endpoint.

### Query Examples

```graphql
# View account balance
query {
  balance
}

# View transaction history
query {
  transactions {
    sender {
      name
      email
    }
    recipient {
      name
      email
    }
    amount
    status
    reason
    timestamp
  }
}
```

#### Mutation Examples

```graphql
# Create an account
mutation {
  signUp(
    name: "John Doe"
    email: "johndoe@example.com"
    password: "password123"
  ) {
    id
    name
    email
  }
}

# Log in to an account
mutation {
  login(
    email: "johndoe@example.com"
    password: "password123"
  ) {
    token
    account {
      id
      name
      email
    }
  }
}

# Transfer funds
mutation {
  transfer(
    email: "janedoe@example.com"
    amount: 50
  ) {
    id
    sender {
      name
      email
    }
    recipient {
      name
      email
    }
    amount
    status
    reason
    timestamp
  }
}
```

The following operations are supported:

- `signup`: Creates an account with the specified name, email, and password. Returns the created user's account details.

- `login`: Logs the user in with the specified email and password. Returns an authentication token and the user's account details.

- `account`: Returns the account details of the specified user.

- `transfer`: Transfers funds from the currently authenticated user's account to the specified recipient's account. Returns the transaction details.

- `transactions`: Returns a list of the authenticated user's transactions.

## Testing

To run the tests, run:

```
yarn test
```

## Error Handling and Validation

This project includes error handling and validation for all user input. Errors are returned as GraphQL errors with an appropriate status code.

### Areas for code Improvements
- implement a notification service
- implement a good consumer handlers
- add integration tests
- more unit tests
