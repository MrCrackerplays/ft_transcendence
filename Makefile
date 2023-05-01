#any variables to be set here


#unsure if there will be any building/compiling done or if it'll run the scripts directly
#update to only use run if there is no compiling
all:

run: all
	cd backend/ && docker-compose up --build

down:
	cd backend/ && docker-compose down

dev:
	-cd backend/ && docker-compose up -d
	cd backend/ && npm run start:dev

exec:
	docker exec -it postgres psql -U admin -h localhost -d transcendence

.PHONY: all run dev down exec
