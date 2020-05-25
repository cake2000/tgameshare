# TGame
Learn AI Programming Through Games

## Included

 - [x] Meteor 1.5
 - [x] Mantra architecture
 - [x] React 15.5.4
 - [x] React Router v4
 - [x] Mongo Simple Schema
 - [x] ECMAScript 6 and JSX
 - [x] Styled-component
 - [x] Eslint airbnb

## Getting Started

### Prerequisites
 - [Git](https://git-scm.com/)
 - [Meteor](https://www.meteor.com/install)
 - [Node.js and npm](nodejs.org) Node >= 4.x.x
 - [Mantra-Cli](https://github.com/mantrajs/mantra-cli)
 - [Storybook](https://github.com/storybooks/storybook)
 
### Run dev
  - `meteor`
  - The project will be started at [localhost:3000](http://localhost:3000/)

------

## TESTING

### **INSTALLATION**

**PREREQUISITE**

**Oracle JDK v1.8+** [(Download Here)](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)
You can check your Java version in the terminal with `java -version` (single dash)

Be sure to install the JDK not the JRE.

**GLOBAL INSTALLATION**
```sh
npm install -g chimp
```

Try not to use `sudo`. If you have any trouble, use the alternative method below.

**LOCAL INSTALLATION**
```sh
npm install chimp
```
and then you can run using `./node_modules/.bin/chimp`

### **TROUBLESHOOTING**

**Permission Denied**
If you get this error message:

`Error: EACCES: permission denied, mkdir...`

Try deleting the .selenium directory using:

```SH
sudo rm -rf /usr/local/lib/node_modules/chimp/node_modules/selenium-standalone/.selenium`
```

Failed at the fibers
If you get this error message:

`npm ERR! Failed at the fibers@1.0.9 install script 'node build.js || nodejs build.js'.`

Upgrade to Node 4.x+

### **SHELL**

For single run
```sh
yarn chimp
```

For run with `watch` parame

```sh
yarn chimp:watch
```

### **DOCUMENTATION**

- [Chimp](https://chimp.readme.io/)
- [WebdriverIO](http://webdriver.io/api.html)