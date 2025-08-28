# Этап сборки
FROM node:18-alpine AS build

# Устанавливаем только openssl для решения проблемы с crypto
RUN apk add --no-cache openssl

WORKDIR /app

# Копируем файлы зависимостей и устанавливаем их
COPY package*.json ./
RUN npm ci

# Копируем весь исходный код
COPY . .

# Собираем проект
RUN npm run build

# Этап запуска
FROM node:18-alpine AS production

# Устанавливаем openssl и в production образ
RUN apk add --no-cache openssl

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]