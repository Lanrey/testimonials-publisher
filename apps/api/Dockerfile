FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN npm install

COPY . .

WORKDIR /app
EXPOSE 8787

CMD ["npm", "--workspace", "apps/api", "run", "dev"]
