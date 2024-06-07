FROM node:21.7.3-alpine3.20

WORKDIR /app

COPY . .
RUN npm install

EXPOSE 3000

ENTRYPOINT ["npm", "run", "start:prod"]
