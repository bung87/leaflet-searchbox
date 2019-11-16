rm -rf build/examples;
yarn run build;

git checkout gh-pages;
cp -r build/examples/* .;
git rm --cached --ignore-unmatch demo.*;

git add index.html *.png *.css demo.*;
git commit -m 'update page';
git push origin gh-pages
