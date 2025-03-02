---
sidebar_position: 1
slug: /
---

# Getting Started

Welcome to the LogicApps UX documentation! This guide will help new engineers set up and navigate the project. Make sure to follow the steps below to ensure a smooth setup process. You can find the details about Power Automate Designer Community Contribution at the end of this doc. 

## Prerequisites

Ensure you have the following installed on your system:

- Node.js v16 or higher
- MkCert
- (Optional) Nx CLI

### MkCert Installation

MkCert is a one-time installation. Follow the instructions provided at [MkCert GitHub Repository](https://github.com/FiloSottile/mkcert) to install it. After the installation, run the following command:

```bash
mkcert -install
```

### Nx CLI Installation (Recommended)

To install the Nx CLI, run:

```bash
npm install -g nx
```

## Running the Code

First, navigate to the root level of the repository and run:

```bash
npm install
```

**Note:** All commands should be executed from the root repo directory.

### Standalone Designer (for testing)

- Code Location: `/apps/designer-standalone`

To start the standalone designer, run:

```bash
nx serve
```

### Building the Designer Library (for NPM publishing)

- Code Location: `/libs/designer`

To build the designer library, run:

```bash
nx run designer:build
```

### Unit Tests

- Code Location: `/libs/designer/**/__test__/*.spec.ts(x)`

To run unit tests, execute:

```bash
nx test designer
```

**Debugging tests:** For easier debugging, install [Jest for VS Code](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest). No additional configuration should be needed, but you may need to restart your VSCode instance.

### End-to-End (E2E) Tests

- Code Location: `/apps/designer-e2e`

To run E2E tests, execute:

```bash
nx run designer-e2e:e2e
```
# Power Automate Designer Community Contribution
We are excited to announce that the new Power Automate designer is open source on Github and is actually built on top of Logic Apps designer. We are accepting contributions to the core designer, the changes for which will show up in both Logic Apps and Power Automate. The contribution can fall into these categories:

### Bugs- Choose from our Issues list Issues · [Azure/LogicAppsUX (github.com)](https://github.com/Azure/LogicAppsUX/issues) or introduce a new one that you personally relate to. 

### Features- Choose one from our list · [Features List (github.com)](https://github.com/Azure/LogicAppsUX/discussions/categories/feature-requests) for which the topic starts with (_PAuto + LA)_. 

Please reach out to kisubedi@microsoft.com if you have any questions.

# PnP Badge Program for contributions
Power Platform PnP will provide you badges for accepted contributions. 

**For issues contribution:**

If 1 bug fix, you will be issued a Power Automate Issue Contributor badge.
If >=5 bug fixes, you will be issued a Power Automate Designer Issue Specialist badge.
If >= 8 bug fixes, you will be issued a Power Automate Designer Issue Expert badge.

**For feature contribution:**

If 1 feature, you will be issued a Power Automate Designer Specialist.
If >=2 feature, you will be issued a Power Automate Designer Expert badge.

To apply for a badge, you need to fill a simple application with PnP and provide your github username along with requested badge name.
