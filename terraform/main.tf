# 1. The VPC (The "Fence" around your property)
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "project1-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["eu-central-1a", "eu-central-1b"] # Switzerland-adjacent (Frankfurt)
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]    # Database lives here (Safe)
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"] # LoadBalancer lives here (Public)

  enable_nat_gateway = true # Allows private pods to talk to the internet
  single_nat_gateway = true # Saves money (roughly $30/month)
}

# 2. The EKS Cluster (The "Management Office")
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = "project1-cluster"
  cluster_version = "1.28"

  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_public_access = true

  eks_managed_node_groups = {
    general = {
      desired_size = 2
      min_size     = 1
      max_size     = 3

      instance_types = ["t3.medium"] # Small but capable for your app + DB
      capacity_type  = "SPOT"        # 70% cheaper than normal (Great for your budget)
    }
  }
}
