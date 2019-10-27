upstream nodejs {
    # List of Node.JS Application Servers
    server 192.168.30.21:3000;
    server 192.168.30.22:3000;
    keepalive 8;
}

server {
    listen 192.168.30.10:80;
    access_log /var/log/nginx/test.log;
    location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host  $http_host;
        proxy_set_header X-Nginx-Proxy true;
        proxy_pass      http://nodejs/;
        proxy_redirect  off;
    }
}

