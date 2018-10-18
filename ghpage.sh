rm -rf dist;
npm run build;
cp -r dist/* .;
git checkout gh-pages;
git rm demo.*;

git add index.html *.png *.css demo.*;
git commit -m 'update page';
git push