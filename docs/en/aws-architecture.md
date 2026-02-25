# How to Draw AWS Architecture Diagrams with OpenFlowKit

Drawing cloud infrastructure can be tedious if you are dragging and dropping shapes manually. OpenFlowKit provides a **Diagram-as-Code** approach to visualizing AWS Architectures, making it perfect for DevOps teams, Solutions Architects, and Cloud Engineers.

## Why Use Diagram-as-Code for AWS?

Instead of spending hours aligning server icons, you can write simple text that OpenFlowKit instantly renders into a beautiful, auto-routed diagram. Because it's code, your architecture diagram can live right next to your Terraform or CloudFormation scripts in Git.

- **Version Control**: Track infrastructure changes over time.
- **Auto-Layout**: No more overlapping lines or misaligned VPCs.
- **Speed**: Type a few lines, get a complete diagram.


## Example: Basic Web Architecture (Mermaid.js)

OpenFlowKit natively supports Mermaid.js, which is great for standard cloud structures. Here is how you can visualize an AWS VPC with a Load Balancer, EC2 instances, and an RDS database.

```mermaid
flowchart TD
    %% Define Styles
    classDef aws fill:#FF9900,stroke:#fff,stroke-width:2px,color:#fff,rx:8px,ry:8px;
    classDef vpc fill:#f5f5f5,stroke:#00A4A6,stroke-width:2px,stroke-dasharray: 5 5,rx:12px,ry:12px;
    
    Client((User Traffic))

    subgraph AWS_VPC [AWS Cloud VPC]
        ALB(Application Load Balancer)
        
        subgraph Public_Subnet [Public Subnet]
            EC2_1(Web Server 1)
            EC2_2(Web Server 2)
        end
        
        subgraph Private_Subnet [Private Subnet]
            RDS[(Amazon RDS)]
            ElastiCache[(Redis Cache)]
        end
    end

    %% Connections
    Client -->|HTTPS| ALB
    ALB -->|Round Robin| EC2_1
    ALB -->|Round Robin| EC2_2
    
    EC2_1 --> RDS
    EC2_1 --> ElastiCache
    EC2_2 --> RDS
    EC2_2 --> ElastiCache

    %% Apply Styles
    class ALB,EC2_1,EC2_2 aws;
    class RDS,ElastiCache aws;
    class AWS_VPC,Public_Subnet,Private_Subnet vpc;
```

## Creating AWS Diagrams with AI

If you don't know Mermaid syntax, you can use **Flowpilot**, our built-in AI assistant. 

1. Open the [Command Center](/docs/en/command-center).
2. Type a prompt like:
> `"Create an AWS architecture diagram showing an API Gateway routing traffic to three AWS Lambda functions, which all connect to a central DynamoDB table."`
3. Hit enter. Flowpilot will instantly generate the DSL and render the diagram.

## Exporting for internal documentation

Once your AWS Architecture is generated, you can easily export it:
- **SVG / PNG**: For Confluence, Jira, or Slack.
- **Figma Editable**: Want your UX team to polish the diagram? Click *Figma Editable* and paste it directly into Figma as native, editable vector layers.

[Try building your first AWS Architecture diagram now!](/#/canvas)
