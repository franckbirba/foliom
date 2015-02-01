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
  ```bash
  brew update
  brew uninstall brew-cask
  brew untap caskroom/cask
  brew tap caskroom/cask
  brew install brew-cask
  ```

Upgrading and updating formulas:
```bash
brew update
brew upgrade
brew cask update
```

### Installing a server locally: Vagrant and Ubuntu
DevOps methodology favors local installation mirroring metal ones. This is
achieved by recreating a full virtualized server locally that mimics the
behavior of the real server.
