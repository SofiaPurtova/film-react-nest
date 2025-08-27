# Этап сборки
FROM node:18-alpine AS build

WORKDIR /app

# Копируем файлы зависимостей и устанавливаем их
COPY package*.json ./
RUN npm ci

# Копируем весь исходный код и собираем проект
COPY . .
RUN npm run build

# Финальный образ - только статические файлы и nginx
FROM nginx:alpine

# Копируем собранные файлы из стадии 'build' в папку nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем кастомную конфигурацию nginx
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80