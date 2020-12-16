# The first stage installs the node modules
FROM node:12-alpine as base

WORKDIR /home/node/app

COPY package*.json ./

RUN yarn install

COPY . .


# build files for production
FROM base as pre-production

RUN yarn build --production


# grab built files and serve with nginx
FROM nginx:alpine as production

COPY --from=pre-production /app/dist /usr/share/nginx/html

COPY conf /etc/nginx/conf.d

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]







