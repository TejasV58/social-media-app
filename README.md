# social-media-app

Created api endpoints for the basic functionalties of a social medial app. For the backend **node.js and express** were used and **mongodb atlas** for database. The application was also tested using Mocha and chai. Finally the app was hosted on Render. Here is the link to deployed application: https://social-media-app-nodejs.onrender.com

## Steps to run application

Download or Clone the repository and navigate to repository on terminal. Run the following scripts on terminal:

### ` npm install `

To install all the dependencies related to the application.

### ` npm start `

Runs the app in the development mode.Application will be live on: [http://localhost:8080](http://localhost:8080) .

### ` npm test `

Launches the test runner in the interactive watch mode.

## Steps to create Docker image

#### `docker build -t [username]/[repo-name]:[tag] .`

To create a docker image file.

#### `docker container run -d -p [application-port]:[port-to-map-docker] [username]/[repo-name]:[tag]`

To run the docker image file.

#### `docker container stop [container-id]`

To stop the container.

#### docker push [username]/[repo-name]:[tag]

Push the docker image to docker hub.

---
#### ` docker pull tejasv58/social-media-app-nodejs:0.0.2:RELEASE `

To access already hosted image file run the following command
 `

