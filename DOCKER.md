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

Launching docker:
```bash
boot2docker restart
# Getting the status (as displayed by boot2docker-status)
boot2docker info
# Setting shell variable (optional)
boot2docker shellinit
# Connecting to local Docker via SSH
boot2docker ssh
```

### Linux
* https://github.com/docker/machine

## Possible solutions
* https://github.com/meteorhacks/meteord
* https://github.com/chriswessels/meteor-tupperware

## Possible enhancements
- https://meteorhacks.com/introducing-multi-core-support-for-meteor
