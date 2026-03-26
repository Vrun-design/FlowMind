import type { LintRule } from './types';

export interface RuleTemplate {
    id: string;
    name: string;
    description: string;
    rules: LintRule[];
}

export const RULE_LIBRARY: RuleTemplate[] = [
    {
        id: 'clean-architecture',
        name: 'Clean Architecture',
        description: 'Enforce dependency rules: UI → Application → Domain ← Infrastructure',
        rules: [
            {
                id: 'no-domain-to-infra',
                description: 'Domain layer must not depend on Infrastructure',
                severity: 'error',
                type: 'cannot-connect',
                from: { labelContains: 'domain' },
                to: { labelContains: 'infra' },
            },
            {
                id: 'no-domain-to-ui',
                description: 'Domain layer must not depend on UI',
                severity: 'error',
                type: 'cannot-connect',
                from: { labelContains: 'domain' },
                to: { labelContains: 'ui' },
            },
            {
                id: 'no-direct-db-call',
                description: 'Services must not call databases directly — use a repository',
                severity: 'error',
                type: 'cannot-connect',
                from: { labelContains: 'service' },
                to: { labelContains: 'database' },
            },
        ],
    },
    {
        id: 'hexagonal',
        name: 'Hexagonal Architecture',
        description: 'Ports & Adapters: domain core isolated from external systems',
        rules: [
            {
                id: 'no-core-to-adapter',
                description: 'Core domain must not depend on adapters directly',
                severity: 'error',
                type: 'cannot-connect',
                from: { labelContains: 'core' },
                to: { labelContains: 'adapter' },
            },
            {
                id: 'no-core-to-infra',
                description: 'Core domain must not depend on infrastructure',
                severity: 'error',
                type: 'cannot-connect',
                from: { labelContains: 'core' },
                to: { labelContains: 'infra' },
            },
            {
                id: 'core-must-exist',
                description: 'Diagram must include a core/domain component',
                severity: 'warning',
                type: 'must-have-node',
                from: { labelContains: 'core' },
            },
        ],
    },
    {
        id: 'microservices',
        name: 'Microservices Governance',
        description: 'No direct service-to-service DB sharing, no circular dependencies',
        rules: [
            {
                id: 'no-circular-services',
                description: 'Circular dependencies between services are not allowed',
                severity: 'error',
                type: 'forbidden-cycle',
                from: { labelContains: 'service' },
            },
            {
                id: 'no-shared-db',
                description: 'Services must not share a database directly',
                severity: 'warning',
                type: 'cannot-connect',
                from: { labelContains: 'service' },
                to: { labelContains: 'database' },
            },
            {
                id: 'gateway-must-exist',
                description: 'Microservice architectures should have an API gateway',
                severity: 'warning',
                type: 'must-have-node',
                from: { labelContains: 'gateway' },
            },
        ],
    },
    {
        id: 'aws-well-architected',
        name: 'AWS Well-Architected',
        description: 'Common AWS architecture best practices',
        rules: [
            {
                id: 'no-direct-internet-to-db',
                description: 'Databases must not be directly accessible from the internet',
                severity: 'error',
                type: 'cannot-connect',
                from: { labelContains: 'internet' },
                to: { labelContains: 'rds' },
            },
            {
                id: 'no-direct-internet-to-ec2',
                description: 'EC2 instances should sit behind a load balancer',
                severity: 'warning',
                type: 'cannot-connect',
                from: { labelContains: 'internet' },
                to: { labelContains: 'ec2' },
            },
            {
                id: 'alb-must-exist',
                description: 'Architecture should include a load balancer',
                severity: 'info',
                type: 'must-have-node',
                from: { labelContains: 'load balancer' },
            },
        ],
    },
    {
        id: 'frontend-backend',
        name: 'Frontend / Backend Separation',
        description: 'Prevent frontend from bypassing the API layer',
        rules: [
            {
                id: 'no-frontend-to-db',
                description: 'Frontend must not connect directly to a database',
                severity: 'error',
                type: 'cannot-connect',
                from: { labelContains: 'frontend' },
                to: { labelContains: 'database' },
            },
            {
                id: 'no-frontend-to-service',
                description: 'Frontend must go through an API, not call services directly',
                severity: 'warning',
                type: 'cannot-connect',
                from: { labelContains: 'frontend' },
                to: { labelContains: 'service' },
            },
            {
                id: 'api-must-reach-auth',
                description: 'API must connect to an Auth service',
                severity: 'warning',
                type: 'must-connect',
                from: { labelContains: 'api' },
                to: { labelContains: 'auth' },
            },
        ],
    },
];
