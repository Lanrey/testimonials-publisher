FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN npm install

COPY . .

WORKDIR /app
EXPOSE 5173

CMD ["npm", "--workspace", "apps/web", "run", "dev", "--", "--host", "0.0.0.0"]
