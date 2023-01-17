FROM harbor.creaverse.top/saas-test/node:14.16.1
WORKDIR /data/chainup/web3/kinghash-oracle
ADD ./dist/ ./
CMD ["node", "./tsc/main.js"]
