FROM debian:buster

RUN apt-get update
RUN apt-get -y install nodejs npm

EXPOSE 5173

COPY ./tools /var/www 
COPY ./backend /var/www/backend
COPY ./frontend /var/www/frontend

RUN chmod +x /var/www/entrypoint.sh

ENTRYPOINT ["/var/www/entrypoint.sh"]
