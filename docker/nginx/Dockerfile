FROM nginx

# Configuration
ADD h5bp-nginx-cfg/nginx.conf /etc/nginx/nginx.conf
ADD h5bp-nginx-cfg/mime.types /etc/nginx/mime.types
ADD h5bp-nginx-cfg/sites-available/default.conf /etc/nginx/conf.d/default.conf

# Source
# Just a test file for checking NGinx
ADD src /www
# Project static files
ADD public /www

# Not necessary but clearer in development
EXPOSE 80
