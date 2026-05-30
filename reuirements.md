# Apartment Rent & Tenant Management System (ARTMS)

## 1. Project Overview

### Product Name

Apartment Rent & Tenant Management System (Working Title)

### Purpose

The Apartment Rent & Tenant Management System is a cloud-based platform designed to simplify rent collection, tenant management, payment tracking, maintenance requests, and communication between property managers, landlords, and tenants.

The system aims to replace spreadsheets, notebooks, WhatsApp chats, and manual rent tracking processes with a centralized, mobile-friendly platform.

### Vision

To provide apartment owners and property managers with complete visibility over their properties while giving tenants a simple and transparent experience for payments, communication, and maintenance requests.

---

# 2. Business Problem

Most apartment owners and managers currently face challenges such as:

* Manual rent tracking
* Delayed rent payments
* Missing or incomplete tenant records
* Difficulty tracking vacancies
* Lost payment records
* Excessive follow-up with tenants
* Maintenance requests being handled through calls and WhatsApp
* Lack of visibility into monthly collections

These inefficiencies consume time, create disputes, and lead to revenue leakage.

---

# 3. Target Users

## Primary Users

### Property Owner

An individual or company that owns one or more apartment buildings.

Responsibilities:

* Monitor collections
* View occupancy
* Track property performance

### Property Manager

A person responsible for day-to-day management of the property.

Responsibilities:

* Manage tenants
* Confirm payments
* Handle maintenance
* Communicate with tenants

### Caretaker

An on-site representative managing tenant interactions.

Responsibilities:

* View tenant records
* Record maintenance activities
* Monitor occupancy

### Tenant

An occupant renting a unit.

Responsibilities:

* View balances
* Submit maintenance requests
* Access receipts
* Receive reminders

---

# 4. Core Objectives

The system must:

* Reduce rent collection effort
* Improve payment visibility
* Minimize late payments
* Provide accurate tenant records
* Simplify maintenance management
* Improve communication
* Increase operational efficiency

---

# 5. Functional Requirements

## Module 1: Property Management

### Property Registration

The system shall allow users to:

* Create properties
* Edit property information
* Archive properties

Property Information:

* Property Name
* Location
* Number of Units
* Property Description
* Manager Assignment

---

### Unit Management

The system shall allow users to:

* Create units
* Assign unit numbers
* Define rent amounts
* Mark occupancy status

Unit Status Options:

* Occupied
* Vacant
* Reserved
* Under Maintenance

Unit Information:

* Unit Number
* Unit Type
* Monthly Rent
* Deposit Amount
* Status

---

## Module 2: Tenant Management

### Tenant Registration

The system shall store:

* Full Name
* National ID Number
* Phone Number
* Email Address
* Emergency Contact
* Move-In Date
* Lease Start Date
* Lease End Date
* Assigned Unit

---

### Tenant Profile

The system shall provide:

* Personal Information
* Lease Information
* Payment History
* Maintenance History
* Outstanding Balances

---

## Module 3: Rent Management

### Monthly Rent Tracking

The system shall:

* Generate monthly rent obligations
* Track payment status
* Calculate outstanding balances

Payment Status:

* Paid
* Partially Paid
* Overdue
* Pending

---

### Payment Recording

The system shall allow:

* Manual payment entry
* M-Pesa payment recording
* Bank payment recording

Required Information:

* Amount
* Date
* Reference Number
* Payment Method
* Notes

---

### Receipt Generation

Upon payment confirmation, the system shall:

* Generate a digital receipt
* Store receipt history
* Allow download and sharing

Receipt Information:

* Receipt Number
* Tenant Name
* Unit Number
* Amount Paid
* Date
* Payment Method

---

## Module 4: Rent Reminders

### Automated Notifications

The system shall automatically send reminders:

#### Upcoming Rent

* 7 days before due date
* 3 days before due date
* On due date

#### Overdue Rent

* 3 days overdue
* 7 days overdue
* 14 days overdue

Delivery Channels:


* Email 
* WhatsApp.

---

## Module 5: Maintenance Management

### Maintenance Requests

Tenants shall be able to submit requests.

Categories:

* Plumbing
* Electrical
* Security
* Cleaning
* Structural
* Other

Required Fields:

* Category
* Description
* Photos (Optional)

---

### Maintenance Workflow

Statuses:

* Submitted
* Assigned
* In Progress
* Resolved
* Closed

The system shall maintain a complete audit trail.

---

## Module 6: Vacancy Tracking

The system shall:

* Display all vacant units
* Track vacancy duration
* Show occupancy rates

Metrics:

* Total Units
* Occupied Units
* Vacant Units
* Occupancy Percentage

---

## Module 7: Dashboard & Reporting

### Property Dashboard

Display:

* Monthly Collections
* Expected Revenue
* Outstanding Balances
* Occupancy Rate
* Number of Active Tenants
* Maintenance Requests

---

### Collection Summary

Display:

* Total Rent Collected
* Total Outstanding
* Collection Rate
* Monthly Trends

---

## Module 8: Communication Center

The system shall allow managers to:

* Send announcements
* Notify selected tenants
* Notify all tenants

Examples:

* Water interruptions
* Security alerts
* Rent notices
* Maintenance schedules

---

# 6. User Roles & Permissions

## Super Administrator

Permissions:

* Manage all properties
* Manage subscriptions
* Access system-wide reports

---

## Property Owner

Permissions:

* View owned properties
* Access reports
* View collections

---

## Property Manager

Permissions:

* Manage tenants
* Manage payments
* Manage maintenance
* Send communications

---

## Caretaker

Permissions:

* View tenant records
* Update maintenance requests

---

## Tenant

Permissions:

* View balances
* Access receipts
* Submit maintenance requests
* Receive notifications

---

# 7. Non-Functional Requirements

## Performance

* Dashboard load time below 3 seconds
* Support at least 10,000 tenants
* Support multiple properties

---

## Security

* Secure authentication
* Role-based access control
* Encrypted passwords
* Audit logs for critical actions

---

## Availability

* 99% uptime target
* Daily backups

---

## Mobile Responsiveness

The system must work on:

* Mobile phones
* Tablets
* Desktop browsers

---

# 8. Future Enhancements (Phase 2)

The following features are intentionally excluded from the MVP:

* Utility billing
* Water meter readings
* Electricity billing
* Tenant screening
* Online lease agreements
* Accounting integrations
* Landlord mobile app
* WhatsApp integration
* M-Pesa automatic reconciliation
* AI-powered rent collection insights

---

# 9. MVP Scope

The first release shall include only:

1. Property Management
2. Unit Management
3. Tenant Management
4. Rent Tracking
5. Payment Recording
6. Receipt Generation
7. Automated Reminders
8. Maintenance Requests
9. Vacancy Tracking
10. Dashboard Reporting

The objective of the MVP is to validate market demand and achieve adoption among small and medium-sized apartment owners before expanding into a full property management platform.
