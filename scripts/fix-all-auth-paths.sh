#!/usr/bin/env bash

# Script to fix all auth import paths in API routes
# This calculates the correct relative path depth for each file

find src/app/api -name "*.ts" -type f | while read -r file; do
    # Check if file contains auth import
    if grep -q 'from.*auth"' "$file"; then
        # Count directory depth (number of slashes)
        depth=$(echo "$file" | tr -cd '/' | wc -c)
        
        # Calculate correct number of ../ needed
        # src/app/api/route.ts = 3 slashes, needs 3 ../
        # src/app/api/foo/route.ts = 4 slashes, needs 4 ../
        correct_levels=$depth
        
        # Build the correct path
        correct_path=""
        for ((i=0; i<correct_levels; i++)); do
            correct_path="../$correct_path"
        done
        correct_path="${correct_path}auth"
        
        # Replace any auth import with the correct path
        sed -i "s|from [\"']\.\.\/\+auth[\"']|from \"$correct_path\"|g" "$file"
        
        echo "Fixed: $file (depth=$depth, path=$correct_path)"
    fi
done

echo ""
echo "✓ All auth import paths fixed!"
