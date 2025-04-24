resource "aws_instance" "echoplay" {
  ami                         = var.ami
  instance_type               = var.instance_type
  subnet_id                   = var.subnet_id
  associate_public_ip_address = true
  vpc_security_group_ids      = [var.security_group_id]
  key_name                    = var.key_name

  user_data = <<-EOF
                    #!/bin/bash
                    yum update -y
                    yum install -y docker
                    systemctl enable docker
                    systemctl start docker
                    usermod -aG docker ec2-user
                    docker run -d --restart always -p 80:3000 ghcr.io/jacobanana/echoplay:latest
              EOF

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  tags = {
    Name = "EchoplayInstance"
  }
}

output "public_ip" {
  value = aws_instance.echoplay.public_ip
}