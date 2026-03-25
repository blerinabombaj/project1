output "kubeconfig_command" {
  value = module.eks.kubeconfig_command
}

output "cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "vpc_id" {
  value = module.eks.vpc_id
}