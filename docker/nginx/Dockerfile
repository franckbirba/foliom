FROM nginx

# RUN mkdir /etc/nginx/log && touch /etc/nginx/log/nging.log

# Dev mode
ADD src /www
ADD h5bp-nginx-cfg/nginx.conf /etc/nginx/nginx.conf
ADD h5bp-nginx-cfg/mime.types /etc/nginx/mime.types

# Not necessary but clearer in development
EXPOSE 80
