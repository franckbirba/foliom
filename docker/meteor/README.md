# Meteor for ePortfolio
## Development workflow
Build
- `-t`: Tag used on Docker Hub
```bash
docker build -t pemarchandet/meteor-eportfolio .
```
Run
- `-d`: Deamon mode
- `--name`: Name used for linking containers
- `-p`: Port on the Docker Host and port on the Docker Container
```bash
docker run --name meteor-eportfolio -d -p 3000:3000 pemarchandet/meteor-eportfolio
```
Checking status
```bash
docker ps
```

### Troubleshooting
See NGinx's README.md for basic troubleshooting.

Hereafter only command specific to this container are exposed:

Connect (attach) to the container
```bash
docker exec -i -t meteor-eportfolio bash
```
Connect to a failed container (container that has exited)
```bash
docker run -ti -P pemarchandet/meteor-eportfolio bash
```
Check the logs of a container
```bash
# Checking log with exiting
docker logs -f pemarchandet/meteor-eportfolio
# Checking the last log and exit
docker logs pemarchandet/meteor-eportfolio
```
