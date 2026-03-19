FROM nginx:alpine

# 1. Clear out default files
RUN rm -rf /usr/share/nginx/html/*

# 2. Copy your files
COPY . /usr/share/nginx/html/

# 3. Create a custom Nginx config to change the listening port
# By default, Nginx looks for port 80. We must force it to 9000.
RUN echo "server { \
    listen 9000; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
    } \
}" > /etc/nginx/conf.d/default.conf

# 4. Fix permissions for the 'nginx' user
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

# 5. Switch to the non-root user
USER nginx

# 6. Expose the new port
EXPOSE 9000

CMD ["nginx", "-g", "daemon off;"]