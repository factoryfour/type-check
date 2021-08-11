# Remove existing /lib folder
rm -rf lib

# Compile the app into .js, .js.map, and .d.ts files
tsc

rm -rf lib/tests
