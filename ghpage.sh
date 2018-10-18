rm -rf dist;
npm run build;
git checkout gh-pages;
git rm demo.*;
cp -r dist/* .;