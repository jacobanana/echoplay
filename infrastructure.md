# Echoplay AWS Infrastructure

This document describes the AWS infrastructure created using **Terraform** to support hosting of the Echoplay App on **AWS Free Tier**.

## Overview

The application is containerized using **Docker**, hosted on an AWS **EC2** instance and is connected to a **VPC** with a **public subnet** and **internet gateway**.

The deployment is performed using **terraform** and includes the following:

- VPC, Subnet, Internet Gateway and Route tables
- EC2 instance (running Docker)
- Security Group
- SSH Key pair (assumed pre-existing)

## Architecture components

### VPC & Networking

- **VPC:** Isolated virtual network for Echoplay resources.
- **Public Subnet:** Hosts the EC2 instance with public internet access.
- **Internet Gateway:** Allows outbound internet traffic and inbound HTTP traffic.
- **Route Table:** Routes 0.0.0.0/0 through the Internet Gateway.
- **Security Group:** Allows inbound HTTP (port 80) from anywhere. 

### Compute
- **EC2 Instance:**

    - **Type:** t3.micro (Free Tier eligible)
    - **AMI:** Amazon Linux
    - Docker installed via **user_data** at launch
    - **Public IP** assigned for direct access
    - Automatically runs the Echoplay **Docker** container:

        ```bash
        docker run -d --restart always -p 80:3000 ghcr.io/jacobanana/echoplay:latest
        ```

### Access & Secrets

- **Key Pair:** An existing EC2 key pair is used for optional SSH access (configurable via key_name).
- **No AWS credentials or secrets** are embedded in the instance. The Docker image used is public.
- **Security Groups** ensure only required traffic reaches the instance.

## CI/CD

The infrastructure deployment is automated using Github Actions. The workflow is as follow:

1. **Build**: the Docker image is built and published to **Github Container Registry** as a public package
2. **Deploy**: once built, the terraform plan is executed

### Secrets & Access

In order to use this, you will need a **IAM user** with the `AmazonEC2FullAccess` permission policy. This may be too generous, but this is not a production application. This user will need an **Access Key** associated and those will need to be registered as **Actions Secrets** in GitHub:

- `AWS_ACCESS_KEY_ID`: access key ID
- `AWS_SECRET_ACCESS_KEY`: secret key