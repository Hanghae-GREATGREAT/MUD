FROM node:18.12.1

EXPOSE 3333

WORKDIR /home/node/server
COPY server /home/node/server

RUN npm install
RUN npm run build
CMD npm start
# CMD npm run dev