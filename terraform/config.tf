terraform {
  backend "s3" {
    bucket         = "adrien-tf-state-bucket"
    key            = "site/terraform.tfstate"
    region         = "eu-west-1"
    encrypt        = true
    dynamodb_table = "terraform-locks" # optional but recommended for concurrency control
  }
}