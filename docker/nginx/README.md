# NGinx for ePortfolio
## Development workflow
Build
```bash
docker build -t pemarchandet/nginx-eportfolio .
```
Run
- `-d`: Deamon mode
- `-t`: Tag
- `-p`: Port on the Docker Host and port on the Docker Container
```bash
docker run -d -t pemarchandet/nginx-eportfolio .
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
## Deployment on Docker hub
```bash
open http://boot2docker.me/test.html
```

## Using the image on a new Docker Hub
```bash
open http://boot2docker.me/test.html
```
