FROM node:18

# Create app directory
WORKDIR /usr/src/app


COPY ./backend ./backend
COPY ./frontend ./frontend
COPY ./shared ./shared

RUN cd backend && npm install
# If you are building your code for production
# RUN npm ci --omit=dev


RUN cd frontend && npm install

# Bundle app source

COPY ./tools ./

RUN chmod +x ./entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
