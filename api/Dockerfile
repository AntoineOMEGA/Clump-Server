FROM node:20-alpine

WORKDIR /user/src/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

CMD ["npm", "run", "start"]