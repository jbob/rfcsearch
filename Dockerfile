FROM node:lts-alpine

WORKDIR /app/
COPY . .
RUN cd frontend && \
    npm install && \
    npm run build && \
    cd .. && rm -rf frontend && \
    cd backend && \
    npm install
WORKDIR /app/backend
ENTRYPOINT ["node"]
CMD ["index.mjs", "server", "--proxy", "--cluster", "1"]
EXPOSE 3000
