# ft_transcendence by ft_ball_busters
This is a 42 School project completed by a group of 5 students. Listed in alphabetical order are.

Michiel([mteerlin](https://www.github.com/ArgentumLunae)), Nick([ngerrets](https://www.github.com/nickgerrets)), Patrick([pdruart](https://www.github.com/MrCrackerplays)), Yuliia([ydemura](https://www.github.com/ydemura)), Zach ([znajda](https://www.github.com/ZachRN))

This project is about connecting both a frontend and backend created from scratch to play Pong on a website, along with several other features.

# Compilation

After cloning the project you must first complete additonal steps before the project compiles.

First add a `.env` file into the `/backend` folder. This `.env` should be as follows.

```
POSTGRES_HOST=#HOST NAME
POSTGRES_PORT=#PORT
POSTGRES_USER=#USER
POSTGRES_PASSWORD=#PASSWORD
POSTGRES_DB=#DATABASE NAME

JWT_SECRET=#JWT SECRET KEY
ID42= #INTRA 42 PUBLIC KEY
SECRET42= #INTRA 42 SECRET KEY
CALLBACK42= #THE CALL BACK LINK FROM INTRA 42
```

After the `.env` has been updated to include all required components open a terminal and run

`docker-compose up --build`

Then you should be all ready to access the website hosted on your machine. Enjoy playing pong!
