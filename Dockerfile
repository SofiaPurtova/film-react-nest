# ./Dockerfile.nginx (в корне проекта)
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
# Копируем конфиг из папки nginx/
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
# Копируем фронтенд из папки frontend/dist/
COPY ./frontend/dist /usr/share/nginx/html