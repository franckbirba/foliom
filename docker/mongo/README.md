# NGinx for ePortfolio
## Development workflow
Build
- `-t`: Tag used on Docker Hub
```bash
docker build -t pemarchandet/mongo-eportfolio .
```
Run
- `-d`: Deamon mode
- `--name`: Name used for linking containers
- `-p`: Port on the Docker Host and port on the Docker Container
```bash
docker run --name mongo-eportfolio -d -p 27017:27017 pemarchandet/mongo-eportfolio
```
Checking status
```bash
docker ps
```

### Troubleshooting
See NGinx's README.md for basic troubleshooting.
