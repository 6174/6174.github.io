@title: Thinking in Vue.js （二）
@date: 2014-12-25

> [上一篇：Thinking in Vue.js （－）](http://6174.github.io/blog/articles/thinking-in-vue-one.html)


![2014_08_23_140756](http://img4.tbcdn.cn/L1/461/1/00ae70bf458fae22a375409a9afce33323385a59)


## Dive into the code
继续我们的详细些的源码解读  

这是src目录的主要模块

![2014_08_23_140750](http://img4.tbcdn.cn/L1/461/1/c29c12c0a1203e41fc2b03ec0a5a9d14a2c91db8) 

**解读：**
  
1. `main.js`: 入口文件，暴露`vm` 类的facade ，入口文件初始化了预定义的各种扩展， 在VUE中， 扩展包括： `directive`, `filter`, `partial`, `component` . `directive` 和`component`上一篇文章中以及讲了，对`filter`举一个例子` {{aWord | toUppercase }}`, 这里边的toUppercase就是一个filter，`partial`会替换元素的innerHtml。   

2. `vm.js`：也就是VUE对象类，在vue中所有的方法都是围绕它打转，其实vm也只是一个傀儡，为了讲vm的方法解耦合独立出来的模块 

3. `compiler.js`：vue.js 的核心，1k行左右的代码，主要的逻辑都在这里处理，vm的绑定，component的设置，计算属性的设置等等都在这里。 1k行已经很短了，vue做的很好的就是解耦合，vue以nodejs的方式来编写前端代码，再用自己的打包工具来合并。// 推荐另外一款打包工具：browserify, 还有sourcemap功能哦，当然你也可以用kclean=.= 

4. `observer.js`: observer模块就是做到连对象的子对象的改变都能监控的模块，实现方式可谓淫巧。  

5. `binding.js`:  前面已经介绍过binding，binding作为数据和html指令的桥梁 

6. `directive.js`: html中的奇怪的东西都叫directive，就是这个模块来管理的，directive有良好的扩展性，内置的指令都是基于扩展的方式来实现的， 放在directives目录 

7. `emitter.js`: S.eventTarget ......

8. `batcher.js`: 批处理操作，所有的update都是基于批处理方式的，没测试过这样到底能够提高多少性能，但是方式很赞赞赞   

9. 其他： parser模块，html中的指令是需要字符解析的，当然这个不会有模板那么麻烦，只是简单的属性内字符解析（也不是想像的那么简单，人家实现的简单而已）。 utils 和其他的一些次重要的模块。


## 从new Vue 开始着手

![2014_08_23_142514](http://img4.tbcdn.cn/L1/461/1/90d5d631bd2f252721ba75da115c17a2aebefc1b)


 **解读：**  

 `new Vue` 过后会进入`vm`模块，就像刚才介绍的一样， vm模块其实什么也没做，只是把所有的参数和自己都抛给了`compiler`模块， 于是像老大一样叫`compiler`卖命工作。。。。。  

## compiler如何给VM卖命的  

**总共花了五步，简单来说如下** 

![2014_08_23_144604](http://img4.tbcdn.cn/L1/461/1/fdf169115b5ea7db54b272b35fe20306f624888f)
   
**下面深入的讲一下这五步骤** 

1.  **第一步:** 初始化options数据，就是new Vue的时候传入的参数，vue的可配置参数真不少：
    -  `components`: 如果有配置component，会初始化依次这些component  
    -  `partials`:  partial需要解析调用` Parser.parserTemplate(partials[i])`来解析  ，pasrseTemplate的目的是为了讲字符串转化为DocumentFragment
    -  `filters`: 判断filter是否依赖其他属性，如果是标记
    -  `template`: options的配置里变，可以用el，也可以使用template，如果template为字符串也需要` Parser.parserTemplate(template)`.   


2. **第二步:**  初始化元素， 进行一些多选处理和容错处理，el不存在？ 用template替换，el可以根据option配置属性参数

3.  **第三步:**  初始化vm 

```javascript 
     var    options   = this.options,
            compiler = this;
            vm          = this.vm;

        // COMPILER 
        utils.mix(this, {
            // vm ref
            vm: vm,
            // bindings for all
            bindings: utils.hash(),
            // directives
            dirs: [],
            // property in template but not defined in data
            deferred: [],
            // property need computation by subscribe other property
            computed: [],
            // composite pattern
            children: [],
            // event emitter
            emitter: new EventTarget()
        });

        // COMPILER.VM 
        utils.mix(vm, {
            '$': {},
            '$el': this.el,
            '$options': options,
            '$compiler': compiler,
            '$event': null
        });

        // PARENT VM
        var parentVM = options.parent;
        if (parentVM) {
            this.parent = parentVM.$compiler;
            parentVM.$compiler.children.push(this);
            vm.$parent = parentVM;
            // INHERIT LAZY OPTION
            if (!('lazy' in options)) {
                options.lazy = this.parent.options.lazy;
            }
        }
        vm.$root = getRoot(this).vm;
        function getRoot (compiler) {
            while (compiler.parent) {
                compiler = compiler.parent;
            }
            return compiler;
        }
``` 

 ![2014_08_23_150851](http://img3.tbcdn.cn/L1/461/1/3974887049adbdd1978e6df067dca5921ca5bb46) 


4. **第四步：**  初始化data，这一步骤虽然不简单，但是可以简单的理解为两个小步骤：初始化observer， observer.observeData(data) 。 这一步完成过后就可以实现数据的双向绑定了，厉害的。。。。。

5. **第五步：** compileHtml，以递归的方式找到html中的指令，然后创建指令，然后绑定指令。注意是递归的，如果遇到v-repeat, v-component这种就会创建子vm


## binding.js  如何工作 

大概就是这样

![2014_08_23_152703](http://img4.tbcdn.cn/L1/461/1/cb867f5a61b76c814ad1e6018490e47332ffe952)

**解读：**  

1.   `binding.js ` 定义了subscribe数组和publish数组， 对于计算属性就是通过订阅方式来实现的，上面说过一个binding对应多个directive， 是的，所以这里有一个directive数组，每次binding.update都会更新directives和subscribes。 

2.  binding 内部维护有一个 batcher，之前介绍过batcher为批处理，binding调用update的时候实际上就是忘batcher里边push执行函数



## then what  

=.=  表示Vue.js 源码其实写的很好，模块化，解耦合，不像avalon.js , 讲了这么多可能让你觉得很复杂的样子

差咧， 我只想说 


![2014_08_23_164554](http://img1.tbcdn.cn/L1/461/1/f6bc5140949c0d38397a4776048ab0838aeb19be) 


－－－－－－已经没有感情了， 但是我还想说，写篇应用的可否？-------------------

 