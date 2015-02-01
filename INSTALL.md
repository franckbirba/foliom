# Installation instructions
## Local OSX requirements
### Homebrew and Cask
Installing [Homebrew](http://brew.sh/):
```bash
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

Installing [Cask](https://github.com/caskroom/homebrew-cask):
```bash
brew install caskroom/cask/brew-cask
```

> In case a problem arise, you can use a `tap` (a specific brew formula):
> ```bash
> brew update
> brew uninstall brew-cask
> brew untap caskroom/cask
> brew tap caskroom/cask
> brew install brew-cask
> ```

Upgrading and updating formulas:
```bash
brew update
brew upgrade
brew cask update
```

### Installing a server locally: VirutalBox, Vagrant and Ubuntu
DevOps methodology favors local installation mirroring metal ones. This is
achieved by recreating a full virtualized server locally that mimics the
behavior of the real server.

Installing [VirtualBox](https://www.virtualbox.org/) and [Vagrant](https://www.vagrantup.com/):
```bash
brew cask install virtualbox
brew cask install vagrant
```

### Installing SaltStack
[SaltStack](http://saltstack.com/) is a deployment and orchestration
set of utilities. Very close to OpenStack, Chief, Puppet, Ansible, ...
Based on Python, it has been available for a long time and is used as the
first DevOps tools for company such as LinkedIn, Twitter, Rackspace, Nasa, Hulu
on their large scale infrastructure.

[SaltStack](http://saltstack.com/) offers a great advantage over its competitors
in terms of ease of setup and environment agnosticism, making it capable of
pouring a simple VM, a bare metal server, an hosted cloud solution or a
dedicated cloud infrastructure without modifying the recipes that you've
written. It can even handle container based hosting solutions that relies on
[Docker](https://www.docker.com/).

```bash
brew install saltstack
```

> Why not Docker? Docker based deployment could be a great
  alternative to VirtualBox, Vagrant and SaltStack as far as
  the chosen hosting solution is able to handle Docker. OVH
  provides capabilities of using Docker throughout its RunAbove
  offer. Unfortunately and though, very solid,this offer is not
  yet ready for production and is offered as a beta service.


### Installing Meteor
This application is based on [Meteor](https://www.meteor.com/).
Its installation is done in single command line, providing every bits of it
(MongoDB, NodeJS, the Meteor's framework):
```bash
curl https://install.meteor.com/ | sh
```

### Getting the latest application code
The application's source code is publicly available on [Github](https://github.com/). For fetching the source, it is
preferable to use the `git` command:
```bash
brew install git
```

Now, fetching the source is easily achieved via:
```bash
git clone https://github.com/Benczyk/foliom.git
```

## Running the application
### As part of your OSX environment
Hop in the source repository and launch [Meteor](https://www.meteor.com/):
```bash
cd foliom/app
meteor
open http://localhost:3000
```

### Launch the local virtualized server
