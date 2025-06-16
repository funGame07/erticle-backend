# Use Node.js LTS version
FROM node:21

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# The port that the app runs on
EXPOSE 3000

# Command to run the app
CMD [ "node", "app.js" ]