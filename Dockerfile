# ===== Build Stage =====
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# ===== Production Stage =====
FROM node:22-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# dist と drizzle フォルダ、drizzle.meta をコピー
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/src ./src   # migrate.js が dist にあるなら不要
COPY --from=builder /app/drizzle/meta ./drizzle/meta

CMD ["npm", "run", "start"]


# ===== Development Stage =====
FROM node:22-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "dev"]
