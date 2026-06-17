terraform {
  required_version = ">= 1.5.0"
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.34"
    }
  }
}

variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
}

variable "region" {
  default = "fra1"
}

variable "droplet_size" {
  default = "s-2vcpu-4gb"
}

variable "ssh_key_fingerprint" {
  description = "Empreinte clé SSH pour accès VPS"
  type        = string
}

provider "digitalocean" {
  token = var.do_token
}

resource "digitalocean_droplet" "petfoodtn" {
  name   = "petfoodtn-prod"
  region = var.region
  size   = var.droplet_size
  image  = "ubuntu-24-04-x64"
  ssh_keys = [var.ssh_key_fingerprint]

  tags = ["petfoodtn", "devops", "production"]

  user_data = <<-EOF
    #!/bin/bash
    apt-get update -y
    apt-get install -y docker.io docker-compose-plugin
    usermod -aG docker root
    mkdir -p /opt/petfoodtn/backups
  EOF
}

resource "digitalocean_firewall" "petfoodtn" {
  name = "petfoodtn-fw"

  droplet_ids = [digitalocean_droplet.petfoodtn.id]

  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "80"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "443"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "udp"
    port_range       = "51820"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "tcp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "udp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }
}

output "droplet_ip" {
  value       = digitalocean_droplet.petfoodtn.ipv4_address
  description = "IP publique du serveur PetfoodTN"
}

output "deploy_path" {
  value = "/opt/petfoodtn"
}
