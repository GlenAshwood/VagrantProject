<img src="vagrant.svg" align="right" />

# Load balanced vagrant setup with Ansible, NGINX and NodeJS.


## Description
Vagrant Project to deploy three servers and configure each on via the ansible_local provisioner. The Vagrantfile will create the following machines:

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

## Dependencies
- [Vagrant](https://www.vagrantup.com/downloads.html)
- [VirtualBox](https://www.virtualbox.org/wiki/Downloads)

## Optional
You can also install Ansible on your local machine, but it isnt required for this deployment
- [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)

## Vagrant box used as base image
[ubuntu-14.04-64-nocm](https://vagrantcloud.com/puppetlabs/boxes/ubuntu-14.04-64-nocm)

## Installation
Once you have dependencies installed and cloned this this repositories to your local device, the only command you should need to run from the root directory is:
```bash
vagrant up
```
Once the installation has completed (and it isnt quick, plenty of time to make a tea), you should now have three machines. To vefiy this, you can round the following command:
```bash
vagrant status
```
and you should see something similer to this:
```bash
Current machine states:

application_1             running (virtualbox)
application_2             running (virtualbox)
loadbalancer              running (virtualbox)
```

## Confirmation that everything has installed correctly   

To test that the nginx loadbalancer machine is working, you can open the following link via your local browser:
```open http://192.168.30.10```

To test that Application_1 is working directly, you can open the following link via your local browser:
```open http://192.168.30.21:3000```

To test that Application_2 is working directly, you can open the following link via your local browser:
```open http://192.168.30.22:3000```

## SSH to VMs
you can access each virtual machine with the following vagrant commands 
```bash 
vagrant ssh loadbalancer
vagrant ssh application_1
vagrant ssh application_2
```

# Ansible
## Roles


## Nginx Details

## NodeJs Details

## Cleanup 
To power down your Virtual machines
```bash
vagrant halt                      #powerdown all machines
vagrant halt application_1        #powerdown just the application_1 machine
```
To hibernate your Virtual machines
```bash
vagrant suspend                   #hibernate all machines
vagrant halt application_2        #hibernate just the application_2 machine

```
To destroy your Environment or Virtual machine(s)
```bash
vagrant destroy -f                #destroy all machines, no prompt to confirm
vagrant destroy loadbalancer -f   #destroy all machines, no prompt to confirm
```
## Roadmap
