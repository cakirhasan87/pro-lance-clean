# Managing `.npmrc` in the BITO VSCode Extension

## What is `.npmrc`?

- The `.npmrc` file is a configuration file for npm that helps manage package installation and authentication. 
- It is essential for defining private registry access (BITO Nexus repository) and maintaining secure credentials.

## Why is `.npmrc` kept as Project-Specific in the project?

- In our setup, `.npmrc` is not committed to the repository for security reasons. 
- Instead, it is added dynamically during the build process. 

This approach prevents exposing sensitive authentication tokens (or credentials) while ensuring secure access to private npm packages.

## Where to Add the `.npmrc` File?

The `.npmrc` file needs to be placed in the following modules:

1. **Module BITO UI Path:** `ide-plugins/ui-code/.npmrc`
2. **Module BITO as a VSCODE extension Path:** `ide-plugins/vscode/.npmrc`

## `.npmrc` File Contents

```ini

# Specify the registry for the @bito scope
@bito:registry=http://nexus.bito.ops:8083/repository/bito-builds-npm/

# Authentication details for the Nexus repository
//nexus.bito.ops:8083/repository/bito-builds-npm/:username=developer
//nexus.bito.ops:8083/repository/bito-builds-npm/:password=2js20TNmknFd
//nexus.bito.ops:8083/repository/bito-builds-npm/:email=devops@bito.ai

```

## License

© 2021 Bito Inc - All Rights Reserved.