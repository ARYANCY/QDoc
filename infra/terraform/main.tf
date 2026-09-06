terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  default = "ap-south-1" # Mumbai region for India DPDP compliance
}

variable "environment" {
  default = "production"
}

# KMS Key for PHI & Data Encryption at Rest (AES-256)
resource "aws_kms_key" "qmed_phi_key" {
  description             = "KMS Key for Q-MedSense PHI and Clinical Feature Store Encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Environment = var.environment
    Compliance  = "DPDP-Act-2023-HIPAA"
  }
}

# S3 Bucket for Imaging and Clinical Report Blobs (Encrypted)
resource "aws_s3_bucket" "qmed_reports_storage" {
  bucket = "qmedsense-clinical-reports-${var.environment}"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "qmed_s3_encryption" {
  bucket = aws_s3_bucket.qmed_reports_storage.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.qmed_phi_key.arn
      sse_algorithm     = "aws:kms"
    }
  }
}
