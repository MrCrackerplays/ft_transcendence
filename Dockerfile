FROM node:18

# Create app directory
WORKDIR /usr/src/app


COPY ./backend ./backend
COPY ./frontend ./frontend
COPY ./shared ./shared

RUN cd backend && npm install

RUN cd frontend && npm install

COPY ./tools ./

RUN chmod +x ./entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
