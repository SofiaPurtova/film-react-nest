# Этап сборки
FROM node:18-slim AS build  # <- ИЗМЕНИТЬ НА slim

WORKDIR /app

# Копируем файлы зависимостей и устанавливаем их
COPY package*.json ./
RUN npm ci

# Копируем весь исходный код
COPY . .

# Собираем проект
RUN npm run build

# Этап запуска
FROM node:18-slim AS production

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]