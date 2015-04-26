@title: React-Native 和 React-Web 融合
@date: 2015-4-15 

## 关于

对于react-native在实际中的应用， facebook官方的说法是react-native是为多平台提供共同的开发方式，而不是说一份代码，多处使用。 然后一份代码能够多处使用还是很有意义的，我所了解到的已经在尝试做这件事情的：

1. [modularise-css-the-react-way](https://medium.com/@jviereck/modularise-css-the-react-way-1e817b317b04)
2. [react-style](https://github.com/js-next/react-style)
3. [native-css](https://github.com/raphamorim/native-css)  

现阶段大家都是在摸索中，且react-native 还不够成熟，为此我也想通过一个实际的例子提前探究一下共享代码的可行性。 

下面是我以SampleApp做的一个简单demo， 先奉献上截图：

**web 版本：**

![](http://gtms02.alicdn.com/tps/i2/TB1KhiiHFXXXXbBXpXXhV2lQVXX-512-743.png)

**react-native版本：**

![](http://gtms04.alicdn.com/tps/i4/TB1Fxx6HFXXXXXdXVXX66HwTVXX-487-801.png)


## 初步想法 

### 组件
react-native基本上是View套上Text这样来布局，为了做web和native的兼容，我们得提供继承版本的View ，针对不同的平台返回不同做兼容，我们将提供：

1. Share.View -> View  (reac-native = View , web = div)
2. Share.P + Share.Span -> Text (Text在react-native中分为块级别和inline级别所以得用两个元素来区分)

### 样式 
我们知道react-native的样式是css很小的一个子集，大概支持50种属性，为了做到web和native使用同样地样式，那么我的想法是：

1. 使用css文件来编写样式，通过编译的方式生产不同平台需要的样式
2. 对于web，使用auto-prefixel处理，生产web兼容的css代码
3. 对于react-native，生成对应的styles.js
4. css的写法用OOCSS的方式

这样做的另外一个原因是，因为css是全集，react-native是子集，全集到子集可以通过删减来处理，但是如果想通过子集到全集就会很麻烦（react-style就是通过react-native来生成css）。 且这样做还有很多好处，例如我们可以支持react-native里边不支持的css写法，例如`padding: a b c d;` 这种写法很容易得到兼容。

>其实这里，无论react-native还是react-web都支持`style={}`这样的写法. 上面例子中的web截图其实是没有引用css的，但inline样式对于web来说并不是优选。



## 实现思路

首先大概整理一下我们需要解决的问题：

1. 如何区分web和native
2. js如何对应不同的平台来编译，因为react-native使用的是自己的依赖管理packager
3. css如何编译为js
4. 代码结构应该是怎样的

### 问题一 ： 如何区分web和native

react-native 里边会有window变量吗？我试了一下，是有的，那window变量里边不可能有location，document之类的吧， 借着这种想法，可用如下方法来区分native和web

```javascript
 var isNative = !window.location;
```

### 问题二：如何对应不同平台打包 

对于react-native，是通过packager来打包的，具体的实现和逻辑可以随时查看packager的readme文档。 那我们怎么将适用于native的代码打包成web的代码，首先想到的是`browserify`, `webpack`。 都是遵循commonJs规范，个人更喜欢前者， 用它来应该足以满足需求。  


### 问题三： css如何编译为js

前面提到了`native-css` , 可以用它来帮助我们完成打包。 

### 问题四：代码结构应该是怎样的

web和native的代码都写在同一个地方，如何做区分呢？ 这个问题当然最好就是不做区分，或者就像女生的衣服，期望是越少越好，但永远不可能木有（猥琐了：-】）。  

我设想中的一个最简模型的目录结构，web和ios有不同的入口，web和ios有单独的目录， 组件共享， 如下：

```
├── compo.js            // 我们会使用到得公共组件
├── styles.css          // compo的样式文件
├── index.web.js        // web 入口
├── index.ios.js        // ios 入口
├── shared.js           // 做兼容的共享变量文件
├── ios                 // ios 目录
└── web                 // web 目录
    ├── index.html      // web 页面
    ├── index.web.js    // 打包过后的js
    └── react.js        // react.js依赖
```

好像很复杂的样子， 其实相对于原本的SampleApp，只是多了`index.web.js` , `web目录`, `shared`三者。 然后style通过style.css来描述。 

## 具体实现

我们已经整理了具体的实现思路，下面是我就会直接吐出我的实现代码， 重点的地方都会在源码里边有注释 

#### 先看应用代码：

**ios入口：index.ios.js**
```javascript
    /**
     * Sample React Native App
     * https://github.com/facebook/react-native
     */
    'use strict';
    var React = require('react-native');
    var Compo = require('./compo');
    React.AppRegistry.registerComponent('ShareCodeProject', () =>  Compo);
```

**web入口：index.web.js** 
```javascript
    /**
     * for web
     */
    var Compo = require('./compo');
    React.render(<Compo />, document.getElementById('App'));
```


**样例组件：compo.js**
```javascript
    // 依赖的公共库，通过它获取兼容的组件
    var Share = require('./shared');
    // styles是style.css build过后生成的style.js
    var styles = require('./styles');
    var React = Share.React;
    var {
      View,
      P,
      Span
    } = Share;

    var Compo = React.createClass({
      render: function() {
        return (
          <View style={styles.container}>
            <P style={styles.welcome}>
              Welcome to React Native!
            </P>
            <P style={styles.instructions}>
              To get started, edit index.ios.js
            </P>
            <P style={styles.instructions}>
              Press Cmd+R to reload,{'\n'}
              Cmd+Control+Z for dev menu
            </P>
          </View>
        );
      }
    });

    module.exports = Compo;
```

**组件样式: style.css**
```css
    /**
     * 大家可能发现了css的写法还是小驼峰，是的不是横杠，暂时我们还是以这种方式处理
     * native-css 目测不支持横杠，（自己重写native-css相对来说是比较容易的，完全可以做到css兼容到react-native的css子集）
     */
    .container {
        flex: 1;
        justifyContent: center;
        alignItems: center;
        backgroundColor: #F5FCFF;
    }

    .welcome {
        fontSize: 20;
        textAlign: center;
        margin: 10;
    }

    .instructions {
        textAlign: center;
        color: #333333;
        marginBottom: 5;
    }
```

**index.html**
```html
    <!DOCTYPE html>
    <html>
      <head>
        <title>Hello React!</title>
        <script src="./react.js"></script>
        <!-- No need for JSXTransformer! -->
      </head>
      <body>
        <div id="App"></div>
        <script src="./index.web.js"></script>
      </body>
    </html>
```


#### Share部分的处理

**shared.js**
```javascript
    var Share = {};
    var React = require('react-native');
    var isNative = !window.location;
    /**
     * 判断是web的时候，重新赋值React
     */
    if (window.React) {
        React = window.React;
    } 
    Share.React = React;
    
    /**
     * 做底层的兼容， 当然这里只是做了一个最简demo，具体实现的时候可能会对props做各种兼容处理
     */
    if (!isNative) {

        Share.View = React.createClass({
            render: function() {
                return <div {...this.props}/>
            }
        });

        Share.P = React.createClass({
            render: function() {
                return <p {...this.props}/>
            }
        });

        Share.Span = React.createClass({
            render: function() {
                return <span {...this.props}/>
            }
        });
    } else {
        // alert('isNative')
        Share.View = React.View;
        Share.P = React.Text;
        Share.Span = React.Text;
        Share.Text = React.Text;
    }

    module.exports = Share;
```


#### build打包程序

```javascript
    var fs = require('fs');
    var nativeCSS = require('native-css'),
    var cssObject = nativeCSS.convert('./styles.css');
    
    toStyleJs(cssObject, './styles.js');
    buildWebReact();

    /**
     * native-css获取到得是一个对象，需要将cssObject转化为js代码
     */
    function toStyleJs(cssObject, name) {
        console.log('build styles.js \n');
        var tab = '    ';
        var str = '';

        str += '/* build header */\n';
        str += 'var styles = {\n';

        for(var key in cssObject) {
            var rules = cssObject[key];
            str += tab + key + ': {\n';
            for(var attr in rules) {
                var rule = rules[attr];
                str += tab + tab + attr + ': ' + format(rule) + ',\n'
            }
            str += tab + '},\n' 
        }

        str += '};\n'
        str += 'module.exports = styles;\n'

        fs.writeFile(name, str)
        function format(rule) {
            if (!isNaN(rule - 0)) {
                return rule;
            }
            return '"' + rule + '"';
        }
    }

    /**
     * 构造web使用的react
     */
    function buildWebReact() {
        console.log('build web bundle');
        var browserify = require('browserify');
        var b = browserify();
        b.add('./index.web.js');

        // 添加es6支持
        b.transform('reactify', {'es6': true});

        // ignore掉react-native 
        b.ignore('react-native')
        var wstream = fs.createWriteStream('./web/index.web.js');
        b.bundle().pipe(wstream);
    }

```

## 也尝试一下由react-native 到react-web的兼容方案

### 问题
1. flexbox的写法在react-native上面我们会发现， 不用在父元素上声明`display: flex;` 在web上必须要做这样的声明， 所以我们需要让设置了`flex:*`的元素的父元素`display: flex;` 。
2. flexbox在android上是由很多bug的，所以必须要解决兼容性问题`webkit-box`  

### 解决方案

### 1. nested 的style写法

```javascript
    styles = StyleSheet.create({
        mod: {
            flexDirection: 'row',
            item: {
                flex: 1
            }
        }
    });
```

这样的写法有些像less，我们可以知道元素的层级关系， 这样我可以遍历这个对象，查找子元素有设置flex的，父元素加上`display:flexbox`。 

### 2. 通过自定义元素

```javascript
 var GridSystem = require('GridSystem');
 var {
    Row,
    Grid,
    Grid6,
    Grid4
 } = GridSystem;
 <Row ...>
    <Grid/>
    <Grid/>
 </Row>
```

通过标签的方式， 相当于给react-native或者react添加了一个网格系统，同时我们可以直接在Row上设置`display:flex`.

### 3. 遍历查找

完全同react-native原生的写法，直接在web中兼容，遍历所有有flex样式的节点，直接做兼容。

```javascript
    componentDidMount: function() {
        var $node = this.getDOMNode();
        var $parent = $node.parentNode;
        var $docfrag = document.createDocumentFragment();
        $docfrag.appendChild($node);

        var treeWalker = document.createTreeWalker($node, NodeFilter.SHOW_ELEMENT, { 
            acceptNode: function(node) { 
                return NodeFilter.FILTER_ACCEPT; 
            } 
        }, false);

        while(treeWalker.nextNode()) {
            var node = treeWalker.currentNode;
            if (node.style.flex) {
                flexChild(node);
                flexParent(node.parentNode);
            }
        };

        $parent.appendChild($docfrag);
    }

    function flexChild(node) {
        if (node.__flexchild__) {
            return;
        }
        node.__flexchild__ = true;
        var flexGrow = node.style.flexGrow;
        addStyle(node, `
            -webkit-box-flex: ${flexGrow};
            -webkit-flex: ${flexGrow};
            -ms-flex: ${flexGrow};
            flex: ${flexGrow};
        `);
        node.classList.add('mui-flex-cell');
    }

    function flexParent(node) {
        if (node.__flexparentd__) {
            return;
        }
        node.__flexparentd__ = true;
        node.classList.add('mui-flex');
    }
```

```css
    .mui-flex {
        display: -webkit-box!important;
        display: -webkit-flex!important;
        display: -ms-flexbox!important;
        display: flex!important;
        -webkit-flex-wrap: wrap;
        -ms-flex-wrap: wrap;
        flex-wrap: wrap;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        -webkit-flex-direction: column;
        -ms-flex-direction: column;
        flex-direction: column;
    }

    .mui-flex-cell {
        -webkit-flex-basis: 0;
        -ms-flex-preferred-size: 0;
        flex-basis: 0;
        max-width: 100%;
        display: block;
        position: relative;
    }
```



## 总结

这个demo很简单，实际应用中应该会有很多地方的坑， 比如：

1. 模块中依赖只有native才有的组件
2. Native模块的事件处理和web大不相同 
3. 现实环境中的模块更多，更复杂，如何做模块的管理

对于`write once, run anywhere` 这个观点.  相信不同的人会有不同的看法，但无论如何，如果兼容成本不大，这样的兼容技术方案对业务开发是有极大意义的。

ps0: 这里仅仅做可行性方案的分析，不代表我认同或不认同这种方案。
ps1: 大家如果有更好的方案，求教，求讨论。
ps2: 据说微博关注@sysu_学家不会怀孕 
