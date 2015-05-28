# Docker
## Resources
* https://meteorhacks.com/docker-container-war-and-meteor

## Requirements
### OSX
```bash
brew install boot2docker
ln -sfv /usr/local/opt/boot2docker/*.plist ~/Library/LaunchAgents
launchctl load ~/Library/LaunchAgents/homebrew.mxcl.boot2docker.plist
brew cask install boot2docker-status
```

> Info on using [boot2docker-status](https://github.com/nickgartmann/boot2docker-status)
> On the menu, use cmd+click

Launching Docker Host:
```bash
boot2docker init
boot2docker up
# Getting the status (as displayed by boot2docker-status)
boot2docker status
boot2docker info
# Setting shell variables
# # COPY THE ENV VARIABLE AS DOCKER SAYS IT
boot2docker shellinit
# Connecting to local Docker via SSH
boot2docker ssh
# Upgrade the Docker Host
boot2docker upgrade
# Re-check if upgrade worked out
boot2docker info
boot2docker ssh
```
Checking Docker itself:
```bash
# Checking consistency
docker info
```
Troubleshooting
0. Delete current Docker Host instance
    ```bash
    boot2docker delete
    ```
0. VirtualBox > Preferences > Network > Host Only Networks
0. Remove all vboxnetXX (via button +)
0. Recreate one vboxnet0 (via button +)
0. Restart Docker Host
    ```bash
    boot2docker download
    boot2docker init
    boot2docker up
    ```



### Linux
* https://github.com/docker/machine

## Possible solutions
* https://github.com/meteorhacks/meteord
* https://github.com/chriswessels/meteor-tupperware

## Possible enhancements
- https://meteorhacks.com/introducing-multi-core-support-for-meteor

## Installation
```bash
cd app
docker build -t pem/eportfolio .
```

## Launch the Dockered ePortfolio
### On localhost
```bash
docker run --rm \
-e ROOT_URL=http://localhost.com \
-e MONGO_URL=mongodb://url \
-e MONGO_OPLOG_URL=mongodb://oplog_url \
-p 8080:80 \
pem/eportfolio
```

### On production server
docker run --rm \
-e ROOT_URL=http://www.eportfolio.com \
-e MONGO_URL=mongodb://url \
-e MONGO_OPLOG_URL=mongodb://oplog_url \
-p 8080:80 \
pem/eportfolio
