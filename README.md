# Load balanced vagrant setup with Ansible, NGINX and NodeJS.

## Dependencies
- [Vagrant](https://www.vagrantup.com/downloads.html)
- [VirtualBox](https://www.virtualbox.org/wiki/Downloads)

## Installation

```bash
vagrant up
```
## Server Details
- Loadblancer         
```
Application: Nginx
IP: 192.168.30.10
PORT: 80
```
- Application_1       
```
Application: Nodejs
IP: 192.168.30.21
PORT: 3000
```
- Application_2
```
Application: Nodejs
IP:   192.168.30.22
PORT: 3000
```
## Testing

To test the nginx loadbalancer is working:
```open http://192.168.30.10```

To test that Application_1 is working directly:
```open http://192.168.30.21:3000```

To test that Application_2 is working directly:
```open http://192.168.30.22:3000```
## Cleanup 
To power down your Virtual machines
```bash
vagrant halt
```
To hibernate your Virtual machines
```bash
vagrant suspend
```


## Vagrant box used as base image
[ubuntu-14.04-64-nocm](https://vagrantcloud.com/puppetlabs/boxes/ubuntu-14.04-64-nocm)


## Nginx Details

## NodeJs Details
