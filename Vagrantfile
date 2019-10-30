Vagrant.configure("2") do |config|  
  
  config.vm.box = "puppetlabs/ubuntu-14.04-64-nocm"
  config.ssh.forward_agent = true
  
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

      loadbalancer.vm.provision "ansible_local" do |ansible|
        ansible.playbook = "ansible/playbook-lb.yml"
        ansible.install_mode = "pip"
        ansible.compatibility_mode = "2.0"
      end

      loadbalancer.vm.provision "shell", 
        inline: "netstat -anp tcp | grep :80"
    

      loadbalancer.vm.network :private_network, ip: "192.168.30.10"
      loadbalancer.ssh.forward_agent = true
      loadbalancer.vm.synced_folder ".", "/vagrant"
  end

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

        application.vm.provision "ansible_local" do |ansible|
          ansible.playbook = "ansible/playbook-wa.yml"
          ansible.install_mode = "pip"
          ansible.compatibility_mode = "2.0"
        end

        application.vm.network :private_network, ip: "192.168.30.2#{i}"
        application.ssh.forward_agent = true
        application.vm.synced_folder ".", "/vagrant"
        application.vm.synced_folder "./webapp", "/opt/webapp"
    end
  end  
end  