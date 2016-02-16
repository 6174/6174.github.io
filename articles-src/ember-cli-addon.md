@title: 创建一个 ember-cli-addon
@date: 2016-1-28

## 关于

最近公司主项目用到了 ember + ember-cli，虽然当前前端业内推崇 react , 但是接触到 ember-cli 过后，被 ember-cli 的工程化震撼到了，相比于 react， 前者算是一个 lib , 而后者更应该算是一个框架，这篇文章的主题不打算完整的介绍一下 ember，出于公司需要建一个公共组件库的目的， 这里介绍一下 ember-addon 相关的技术细节 

## 为什么需要 addon

addon 也就是插件模式，对于有多个 ember-cli 项目的情况，需要将公共的部分以组件的方式剥离出来，addon 就是 ember-cli 提供的剥离方式

## 如何创建一个 addon 

如何创建一个 addon 的部分，我直接提供文章参考链接了，本文更多的介绍一些其中遇到的细节问题和关键点

- [DEVELOPING ADDONS AND BLUEPRINTS](http://ember-cli.com/extending/#developing-addons-and-blueprints)
- [Creating an Ember.js Addon with the Ember CLI](http://johnotander.com/ember/2014/12/14/creating-an-emberjs-addon-with-the-ember-cli/)


## ember-cli 加载addon 的方式 

ember addon 是通过 npm 模块管理的，可以将 addon 发布到 npm 仓库当中， 当运行 `ember s` 的时候， ember-cli 会根据 package.json 里边的依赖遍历所有组件，如果发现组件的 package.json 的 keywords 里边有 

```javascript
"keywords": [
  "ember-addon",
  ...
]
```

那么就判断为一个 ember addon 并加载

## addon 目录结构 

主要的几个目录:

- **app**
- **addon**
- **vendor** 

对于 app 目录，ember-cli 会将这个目录合并到 项目的 app 目录中，合并并不是意味着写法能完全和项目 app 目录一致，有两个需要注意的点：

1. app 不支持 pod 方式，具体参考这个 issue [Templates in pods from addons ](https://github.com/ember-cli/ember-cli/issues/1634) , 
2. style 不支持 less、sass 

对于 addon 目录里边的文件，可以在项目代码里边当模块 import 进去，比如

```javascript
// file your-addon/addon/components/your-component.js
import co from 'your-addon/components/your-component'
```

app 目录合并，addon 目录引用这两个点应该是 addon 机制的核心， 理解了就知道怎么去创建一个组件了 

对于 vendor 目录里边的文件，可以直接通过  'vendor/file' 的路径引用, 所以如果想在 addon 中使用 less, 可以如下方式 

```less
// file your-addon/vendor/styles/style.less
// project/app/style/app.less
import 'your-addon/vendor/styles/style.less';
```


## ember-cli 开发测试

写完 addon 总要有地方看看 addon 写成什么样子，目前有两种方式

### 第一种

在 your-addon/test 目录下面有个 dummy project 
```shell
 your-addon$ ember s
```
直接在 addon 项目目录 启动服务， 会基于 dummy 项目启动一个 project，这个项目和其他的项目完全一样，找到 application.hbs , 在其中引用组件就行  

### 第二种 

在一个项目中直接引用组件, 通过 npm link 的方式在项目中建立一个对组件的映射

```shell
your-addon$ npm link
your-project: npm link your-addon
your-project: vim package.json // 依赖中添加 "your-addon": "*"
```


## 常见的一个问题 

初始化的项目 ember s ，打开浏览器会报错， 原因是 jQuery 的版本问题（这都能 breakdown 整个项目，醉了），修改 bower.json 中的 jQuery 版本为 1.11.3 , 重新 bower install 就能 work 了







