# Docker
## Resources
* https://meteorhacks.com/docker-container-war-and-meteor

## Requirements
### OSX
Boot2Docker and Docker installation:
```bash
brew install boot2docker
# Launch Boot2Docker at startup
ln -sfv /usr/local/opt/boot2docker/*.plist ~/Library/LaunchAgents
launchctl load ~/Library/LaunchAgents/homebrew.mxcl.boot2docker.plist
brew cask install boot2docker-status
```

> **NOTE** Info on using [boot2docker-status](https://github.com/nickgartmann/boot2docker-status)
> On the menu, use cmd+click

For Bash completion:
```bash
brew install homebrew/completions/boot2docker-completion
brew install homebrew/completions/docker-completion
```

> **NOTE** For zsh and fish completion, please refer to the following
> repository: https://github.com/docker/docker/tree/master/contrib/completion

Launching Docker Host:
```bash
boot2docker init
boot2docker up
# Getting the status (as displayed by boot2docker-status)
boot2docker status
boot2docker info
# Setting shell variables
# /!\ COPY THE ENV VARIABLE AS DOCKER SAYS IT /!\
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
Before anything create an account on [Docker Hub](https://hub.docker.com/).

```bash
# Login to Docker Hub
docker login
# Enter your login, password and email as used on Docker Hub
# Get the IP of the Docker Host
boot2docker ip
# Also available via the environment variables set previously
echo $DOCKER_HOST
```
Now refers to each appropriate README page in the subdirectories for build
and run instructions.

### On production server
ePortfolio is built with 3 containers:
* pemarchandet/mongo-eportfolio: The Mongo DB with a specific volume named **db**.
* pemarchandet/meteor-eportfolio: The application server.
* pemarchandet/nginx-eportfolio: The proxy cache with GZip enabled.

Each container is linked in a natural way so that they pass the appropriate
environment variables to their calling container using the Docker Link
properties as well as the hosts file automatic creation.

:warning: On the Docker Host only the port 80 have to be exposed.

```bash
# Get the Mongo DB from Docker Hub
docker pull pemarchandet/mongo-eportfolio:latest
# Launch the Mongo DB on the Docker Host
docker run -d -p 27017:27017 --name mongo-eportfolio pemarchandet/mongo-eportfolio
# Get the application server from Docker Hub
docker pull pemarchandet/meteor-eportfolio:latest
# Launch the application server on the Docker Host
docker run -d -p 3000:3000 --link mongo-eportfolio:mongo-eportfolio --name meteor-eportfolio pemarchandet/meteor-eportfolio
# Get the proxy cache from Docker Hub
docker pull pemarchandet/nginx-eportfolio:latest
# Launch the application server on the Docker Host
docker run --link meteor-eportfolio:meteor-eportfolio --name nginx-eportfolio -d -p 80:80 pemarchandet/nginx-eportfolio
```
