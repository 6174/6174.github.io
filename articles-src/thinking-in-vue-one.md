@title: Thinking in vue (一)
@date: 2014-12-23
## ABOUT

这不， 前几天UC分享了他们前端工程化实践，介绍了牛逼的scrat和高端洋气的Vue.js以及AngularJs结合应用。觉得叼得不行，怎么可以这么叼，不用兼容IE family 也行？

Mother egg，脑补了一下， UC的哥哥姐姐们只关心UC浏览器， 呵呵呵呵呵呵！

屌丝不哭， 站起来撸， MF的时代来了，不就是MVVM么， 该搞的都要搞起！

![1](http://img1.tbcdn.cn/L1/461/1/b9796446880e71873c890a9920a1c605d97633ee)

周末花了两天时间把玩了一下VUE.js，觉得无论是源码结构还是MVVM的整体设计都有忒多值得学习的地方，下面将分为三个小节来分享一下这两天的所学所思。


## OUTLINE 

1. **STEP 0: 关于MVVM** 

2. **STEP 1: Have A Try** 

3. **STEP 2: VUE的MVVM**

4. **STEP 3: VUE源码实现**


## STEP ZERO: 关于MVVM

![2](http://img2.tbcdn.cn/L1/461/1/edfebf01b13049b2946a6d093866907622ca8797)

相信大家都已经对MVVM有所了解了，简单而言就是将js对象和html无缝链接，任何一方的改变都能够同步到另外一方，而不用手动更新。


为什么要MVVM，近几年来MVC，MVP，MV star层出不穷，其实都是在围绕着两个东西在打转，M -> Model, V -> View 。前端是什么？ 除了解决交互问题大多是在解决数据渲染问题，没有哪一个MVX是银弹，利弊同在，但在解决数据渲染的问题上，MVVM模式是最棒的， 么么嗒。


有人说MVVM当然得谈谈AngularJs ， 呵呵呵呵， 对于AG窝只想说：

![3](http://img3.tbcdn.cn/L1/461/1/faf4f7237c30368dda4881430e597b43335f952e)

窝其实支持国产货，表鄙视我，谁说MVVM不支持ie6，正美带着**avalon.js**要说No（司徒正美，**《Javascript框架设计》**作者）。说的是真心话， 正美是个性能偏执狂，**avalon.js** 不仅小巧精干速度快耐力好而且还支持ie family (使用`VBS`来兼容 `definePropery`)。 源码优点是很精炼，缺点是很精炼（1个js文件走天下，吐槽不能）。当然这篇文章的主角是VUE，所以不深究avalon了，那我为什么不谈avalon而谈vue，原因就是————-vue支持`component` 。

![2014_08_21_230703](http://img4.tbcdn.cn/L1/461/1/5e0e390eadded8cb9b04083c4773a8336280c847)

**VUE**的**component**并非真正意义上的**web component**，我认为是一种web compoent的实践方式，而从业务开发的角度来讲，这种方式简直可以和现在进行的前后端解耦＋前后端组件化开发kiss and hug 。

## STEP ONE: Have A Try


先引用一句话： 
> source code is the best document 

1. git clone https://github.com/yyx990803/vue
2. cd vue/expamples
3. please yourself ，先把玩一下commits这个案例，commits简单来说就是从vue的git repo中拉取最新的commit来展示。
4. 如果你急不可耐，戳这里：http://vuejs.org/examples/commits.html

**效果图如下：**  
![_2014_08_22_1_25_36](http://img3.tbcdn.cn/L1/461/1/6ba7c261c993ab8c859b7bac545fa94c27958d0a)

### 看看commits的源码：
 **index.html**  

  ```html
          <div id="demo">
            <h1>Latest Vue.js Commits</h1>
            <input type="radio" id="master" name="branch" v-model="branch" value="master">
            <label for="master">master</label>
            <input type="radio" id="dev" name="branch" v-model="branch" value="dev">
            <label for="dev">dev</label>
            <br>{{branch}}
            <ul>
                <li v-repeat="commits">
                    <a href="{{html_url}}" target="_blank" class="commit">{{sha.slice(0, 7)}}</a>
                    - <span class="message">{{commit.message | truncate}}</span><br>
                    by <span class="author">{{commit.author.name}}</span>
                    at <span class="date">{{commit.author.date | formatDate}}</span>
                </li>
            </ul>
        </div>
  ```

**app.js** 
  ```javascript
     /**
      *  new VUE 返回的VM对象
      */ 
    var demo = new Vue({
        el: '# demo',
        /**
         * 这个就是我们绑定的数据对象
         * 初始化了一个属性branch，在这里未来可能还有一个属性叫commits
         * branch 对应html中的v-model ，{{branch}}
         * commits 对应commit列表
         *
         */
        data: {
            branch: ‘master’
        },
        /**
         * vm创建成功的回调
         */
        created: function() {
            /**
             * $watch可以关注branch属性的变动
             * branch 一变动就去获取当前branch的commits数据
             */
            this.$watch(‘branch’, function() {
                this.fetchData()
            })
        },
        // 过滤器先掠过
        filters: {
            truncate: function(v) {
                var newline = v.indexOf(‘\n’)
                return newline > 0 ? v.slice(0, newline) : v
            },
            formatDate: function(v) {
                return v.replace(/T|Z/g, ‘‘)
            }
        },
        // vm对象的实例方法
        methods: {
            // 刚在调用的fetchData方法就定义在这里
            fetchData: function() {
                var xhr = new XMLHttpRequest(),
                    self = this;
                xhr.open(‘GET’, 'https: //api.github.com/repos/yyx990803/vue/commits?per_page=3&sha=' + self.branch)
                xhr.onload = function() {
                    self.commits = JSON.parse(xhr.responseText)
                }
                xhr.send()
            }
        }
    })   
  ```

代码应该再清晰不过，对于这种重后台拿数据，然后渲染到html中的模式， MVVM的能力就是把前端代码压缩简单到极致，**It's a Magic** 。

## STEP Three: VUE的MVVM


![2014_08_21_232127](http://img4.tbcdn.cn/L1/461/1/6d039594f77100e38664ce2fba39261448e25de9)


先强入几个概念：`$data`，`vm`，`binding`， `directive`

1. `$data`: 就是需要显示的数据。
2. `vm`: 也就是viewmodel，持有数据`$data`，以及各种包装了的方法，对用户唯一可见的对象。
3. `binding`：`$data`里边的每一个key都会对应一个`binding`。
4. `directive`：指令，一个binding对应多个`directive`，每一个`directive`对应html里边的一个奇怪的非html的东西像这种：`{{property}}`， 还有这种：`v-on=”click:func”`，当然还有很多其他的如这种：`v-repeat=”array”`，`v-with=”object”`，每个都对应， 没错， 每个都对应。

### vm 如何和directive建立起桥梁的呢？

![2014_08_22_005949](http://img3.tbcdn.cn/L1/461/1/4d16121bbb26c16faa4516da3b69bea3dd9adbc9)

**解释:**

1. `defineproperty`：相信前端同学对这个都已经很熟悉了，但是都很少用到，因为兼容性问题，这里会对每一个data的key调用defineproperty。

2. `emitter`: 同`kissy.eventTarget`

3. `observer`：`defineperty`中的`setter`和`getter`的结果都会通过`emitter`告诉`observer`，`observer`会通知相应的`binding`。 在vue中，如果对象有**子对象**，元素是**数组**的时候会**递归**的defineProperty，并且这些的子对象的改变都会emit到`observer`。

### VUE中的组合模式 

![2014_08_22_011005](http://img3.tbcdn.cn/L1/461/1/3837131b72cd71113fbaf02b3af3015164ea772f)

**解释：** 
**vm对象**会有**子vm对象**。why？这就是`vue`的`component`组合的方式，遇到这些指令都会创建子vm，`v-repeat`，`v-component`，`v-view`。其实这样的方式简直是双赢，实现起来会更加简单，对用户也提供了`component`的机制。为什么简单，就像排序用递归实现和用循环实现一样，递归调用更加直观易写。

=.= 一不小心画了UML图，其实`observer` 和 `vm`的关系是这样的


![2014_08_22_092901](http://img4.tbcdn.cn/L1/461/1/31a1b6f9fca6d8761272697cc2fa77aab3cb2de3)


好了，你应该明白VUE的MVVM的具体实现结构了。 今天就到这里， 拜拜。


![2014_08_22_094629](http://img3.tbcdn.cn/L1/461/1/9bc1bb278df9d505cbf315ab871657046b90012d)


**请听下回分解**
--------------------------------------------窝是感情的分割线, hehehehe------------------------------------------

> [Thinking in Vue.js （二）](http://6174.github.io/blog/articles/thinking-in-vue-two.html)