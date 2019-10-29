# Load balanced vagrant setup with Ansible, NGINX and NodeJS.

## Dependencies
- [Vagrant](https://www.vagrantup.com/downloads.html)
- [VirtualBox](https://www.virtualbox.org/wiki/Downloads)

## Installation

```bash
vagrant up
```
## Testing
open http://192.168.30.10 

## Vagrant box used as base image
[ubuntu-14.04-64-nocm](https://vagrantcloud.com/puppetlabs/boxes/ubuntu-14.04-64-nocm)

## Server Details
- Loadblancer         192.168.30.10
- Application_1       192.168.30.21
- Application_2       192.168.30.22

## Nginx Details

## NodeJs Details
