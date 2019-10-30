Vagrant.configure("2") do |config|  
  
  #Basic settings that are shared between nodes
  config.vm.box = "puppetlabs/ubuntu-14.04-64-nocm"
  config.ssh.forward_agent = true
  
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
  
end  