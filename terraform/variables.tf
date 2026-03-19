variable "region" {
  description = "AWS region"
  type        = string
  default     = "eu-central-1" # Frankfurt is closest to Switzerland
}

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "project1-eks"
}
