FROM nginx:alpine

# 1. Clear out the default "Welcome to Nginx" files
RUN rm -rf /usr/share/nginx/html/*

# 2. Copy YOUR clock files into that same folder
COPY . /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]