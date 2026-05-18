output "alb_security_group_id" {
  description = "ID of the ALB security group"
  value       = aws_security_group.alb.id
}

output "ecs_security_group_id" {
  description = "ID of the ECS tasks security group"
  value       = aws_security_group.ecs_tasks.id
}

output "documentdb_security_group_id" {
  description = "ID of the DocumentDB security group"
  value       = aws_security_group.documentdb.id
}
