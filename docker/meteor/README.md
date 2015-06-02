# Meteor for ePortfolio
## Development workflow
### Requirements
The source import is based on [demeteorizer](https://github.com/onmodulus/demeteorizer):
```bash
npm install -g demeteorizer
```
### Import sources
```bash
./import.sh
```
### Build
- `-t`: Tag used on Docker Hub
```bash
docker build -t pemarchandet/meteor-eportfolio .
```
### Run
- `-d`: Deamon mode
- `--name`: Name used for linking containers
- `-p`: Port on the Docker Host and port on the Docker Container
```bash
docker run -d -p 3000:3000 --link mongo-eportfolio:mongo-eportfolio --name meteor-eportfolio pemarchandet/meteor-eportfolio
```
Checking status
```bash
docker ps
```
## Production commands
```bash
docker pull pemarchandet/meteor-eportfolio:latest
docker run -d -p 3000:3000 --link mongo-eportfolio:mongo-eportfolio --name meteor-eportfolio pemarchandet/meteor-eportfolio
```

## Troubleshooting
See NGinx's README.md for basic troubleshooting.

Hereafter only command specific to this container are exposed:

### Connect (attach) to the container
```bash
docker exec -ti meteor-eportfolio bash
```
### Connect to a failed container (container that has exited)
```bash
docker run -ti -P pemarchandet/meteor-eportfolio bash
```
### Check the logs of a container
```bash
# Checking log with exiting
docker logs -f pemarchandet/meteor-eportfolio
# Checking the last log and exit
docker logs pemarchandet/meteor-eportfolio
```
