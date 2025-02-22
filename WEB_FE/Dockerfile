FROM node:20.9.0-alpine

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json /app

# Copy the current directory contents to the container at /app
COPY . /app

# Install dependencies
RUN cd /app && npm ci --legacy-peer-deps

# Build & serve production
RUN npm run build

# Expose port 4000
EXPOSE 4000
