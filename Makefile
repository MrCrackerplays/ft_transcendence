#any variables to be set here


#unsure if there will be any building/compiling done or if it'll run the scripts directly
#update to only use run if there is no compiling
all:

run: all
	docker-compose up --build

.PHONY: all run
