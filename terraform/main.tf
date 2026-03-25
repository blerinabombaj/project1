module "eks" {
  source = "./modules/eks"

  region             = "eu-west-1"
  cluster_name       = "project1-cluster"
  cluster_version    = "1.30"
  node_instance_type = "c7i-flex.large"
  node_desired_count = 1
  node_min_count     = 1
  node_max_count     = 1
  vpc_cidr           = "10.0.0.0/16"
}