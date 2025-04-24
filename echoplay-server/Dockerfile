# Use Node.js base image
FROM node:18

LABEL org.opencontainers.image.source=https://github.com/jacobanana/echoplay

# Set working directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .
RUN npm run build

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "run", "start-server"]
