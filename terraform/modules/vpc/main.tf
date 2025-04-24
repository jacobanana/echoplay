# Create VPC
resource "aws_vpc" "echoplay_vpc" {
  cidr_block           = var.cidr_block
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "echoplay-vpc"
  }
}

# Create Internet Gateway
resource "aws_internet_gateway" "echoplay_igw" {
  vpc_id = aws_vpc.echoplay_vpc.id

  tags = {
    Name = "echoplay-igw"
  }
}

# Create public subnet
resource "aws_subnet" "echoplay_subnet" {
  vpc_id                  = aws_vpc.echoplay_vpc.id
  cidr_block              = var.subnet_cidr_block
  map_public_ip_on_launch = true

  tags = {
    Name = "echoplay-subnet"
  }
}

# Create route table
resource "aws_route_table" "echoplay_rt" {
  vpc_id = aws_vpc.echoplay_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.echoplay_igw.id
  }

  tags = {
    Name = "echoplay-rt"
  }
}

# Associate route table with subnet
resource "aws_route_table_association" "echoplay_rta" {
  subnet_id      = aws_subnet.echoplay_subnet.id
  route_table_id = aws_route_table.echoplay_rt.id
}

output "vpc_id" {
  value = aws_vpc.echoplay_vpc.id
}

output "subnet_id" {
  value = aws_subnet.echoplay_subnet.id
}