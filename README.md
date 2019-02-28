# BookLike_PDF_Creator
App to restructure pdf in a way so it can be printed just like a book.

## About building the project

One thing to know about this project is that it uses electron combined with native modules from hummus library,
which makes installation it a bit complicated to build the project

```bash
# First you should run
npm install --save-dev electron-rebuild

# Now you can run
npm install

# And finally (note that you should run this every time before "npm install")
./node_modules/.bin/electron-rebuild

# If you're using Windows use
.\node_modules\.bin\electron-rebuild.cmd
# instead
