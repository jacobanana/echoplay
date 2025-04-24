provider "aws" {
  region = "eu-west-1"
}

# VPC Module
module "vpc" {
  source           = "./modules/vpc"
  cidr_block       = "10.0.0.0/16"
  subnet_cidr_block = "10.0.1.0/24"
}

# Security Group
resource "aws_security_group" "echoplay_sg" {
  name        = "echoplay-sg"
  description = "Allow HTTP and HTTPS"
  vpc_id      = module.vpc.vpc_id

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

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# EC2 Module
module "ec2" {
  source            = "./modules/ec2"
  ami               = "ami-0ce8c2b29fcc8a346"
  instance_type     = "t3.micro"
  subnet_id         = module.vpc.subnet_id
  security_group_id = aws_security_group.echoplay_sg.id
  key_name          = "echoplay-aws"
}
