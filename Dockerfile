# Официальный Node.js образ
FROM node:18-alpine

# Рабочая директория внутри контейнера
WORKDIR /app

# Копируем зависимости
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходники
COPY . .

# Сборка проекта NestJS
RUN npm run build

# Открываем порт (должен соответствовать переменной PORT)
EXPOSE 3000

# Запуск backend в продакшене
CMD ["npm", "run", "start:prod"]
