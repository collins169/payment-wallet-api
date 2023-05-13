# Use the official Node.js image as the base image
FROM node:16-alpine

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to /app directory
COPY package*.json ./

# Install dependencies
RUN yarn install

# Copy the rest of the application code to /app directory
COPY . .

# Expose port 3000 to the outside world
EXPOSE 4000

# Start the application
CMD ["yarn", "start"]
