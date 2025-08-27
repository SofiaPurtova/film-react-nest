# Этап сборки
FROM node:18-alpine AS build

WORKDIR /app

# Копируем файлы зависимостей и устанавливаем их
COPY package*.json ./
RUN npm ci

# Копируем весь исходный код
COPY . .

# Собираем проект (это создаст папку dist)
RUN npm run build

# Этап запуска (используем тот же Node.js, но без dev-зависимостей)
FROM node:18-alpine AS production

WORKDIR /app

# Копируем package.json для установки только production-зависимостей
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Копируем собранное приложение из стадии 'build'
COPY --from=build /app/dist ./dist

EXPOSE 3000

# Команда для запуска приложения
CMD ["node", "dist/main.js"]