FROM nginx:stable-alpine

# This game is already static HTML/CSS/ES modules: Node is not needed in the image.
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY index.html style.css /usr/share/nginx/html/
COPY src/ /usr/share/nginx/html/src/

USER nginx
EXPOSE 8080
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
