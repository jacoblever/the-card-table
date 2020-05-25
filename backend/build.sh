# Compile the TypeScript to JavaScript
npm run build

# Copy the common module to the ./build/common directory
mkdir -p ./build
rsync -avzh ../common ./build/

# Update references in compiled JavaScript files to the copy of the common module inside the lambda directory
find ./*.js -type f -exec sed -i -e 's/\.\.\/common\//\.\/build\/common\//g' {} \;

# Delete copy of original files (not quite sure why they are made)
rm ./*-e
