FROM node:16.17.1  As builder
WORKDIR /app
COPY . ./
RUN yarn install
RUN yarn run build-all

FROM gcr.io/distroless/nodejs16-debian11:nonroot As production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER nonroot
ENTRYPOINT ["/nodejs/bin/node", "--es-module-specifier-resolution=node","./dist/tsc/main.js"]
