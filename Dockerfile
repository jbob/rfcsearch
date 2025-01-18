FROM node:lts-alpine

WORKDIR /app
COPY . .
RUN npm install
ENTRYPOINT ["node"]
CMD ["index.mjs", "server"]
EXPOSE 3000
