import type { Project } from '../types/project'

/**
 * TEMPORARY frontend-only seed data for the Projects module.
 *
 * Do not import this array from UI components. Use `projectService`
 * instead so the Java Core REST API can replace this later.
 */
export const TEMPORARY_PROJECT_SEED: Project[] = [
  {
    id: 'project-1001',
    name: 'Payments Gateway',
    description: 'Card processing, refunds, and settlement reporting.',
    status: 'ACTIVE',
    createdAt: '2026-01-12T09:15:00.000Z',
    updatedAt: '2026-09-28T14:40:00.000Z',
  },
  {
    id: 'project-1002',
    name: 'Mobile Banking',
    description: 'iOS and Android customer banking application.',
    status: 'ACTIVE',
    createdAt: '2026-02-03T11:00:00.000Z',
    updatedAt: '2026-09-30T08:22:00.000Z',
  },
  {
    id: 'project-1003',
    name: 'Internet Banking',
    description: 'Web portal for retail accounts and transfers.',
    status: 'ON_HOLD',
    createdAt: '2025-11-18T16:45:00.000Z',
    updatedAt: '2026-08-04T10:05:00.000Z',
  },
  {
    id: 'project-1004',
    name: 'Fraud Detection',
    description: 'Rules engine and alert workflow for suspicious payments.',
    status: 'ACTIVE',
    createdAt: '2026-03-21T07:30:00.000Z',
    updatedAt: '2026-10-01T12:10:00.000Z',
  },
  {
    id: 'project-1005',
    name: 'Customer Onboarding',
    description: 'KYC forms, document upload, and approval queues.',
    status: 'ACTIVE',
    createdAt: '2026-04-09T13:20:00.000Z',
    updatedAt: '2026-09-18T17:55:00.000Z',
  },
  {
    id: 'project-1006',
    name: 'Core Ledger',
    description: 'Internal posting and account balance services.',
    status: 'ARCHIVED',
    createdAt: '2025-06-02T08:00:00.000Z',
    updatedAt: '2026-01-15T09:40:00.000Z',
  },
  {
    id: 'project-1007',
    name: 'ATM Network',
    description: 'Monitoring and cash-management for ATM fleet.',
    status: 'ON_HOLD',
    createdAt: '2026-05-14T15:10:00.000Z',
    updatedAt: '2026-08-22T11:33:00.000Z',
  },
  {
    id: 'project-1008',
    name: 'QA Playground',
    description: 'Sandbox project used by QA for exploratory testing.',
    status: 'ACTIVE',
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: '2026-09-12T16:18:00.000Z',
  },
  {
    id: 'project-1009',
    name: 'Notifications Hub',
    description: 'Email, SMS, and push notification delivery.',
    status: 'ACTIVE',
    createdAt: '2026-07-19T09:45:00.000Z',
    updatedAt: '2026-09-29T19:02:00.000Z',
  },
  {
    id: 'project-1010',
    name: 'Reporting Warehouse',
    description: 'Nightly extracts for operational and audit reports.',
    status: 'ARCHIVED',
    createdAt: '2025-09-08T12:25:00.000Z',
    updatedAt: '2026-03-11T08:50:00.000Z',
  },
  {
    id: 'project-1011',
    name: 'Partner Portal',
    description: 'External merchant access to settlement files.',
    status: 'ON_HOLD',
    createdAt: '2026-08-05T14:05:00.000Z',
    updatedAt: '2026-09-21T13:27:00.000Z',
  },
]
