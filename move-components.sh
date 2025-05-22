#!/bin/bash

# Create a backup directory for the components
mkdir -p backup_components

# Move all component files from pages/components to the backup directory
mv src/pages/components/* backup_components/

# Create an empty .gitkeep file to keep the directory structure
touch src/pages/components/.gitkeep

echo "Components moved to backup_components directory"
