FROM nginx

# RUN mkdir /etc/nginx/log && touch /etc/nginx/log/nging.log

# ADD src /www
ADD h5bp-nginx-cfg/nginx.conf /etc/nginx/conf.d/default.conf

# Dev mode
# See: http://wiki.nginx.org/CoreModule
RUN echo "daemon off;" >> /etc/nginx/nginx.conf


# Not necessary but clearer in development
EXPOSE 80
