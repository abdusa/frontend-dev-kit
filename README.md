# Frontend Development Kit

Simple frontend task runner for your simple site using gulp.

## Features
1. SASS / SCSS support
2. Pug / Jade support
3. Auto reload browser for changed
4. Compress / zip your project
5. Concatenate your javascript file
6. Minifying your js file for production (soon)

## How to Usage

This project using gulp for task runner. Make sure your computer already install NodeJS. If not NodeJS can download here.
After installing NodeJS, clone or download this project. Open your terminal or cmd and type:

> example your project download and put into desktop folder

`cd frontend-dev-kit`

and then run `npm install` to installing all packages need.

After installing all packages run command
`gulp` or `gulp help` to see command available

## Folder Structure
```
│ config.js                  => config files contain folder location etc.
│ gulpfile.js                => gulpfile.js
│ package.json               => package.json for npm
│ README.md                  => README file
│
├───site                     => All compiled file and folder will be placed here
└───src                      => All your source code and assets will be placed here
    ├───assets               => All assets (img, js, sass) placed here
    │   ├───img               
    │   ├───js               => JS folder for put your js script
    │   │   │  main.js       
    │   │   └──lib           => this folder for your own library javascript not third-party library javascript
    │   └───styles         
    │         style.sass     => All style placed here, if you want to make it partially using '_' to create folder per module
    │
    └───markup               => Directory for templating project (index.html, index.pug, index.jade)
          index.pug
```

## Command Usage

gulp [command]

| command          | description   |
|---               |---|
|**help**          |Print help message how to use   |
|**clean**         |Clean all files on site directory|
|**zipit [option]**|Compress project into zip file|
|**--all**|Compress all files and folder|
|**--site-only**|Compress files site folder only|
|**serve**         |Compile, watch, and start browser-sync for auto reload|
|**serve:with-pug**|Like compile but using pug/jade for templating (make sure remove index.html and create index.pug before using it)|
|**build**         |Compile project only|
|**build:with-pug**|Like build but using pug / jade for templating|
