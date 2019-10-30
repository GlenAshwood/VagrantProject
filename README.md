<img src="vagrant.svg" align="right" />

# Load balanced vagrant setup with Ansible, NGINX and NodeJS.


## Description
Vagrant Project to deploy three servers and configure each one via the ansible_local provisioner. The Vagrantfile will create the following machines:

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
Once the installation has completed (and it isnt quick, plenty of time to make a tea), you should now have three machines. To vefiy this, you can run the following command:
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

# Confirmation that everything has installed correctly 
## Test website is being displayed correctly (Local Web Browser)

Test nginx loadbalancer is working:
```open http://192.168.30.10```

Test Application_1 is working directly:
```open http://192.168.30.21:3000```

To test that Application_2 is working directly:
```open http://192.168.30.22:3000```

> You may need to hard refresh some browsers (Chrome) to round ronin between back end servers via the loadbalancer

## SSH to VMs
you can access each virtual machine with the following vagrant commands 
```bash 
vagrant ssh loadbalancer
vagrant ssh application_1
vagrant ssh application_2
```

# Ansible

## Playbooks

### ansible/playbook-lb.yml #playbook for Nginx loadblancer
```
Roles: nginx_proxy, security_update
Host: all
User: root
```

### ansible/playbook-wb.yml #playbook for NodeJS Machines
```
Roles: nodesource.node, security_update
Host: all
User: root
```
## Roles
### ansible/roles/nginx_proxy
This role was built using ansible-galaxy and contains the following:
```
ROLE:
hosts: all

TASKS:
- Install Nginx
- Change default nginx site #Copies templates/default.tpl to /etc/nginx/sites-available/default and then nofities handler

HANDLERS
- restart nginx
 
DEFAULTS
- package: nginx
- service: nginx
- port: 80
```
### ansible/roles/nodesource.node
I installed [nodesource.node](https://github.com/nodesource/ansible-nodejs-role) and used it for the base role. I tried to create my own tasks to install nodejs, but the only one that worked involved curl and it just felt clunky. I have indicated any changes that I have made. 
```
ROLE:
hosts: all

TASKS:
- Ensure the system can use the HTTPS transport for APT
- Install HTTPS transport for APT
- Install GPG
- Import the NodeSource GPG key into apt
- Add NodeSource deb repository
- Add NodeSource deb-src repository
- Add NodeSource repository preference
- Install Node.js
- Install packages based on package.json    # This was a new task added by me. I may add modules_modules to .gitignore and install directly to the the remote host in future
- Install PM2 package                       # This was a new task added by me. I prefer this to the default node deamon
- Save pm2 processes                        # This was a new task added by me. I had issues with PM2 not starting after a halt, so this brings up the saved session
- Resurrect pm2 processes                   # This was a new task added by me. I had issues with PM2 not starting after a halt, so this brings up the saved processes

HANDLERS
- restart start pm2                         # This was a new task added by me
 
DEFAULTS
- nodejs_nodesource_pin_priority: 500
- nodejs_version: "10.x"                    # updated by me, the orignal versions were very old
- app_dir: "/opt/webapp"                    # This was a new default added by me - Default Node app location
```
### ansible/roles/security_update
Simple security example that is run on all servers and updates settings within sudoers 
```
TASKS:
- Check that 'admin' group do not have passwordless sudo
- Check vagrant user is in sudoers
- Add vagrant user to sudoers and set to NOPASSWD
```

# Nginx Details


# NodeJs Details

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
