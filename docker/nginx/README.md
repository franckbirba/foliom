# NGinx for ePortfolio
## Development workflow
Import the static assets
```bash
./import.sh
```
Build
- `-t`: Tag used on Docker Hub
```bash
docker build -t pemarchandet/nginx-eportfolio .
```
Run
- `-d`: Deamon mode
- `-t`: Tag
- `-p`: Port on the Docker Host and port on the Docker Container
```bash
docker run --link meteor-eportfolio:meteor-eportfolio --name nginx-eportfolio -d -p 80:80 pemarchandet/nginx-eportfolio
```
Checking status
```bash
docker ps
```
Checking the `test.html`
```bash
open http://$(boot2docker ip)/test.hmtl
```

> **NOTE**
  You can ease the test setup by editing your `/etc/hosts` and add the
  Docker's host IP within.

  **Ex:**
  ```bash
  ##
  # Host Database
  #
  # localhost is used to configure the loopback interface
  # when the system is booting.  Do not change this entry.
  ##
  127.0.0.1       localhost
  255.255.255.255 broadcasthost
  ::1             localhost
  boot2docker.me  192.168.59.104
  ```
  Now you're able to do:
  ```bash
  open http://boot2docker.me/test.html
  ```
## Production
```bash
docker pull pemarchandet/nginx-eportfolio:latest
docker run --link meteor-eportfolio:meteor-eportfolio --name nginx-eportfolio -d -p 80:80 pemarchandet/nginx-eportfolio
```
### Troubleshooting
#### Stop the running container
```bash
# Get all container ID
docker ps
# Use the first relevant digits of the container id, here 049
docker rm -f 049
# Next perform the rebuild
```
#### Remove a stopped container
```bash
# Get all container ID
docker ps -a
# Use the first relevant digits of the container id, here 049
docker rm 049
```
#### Remove all containers
```bash
docker rm $(docker ps -a -q)
```
#### Remove all images
```bash
docker rmi $(docker images -q)
```
#### Connect (attach) to the container
```bash
docker exec -ti nginx-eportfolio bash
```
#### Connect to a failed container (container that has exited)
```bash
docker run -ti -P pemarchandet/nginx-eportfolio bash
```
#### Check the logs of a container
```bash
# Checking log with exiting
docker logs -f pemarchandet/nginx-eportfolio
# Checking the last log and exit
docker logs pemarchandet/nginx-eportfolio
```

> **NOTE** Use **bash** or **zsh**. Remove $ for **fish**.

#### Not enough space on the device
Create a `~/.boot2docker/profile` file
```bash
mkdir -p ~/.boot2docker
touch ~/.boot2docker/profile
# Edit the file
vi ~/.boot2docker/profile
# Add the following
  # Disk image size in MB
  DiskSize = 2048
# Save and exit with :x
# Relaunch boot2docker /!\ This will force the download of every Docker images
boot2docker stop
boot2docker destroy
boot2docker init
boot2docker up
# Check if size has been modifier
boot2docker ssh
df -h
# Reset your environment variables and adapt your /etc/hosts
```

## Deployment on Docker hub
```bash
open http://boot2docker.me/test.html
```

## Using the image on a new Docker Hub
```bash
open http://boot2docker.me/test.html
```
