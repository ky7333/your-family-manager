FROM node:22-alpine AS build
WORKDIR /app

COPY web/package*.json ./web/
COPY packages/design-tokens ./packages/design-tokens

WORKDIR /app/web
RUN npm install

COPY web/ ./
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
