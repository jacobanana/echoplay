provider "aws" {
  region = "eu-west-1"
}

resource "aws_security_group" "echoplay_sg" {
  name        = "echoplay-sg"
  description = "Allow HTTP, HTTPS, SSH"
  vpc_id      = "vpc-0874a087a18300bbd" # replace with your VPC ID

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }


  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "echoplay" {
  ami                         = "ami-0ce8c2b29fcc8a346" # Amazon Linux 2023 AMI
  instance_type               = "t3.micro"
  subnet_id                   = "subnet-058b95c3e314b4cee" # replace with your Subnet ID
  vpc_security_group_ids      = [aws_security_group.echoplay_sg.id]
  associate_public_ip_address = true
  key_name                    = "echoplay-aws"

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
