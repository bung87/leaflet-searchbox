rm -rf dist;
npm run build;

git checkout gh-pages;
cp -r dist/* .;
git rm --cached --ignore-unmatch demo.*;

git add index.html *.png *.css demo.*;
git commit -m 'update page';
git push origin gh-pages
