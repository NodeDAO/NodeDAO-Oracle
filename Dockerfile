FROM node:16.17.1  As builder
WORKDIR /usr/src/app
COPY . .
RUN yarn install
RUN yarn run build-all

FROM node:16.17.1-alpine As production
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
ENTRYPOINT ["node", "--es-module-specifier-resolution=node","./dist/tsc/main.js"]
