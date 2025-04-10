# Event Processor

## Overview
The Event Processor is the core component that analyzes blockchain events from the Polkadot.js API Client, applies business logic, and determines when alerts should be triggered. It acts as the central processing hub for all monitoring activities.

## Role in Architecture
- Receives raw events from the Polkadot.js API Client
- Filters, transforms, and enriches event data
- Applies monitoring rules and detection logic
- Triggers alerts when specific conditions are met
- Persists relevant event data to the database

## Key Functionalities
- Event filtering and classification
- Pattern recognition and condition matching
- Data enrichment (adding context to raw blockchain events)
- Rule evaluation for alert generation
- Managing monitoring configurations
- Stateful analysis for detecting multi-event patterns

## Technical Implementation
- Implements a pipeline of processing stages for each event
- Uses a configurable rule engine to evaluate alert conditions
- Maintains in-memory state for complex event processing when needed
- Handles batching and aggregation of related events
- Interfaces with both the Alert Service and DB Store

## Processing Logic Examples
- Detecting validator slashing events by monitoring `staking.Slashed` events
- Identifying large balance transfers by filtering `balances.Transfer` events above a threshold
- Monitoring governance activities through various democracy and council events
- Tracking parachain auctions and crowdloans
- Detecting network upgrades or runtime changes

## Extensibility
- Modular design allows for adding new event handlers
- Pluggable rule engine for different types of monitoring scenarios
- Configuration-driven approach to enable/disable various monitoring capabilities

## Performance Considerations
- Optimized for low latency processing
- Efficient event filtering to minimize unnecessary processing
- Stateful processing with memory management to prevent leaks 