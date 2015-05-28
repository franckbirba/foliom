# Docker
## Resources
* https://meteorhacks.com/docker-container-war-and-meteor

## Requirements
### OSX
```bash
brew install boot2docker
brew cask install boot2docker-status
```

> Info on using [boot2docker-status](https://github.com/nickgartmann/boot2docker-status)
> On the menu, use cmd+click

Launching Docker server:
```bash
boot2docker restart
# Getting the status (as displayed by boot2docker-status)
boot2docker info
# Setting shell variables
boot2docker shellinit
# Connecting to local Docker via SSH
boot2docker ssh
# Upgrade the Docker server
boot2docker upgrade
# Re-check if upgrade worked out
boot2docker info
boot2docker ssh
# Re-spin the shell variables
boot2docker shellinit
```
Installing Docker:
```bash
brew install docker
# Checking consistency
docker info
```
Troubleshooting
0. Delete current Docker server instance
    ```bash
    boot2docker delete
    ```
0. VirtualBox > Preferences > Network > Host Only Networks
0. Remove all vboxnetXX (via button +)
0. Recreate one vboxnet0 (via button +)


### Linux
* https://github.com/docker/machine

## Possible solutions
* https://github.com/meteorhacks/meteord
* https://github.com/chriswessels/meteor-tupperware

## Possible enhancements
- https://meteorhacks.com/introducing-multi-core-support-for-meteor
