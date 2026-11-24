FROM nginx:alpine
COPY index.html styles.css game.js game-data.json manifest.json icon.svg sw.js /usr/share/nginx/html/
EXPOSE 80
