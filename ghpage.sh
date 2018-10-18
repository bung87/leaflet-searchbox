rm -rf dist;
npm run build;
git checkout gh-pages;
git rm demo.*;
cp -r dist/* .;
git add index.html *.png *.css demo.*;
git commit -m 'update page';
git push
