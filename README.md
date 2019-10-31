<img src="screenshoot1.png" align="centre" />

#  Nginx Loadbalancer and NodeJs Webservices - Deployed using Vagrant and provisioned using ansible_local


## Description
A Vagrant project that deploys 2 NodeJS web servers and a nginx loadbalancer to handle requests. All three machines are provisioned using ansible_local. 

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

# Installation
Install both dependencies and clone this repositories to your local host. The only command you should need to run from the root directory is:
```bash
vagrant up
```
Once the installation has completed (and it isn't quick, so plenty of time to make a tea/coffee), you should have provisioned three machines. To vefiy this, you can run the following command:
```bash
vagrant status
```
You should see something similer to this:
```bash
Current machine states:

application_1             running (virtualbox)
application_2             running (virtualbox)
loadbalancer              running (virtualbox)
```

# Confirmation that everything worked
## Test access via Web Browser

Test nginx loadbalancer is working:
```open http://192.168.30.10```

Test Application_1 is working directly:
```open http://192.168.30.21:3000```

To test that Application_2 is working directly:
```open http://192.168.30.22:3000```

> You may need to hard refresh if you do not see the 192.168.30.2x ip round robin

## SSH to VMs
You can also access each virtual machine with the following vagrant commands 
```bash 
vagrant ssh loadbalancer
vagrant ssh application_1
vagrant ssh application_2
```

# Vagrant
To make sure that this project only required minimum dependencies, ansible_local was used instead of deploying via the local host. 

## important Information
```
Remote config file location:  /vagrant
Local config file location:   .
box image:                    puppetlabs/ubuntu-14.04-64-nocm
Nginx Hosts:                  1
NodeJS Hosts:                 2
Provider:                     virtualbox
IP Range Used:                192.168.30.XX
Main Provisioner:             ansible_local
Testing:                      shell
```

Config to provision two NodeJS application servers
```ruby
  #Creates two NodeJS Application instances
  (1..2).each do |i|
    config.vm.define "application_#{i}" do |application|
      application.vm.provider :virtualbox do |v|
        v.name = "application_#{i}"
        v.customize [
          "modifyvm", :id,
          "--name", "application_#{i}",
          "--memory", 512,
          "--natdnshostresolver1", "on",
          "--cpus", 1,
        ]
      end
      
      #Application Instance provisioning via Ansible_local 
      application.vm.provision "ansible_local" do |ansible|
        ansible.playbook = "ansible/playbook-wa.yml"
        ansible.install_mode = "pip"
        ansible.compatibility_mode = "2.0"
      end
      
      #Shell provisioner test section - is the webapp available on port 3000
      application.vm.provision "shell", 
        inline: <<-Script
        echo I am provisioning pm2 service...; sleep 5
        curl -s http://192.168.30.2#{i}:3000/test
        Script

      #Basic configuration for application instance - network and shared folders
      application.vm.network :private_network, ip: "192.168.30.2#{i}"
      application.vm.synced_folder ".", "/vagrant"
      application.vm.synced_folder "./webapp", "/opt/webapp"
    end
  end
```
Config to provision the Nginx loadbalancer
```ruby
  #Creates a Nginx instance to loadbalance traffic to webapplication
  config.vm.define :loadbalancer do |loadbalancer|
    loadbalancer.vm.provider :virtualbox do |v|
        v.name = "loadbalancer"
        v.customize [
          "modifyvm", :id,
          "--name", "loadbalancer",
          "--memory", 512,
          "--natdnshostresolver1", "on",
          "--cpus", 1,
        ]
    end

    #Loadbalancer Instance provisioning via Ansible_local 
    loadbalancer.vm.provision "ansible_local" do |ansible|
      ansible.playbook = "ansible/playbook-lb.yml"
      ansible.install_mode = "pip"
      ansible.compatibility_mode = "2.0"
    end
    
    #Shell provisioner test section - is nginx runnung and is it serving traffic 
    loadbalancer.vm.provision "shell", 
      inline: <<-Script
      echo I am provisioning nginx service....; sleep 5
      netstat -anp tcp | grep 192.168.30.10:80
      curl -s http://192.168.30.10/lbtest
      Script

    #Basic configuration for application instance - network and shared folder
    loadbalancer.vm.network :private_network, ip: "192.168.30.10"
    loadbalancer.ssh.forward_agent = true
    loadbalancer.vm.synced_folder ".", "/vagrant"
  end  
```
## Shell Provisoner - Test
The shell provisioner was used to test that the Nginx servers was listening on port 80 and that both webservers were listening on port 3000

```bash
application_1: I am provisioning pm2 service...
application_1: IP 192.168.30.21 is responding to HTTP Requests on port 3000
```
```bash
application_2: I am provisioning pm2 service...
application_2: IP 192.168.30.22 is responding to HTTP Requests on port 3000
```
```bash
loadbalancer: I am provisioning nginx service....
loadbalancer: tcp        0      0 192.168.30.10:80        0.0.0.0:*               LISTEN      7906/nginx      
loadbalancer: Web services available via Loadbalancer
```

# Ansible

## Playbooks

### ansible/playbook-lb.yml #playbook for Nginx loadblancer
```
Roles:    nginx_proxy, security_update
Host:     loadbalancer
User:     root
```

### ansible/playbook-wb.yml #playbook for NodeJS Machines
```
Roles:    nodesource.node, security_update
Host:     application_1,application_2
User:     root
```
## Roles

### ansible/roles/nginx_proxy
This role was built using ansible-galaxy:
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
[nodesource.node](https://github.com/nodesource/ansible-nodejs-role) was used as the base for this role. I tried to create my own tasks to install nodejs, but the only version that worked involved curl and it just felt clunky. I have indicated any changes that I have made. 
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
- Install packages based on package.json    # This was a new task added by me. I may add node_modules to .gitignore and install directly to the the remote host in future
- Install PM2 package                       # This was a new task added by me. I prefer this to the default node deamon
- Save pm2 processes                        # This was a new task added by me. I had issues with PM2 not starting after a halt, so this task saves/dumps running processes
- Resurrect pm2 processes                   # This was a new task added by me. I had issues with PM2 not starting after a halt, so this task brings up the saved processes

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
The Nginx setup is very simple and only installs and runs the Nginx service and updates the default configuration file.
```
IMPORTANT INF0:
Remote config file location:  /etc/nginx/sites-available/default
Local config file location:   ./ansible/roles/nginx_proxy/templates/default.tpl
```
Default.tpl file - static IPs at the moment, but will look into dynamic addressing 
```
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
```
## Troubleshooting
(Famous last words) Due to its simple setup, I havent had any issues with the loadbalancer since getting the default configuration correct.

# NodeJs Details
Due to using NodeJS for a few personal projects, it seemed liked the right choice for the web applications in this project

## App.js - main control file
```
Remote file location:  /opt/webapp/app.js
Local file location:   ./webapp/app.js
Start process:         pm2 start app.js --name webapp --watch -f
```

## ROUTES
```
/         # Default - Returns landing.ejs page located in webapp/views/
/test     # Returns a test page for localhost testing via the Shell Provisioner
/lbtest   # Returns a test page for Loadbalancer testing via the Shell Provisioner
```
## LANDING PAGE (Main page)
```
Type:                  Embedded JavaScript template
Remote file location:  /opt/webapp/views/landing.ejs 
Local file location:  ./webapp/views/landing.ejs
```
Once fully deployed, you are able to make dynamic changes to the landing page and see them by refreshing your web browser. I have highlighted within the HTML body where you can add your own code to test.
```
<!-- You can add extra text between the <h3> and </h3> below to see the automatic update when refreshed-->
<h3> </h3>
<!-- You can add extra text between the <h3> and </h3> above to see the automatic update when refreshed -->
```

## PM2 service
I used [PM2](https://pm2.keymetrics.io/) instead of node, as it gives you a lot more options, some of which can be seen below
```
IMPORTANT INF0:
Run as:           Root # use sudo -i to see the running PM2 Service
Webapp location:  /opt/webapp/
```

### Commands used for this project
```
pm2 start app.js --name webapp --watch -f # Starts the application, names it 'webapp' and watch root directory
pm2 Status                                # Status of running processes
pm2 stop webapp                           # Stop webapp service
pm2 start webapp                          # Restart the webapp service
pm2 save                                  # Dump all processes for resurrecting them later
pm2 resurrect                             # Resurrect previously dumped processes
```

## Troubleshooting
There shouldnt be any issues with the application servers unless you make changes to the app.js file or have syntax errors. If you do update app.js, you will need to restart PM2 to see those changes.


# Cleanup 
## To power down your Virtual machines
```bash
vagrant halt                      #powerdown all machines
vagrant halt application_1        #powerdown just the application_1 machine
```
## To hibernate your Virtual machines
```bash
vagrant suspend                   #hibernate all machines
vagrant halt application_2        #hibernate just the application_2 machine

```
## To destroy your Environment or Virtual machine(s)
```bash
vagrant destroy -f                #destroy all machines, no prompt to confirm
vagrant destroy loadbalancer -f   #destroy all machines, no prompt to confirm
```
## Roadmap
- Add tasks to upgrade pre-installed software    # I didnt do this originally as I wanted to keep provisioning times to a minimum.
- Replace hardcoding with varibles
- Add API to landing page for dynamic content    # I was going to do this, but didnt want to include the APIKey in the configure on git or have to create local varibles.
- Ansible testing instead of shell provisioner   # I want to use both the shell and ansible provisioning, but I think ansible makes more sense for future projects
- Update code to allow scaling beyond 2 app servers
- Https --> http routing
- Add Screenshots

