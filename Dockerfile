FROM node:slim
WORKDIR /app
COPY . /app
RUN npm install
EXPOSE 8080
RUN npm test
CMD node app.js