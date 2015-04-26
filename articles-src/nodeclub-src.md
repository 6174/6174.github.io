@title: 通过nodeclub源码来讲解如何做一个nodejs + express + mongodb项目
@date: 2014-4-22

1. About 
---
* 1.1 **what**: 
  nodeclub是cnodejs.com的源码，cnode算是一个基本的博客系统，包含文章发布， 关注，评论等功能。这些功能可以说是任何一个网站的基础。从nodeclub里可以学到什么？
    - 1.基本的架构
    - 2.开发测试过程
    - 3.MVC的设计
    - 4.middleware 的正确用法
    - 5.如何设计mongodb schema
    - 6.如何正确的使用mongoose
    - 7.如何实现一个标签系统
    - 8.plugins? services ?
    - 9.如何正确的使用ejs helper
    - 10.到底该怎样写路由， restful？ 
    - 11.如何做基本的控制验证
    - 12.如何发邮件
    - 13.session
    - 14.github 用户登录
    - 15.图片上传
    - 16.消息发送
   
  除了nodeclub源码的学习笔记以外， 还会有一点最近捣鼓这一块的经验分享
    - 1.一个完整的消息订阅设计
    - 2.消息推送, socket + express如何合作?
    - 3.包装action
    - 4.蛋疼的异步回调如何处理
  
  [nodeclub源码](https://github.com/cnodejs/nodeclub)
* 1.2 **why**: 
    对于想用`nodejs`  + `express` + `mongodb` 来做网站技术基础的项目， nodeclub可以说是很好的源码级指南，当然也是我的指南，这篇文章权当做个人学习nodeclub的学习笔记。

* 1.3 **who**
```coffee
  who = 一名本应该在写前端的但不知怎的一直在写后端的马脓 -> 
    @echo 'github: https://github.com/6174'
    @echo 'weibo: http://weibo.com/u/2254313183'
    @echo 'email: 57017125@qq.com'
    @echo 'ps: 一直在求后端partner中，有意者联系我' 
    @send()
```



2. nodeclude 中用到了哪些开源技术
---
* 2.1 nodejs项目一大优点就是有一个package.json,  里边的dependencies & devDependencies可以看到这个项目所有的依赖。 对于有经验的开发者来说， 看完package.json基本就能知道项目的架构是怎样。 

* 2.2 **dependencies**
  - `express`: 基础框架：
  - `mongodb`: 数据存储 
  - `mongoose`: orm 
  - `connect-mongo`: session （对于redis， 可以使用connect-redis）
  - `nodemailer`：邮件 
  - `validator`：验证 
  - `passport`，`passport-github`： passport， 
  - `loader`: ejs-view-helper, 静态资源加载处理
  - 其他： `event-proxy`, `node-markdown`, `ndir`

* 2.3 **devDependencies**
  - 测试框架：`mocha`, `should` 
  - 运行： `forever`
  - 请求模拟: `supertest`

* 2.4 nodeclub以express + mongodb + mongoose作为基本框架, 典型的MVC应用
  - **Model**: 对应mongoose orm， models目录
  - **view**： ejs模板， views目录
  - **controler**：express middleware , contollers目录 

* 2.5 目录结构：
  ```coffee
   - common/
   - controllers/
   - libs/
   # express中间件， 基本的auth， session 验证
   - middlewares/
   - models/
   #消息， 邮件服务
   - services/
   - plugins/
   #可以看做是对model处理的加工库
   - proxy/
   - test/
   - views/
   - app.js
   - route.js
   - config.js
  ```

3. 应用入口app.js
---
神圣的入口文件，几乎每个项目都会有一个entry，对于了解一个应用熟悉入口逻辑很重要。 下面将分步来看看，nodeclub的app.js做了什么：

### 3.1 require(./config)  
* 3.1.1 应用相关的配置的设置， 主要分为
    - 1.应用全局数据配置
    - 2.数据库连接配置
    - 3.session，auth相关配置
    - 4.rss配置
    - 5.mail配置
    - 6.第三方连接相关配置， github， weibo
    
 配置文件也是了解应用的一个好地方， 在config.default.js中可以看到以下信息, 这些很可能是我们平时做应用开发的时候没有留意到的地方

```javascript  
  //--应用数据统计
  google_tracker_id: 'UA-41753901-5',

  //--静态文件很可能使用cdn来做
  site_static_host: '', // 静态文件存储域名
  
  //--求解释
  site_enable_search_preview: false, // 开启google search preview
  site_google_search_domain:  'cnodejs.org',  // google search preview中要搜索的域名

  //--运营数据
  list_topic_count: 20,
  post_interval: 10000,
  admins: { admin: true },
  side_ads:[]
  allow_sign_up: true,

  //--插件模式
  plugins: []
```

* 3.1.2 当然这里的配置文件是default的，配置文件可以放在一个config的文件夹下面，多个文件的方式来整理。比如运营数据配置和其他数据配置分开，因为很有可能需要做一个小的工具来让非技术人员配置相关参数。这时候可以用一个index.js作为facade，相当于一个大的node module。 



### 3.2 require('./models')

* 3.2.1 之前已经讲了models目录对应MVC的M部分。 
* 3.2.2 models目录下面有index.js, require('./models')相当于require('./models/index')
  index相当于一个模型的facade, index.js做得事情分别是
    - 1.connect mongodb 
    - 2.require各个model模块
    - 3.exports 所有的model
  简单而言就是初始化了应用model层。 
* 3.2.3 模型使用orm框架mogoose来写，了解mogoose过后， models部分的代码也就是秒懂了
  ， 我说的只是代码，literaly, 一个项目的核心就是model的设计，以前做过的任何项目都是一样， 数据库table的设计好坏直接影响应用的开发以及性能。 下面来看看各个model的schema设计(几乎直接ctr+c, ctr+v加上了一点点注释) :

* 3.2.4 user 
```javascript 
    var UserSchema = new Schema({
          //--基本用户信息， index表示在mongodb中会建立索引
          //--unique: true 唯一性设置
          name: { type: String, index: true },
          loginname: { type: String, unique: true },
          pass: { type: String },
          email: { type: String, unique: true },
          url: { type: String },
          profile_image_url: {type: String},
          location: { type: String },
          signature: { type: String },
          profile: { type: String },
          weibo: { type: String },
          avatar: { type: String },
          githubId: { type: String, index: true },
          githubUsername: {type: String},
          is_block: {type: Boolean, default: false},
          
          //--用户产生数据meta
          score: { type: Number, default: 0 },
          topic_count: { type: Number, default: 0 },
          reply_count: { type: Number, default: 0 },
          follower_count: { type: Number, default: 0 },
          following_count: { type: Number, default: 0 },
          collect_tag_count: { type: Number, default: 0 },
          collect_topic_count: { type: Number, default: 0 },
          create_at: { type: Date, default: Date.now },
          update_at: { type: Date, default: Date.now },
          is_star: { type: Boolean },
          level: { type: String },
          active: { type: Boolean, default: true },
            
          //-mail
          receive_reply_mail: {type: Boolean, default: false },
          receive_at_mail: { type: Boolean, default: false },
          from_wp: { type: Boolean },
          retrieve_time : {type: Number},
          retrieve_key : {type: String}
        });
```
    

* 3.2.5 topic 话题
```javascript  

        //1 <- 多
        //tag <- topic <- collect  
        var TopicSchema = new Schema({
          title: { type: String },
          content: { type: String },
          author_id: { type: ObjectId },
          top: { type: Boolean, default: false },
          reply_count: { type: Number, default: 0 },
          visit_count: { type: Number, default: 0 },
          collect_count: { type: Number, default: 0 },
          create_at: { type: Date, default: Date.now },
          update_at: { type: Date, default: Date.now },
          //--这里reply的设计方式不知道是否合适， 因为mongdb不同于关系型数据库，这里每次读取文章都需要重reply集合里边查找遍历一边，文章是读繁忙的。
          //-- 一个document的大小为5Mb， 一本牛津词典的内容， 我觉得将reply放在这里应该不会有太大问题。 即便不存放reply 内容， 存放一个id数组也会好很多。
          //-- 客官们怎么看?  
          last_reply: { type: ObjectId },
          last_reply_at: { type: Date, default: Date.now },
          content_is_html: { type: Boolean }
        });

        var ReplySchema = new Schema({
          content: { type: String },
          topic_id: { type: ObjectId, index: true },
          author_id: { type: ObjectId },
          reply_id : { type: ObjectId },
          create_at: { type: Date, default: Date.now },
          update_at: { type: Date, default: Date.now },
          content_is_html: { type: Boolean }
        });

        //--话题集合
        var TopicCollectSchema = new Schema({
          user_id: { type: ObjectId },
          topic_id: { type: ObjectId },
          create_at: { type: Date, default: Date.now }
        });

        //--话题标签
        var TopicTagSchema = new Schema({
          topic_id: { type: ObjectId },
          tag_id: { type: ObjectId },
          create_at: { type: Date, default: Date.now }
        });     
```

* 3.2.6 tag
  标签系统
```javascript
        //tag <- collect
        var TagSchema = new Schema({
          name: { type: String },
          order: { type: Number, default: 1 },
          description: { type: String },
          background: { type: String },
          topic_count: { type: Number, default: 0 },
          collect_count: { type: Number, default: 0 },
          create_at: { type: Date, default: Date.now }
        });
        
        var TagCollectSchema = new Schema({
          user_id: { type: ObjectId, index: true },
          tag_id: { type: ObjectId },
          create_at: { type: Date, default: Date.now }
        });
```
 
* 3.2.7 关系 
```javascript
        var RelationSchema = new Schema({
          user_id: { type: ObjectId },
          follow_id: { type: ObjectId },
          create_at: { type: Date, default: Date.now }
        });
```  

* 3.2.8 消息
 消息model设计， 对于一个blog来说， 基本的只有回复消息， 这里加了关注和@消息。 
```javascript 
    /*
     * type:
     * reply: xx 回复了你的话题
     * reply2: xx 在话题中回复了你
     * follow: xx 关注了你
     * at: xx ＠了你
     */
    var MessageSchema = new Schema({
      type: { type: String },
      master_id: { type: ObjectId, index: true },
      author_id: { type: ObjectId },
      topic_id: { type: ObjectId },
      reply_id: { type: ObjectId },
      has_read: { type: Boolean, default: false },
      create_at: { type: Date, default: Date.now }
    });
```


###3.3 require middlewares
* 3.3.1 express的基础是middleware，或者说express的基础是connect，connect的基础是middleware。middleware模式在professional nodejs中有一个专门的章节来讲解。何为middleware呢？ middleware模式 相当于一个加工流水线（大家叫middleware stack），每一个middleware相当于一个加工步骤，当出现一个http请求的时候，http请求会挨着每个middleware执行下去。 
express里处理一个请求的过程基本上就是请求通过middleware stack的过程：  * -> middlewares -> 路由 -> controllers -> errorhandlering。 

* 3.3.2 middleware 怎样做到的， 异步的方法呢？ middleware使用promise的方式来处理异步，所有每个middleware都有三个参数req, res, next, 对于异步的情况， 必须要调用next()方法。不然后续的middleware就无法执行。 ps: debug 的时候没调用next()还不会报错，一定注意

* 3.3.3 auth.js
  auth.js exports出来的函数全部都是中间件，从变量名就完全清楚的知道到底在做什么了
```javascript

    //-- 需要admin权限
    exports.adminRequired = function (req, res, next) {}

    //-- 需要有用户
    exports.userRequired = function (req, res, next) {}

    //-- 需要有用户并登录
    exports.signinRequired = function (req, res, next) {
        if (!req.session.user) {
            res.render('notify/notify', {error: '未登入用户不能发布话题。'});
            return;
        }
        next();   
    }

    //-- 屏蔽用户 -_-
    exports.blockUser = function (req, res, next) {}
```

  这里其实就可以看到中间件的作用了，我们以前写php的时候每次都需要判断用户是否登录， 没登陆redirect到index.php ，只不过这里的方式是通过中间件来处理。
  明白这里什么意思，其他的中间件模块也就秒懂了。 

###3.4 require('./routes')
* 3.4.1 express 的世界里另外一个很重要的就是route， nodejs启动的是服务， 监听了某一端口， 接受http or https or sockt请求,   那url中像"/index.php?blabla"这一串的存在怎么处理呢， express的route功能就可以帮我们解析。 

* 3.4.2 MVC中如何将一个请求和controller联系起来呢， route就是这样的纽带
```javascript
  //--get, post 请求
  app.get('/signin', sign.showLogin);
  app.post('/signin', sign.login);
  //--使用中间件
  app.get('/signup', configMiddleware.github, passport.authenticate('github'));
  app.post('/:topic_id/reply', auth.userRequired, limit.postInterval, reply.add);
```

* 3.4.3 route是了解一个应用最佳的地方，一个请求如何处理， 到相应的controller去看就知道了。 相比起在PHP环境下配置更加灵活。当然你说你通过nginx来配置也很灵活，好吧，我们说的不是一回事。 

### 3.5 initialization
* 3.5.1 experess initialize: app.js 中其他大多部分就是express的初始化了， 初始化流程如下：
    - 1.配置上传 upload_dir
    - 2.模板引擎设置 
    - 3.express通用中间件设置 
    - 4.pasport中间件
    - 5.自定义中间件 
        - 1.auth_user
        - 2.block_user
        - 3.staticfile: upload 
        - 4.staticfile: user_data
    - 6.csrf
    - 7.errorhandler
    - 8.set view cache
  
  `@Note`：配置的顺序很重要， 中间件的执行顺序是按照定义顺序来执行的， 如果一个中间件依赖另外的中间件， 而自己先执行了， 这种情况就会错误。 常见的问题就是session配置， 一定要记得配置session中间件的时候， 要先配置cookieParser。 
* 3.5.2 session设置
  这个步骤在initialize里边已经有了， 不过再单独讲一下， nodeclub使用的是connect-mongo来作为session的存储
```javascript
    //--cookieParser一定要在前面， 因为session的设置依赖cookie
    app.use(express.cookieParser());
    app.use(express.session({
      secret: config.session_secret,
      store: new MongoStore({
        db: config.db_name,
      }),
    }));
```
* 3.5.3 view helpers 
  使用过ejs的肯定知道， ejs里边view helper设置很简单， 就像赋值变量一样。 当对于一些通用的helper可以这样设置：
```javascript
        app.helpers({
          config: config,
          Loader: Loader,
          assets: assets
        });
        app.dynamicHelpers(require('./common/render_helpers'));
```
* 3.5.4 github pasport  initialize  
```javascript  
        // github oauth
        passport.serializeUser(function (user, done) {
          done(null, user);
        });
        passport.deserializeUser(function (user, done) {
          done(null, user);
        });
        passport.use(new GitHubStrategy(config.GITHUB_OAUTH, 
  githubStrategyMiddleware));

```  

* 3.5.5 start app


4. 用户注册
---
* 4.1 user 是每个应用都会处理的基本， 注册登录登出， 看看nodeclub做了哪些事情：
* 4.2 路由：
```javascript
  //--设置能否直接注册， 不能的话通过github注册
  if (config.allow_sign_up) {
    app.get('/signup', sign.showSignup);
    app.post('/signup', sign.signup);
  } else {
    app.get('/signup', configMiddleware.github, passport.authenticate('github'));
  }
  app.post('/signout', sign.signout);
  app.get('/signin', sign.showLogin);
  app.post('/signin', sign.login);
```
* 4.3 controller & model：sign.signup
```javascript
    sanitize = validator.sanitize;
    check = validator.check;
    exports.signup = function (req, res, next) {
      //--xss 消毒
      var name = sanitize(req.body.name).trim();
      name = sanitize(name).xss();
      ...
      //--validations
      try {
        check(name, '用户名只能使用0-9，a-z，A-Z。').isAlphanumeric();
      } catch (e) {
        res.render('sign/signup', {error: e.message, name: name, email: email});
        return;
      }
      ...
      //--用用户名登录或者email登录
      query = {'$or': [{'loginname': loginname}, {'email': email}]}
      User.getUserByQuery(query, {}, function(){
        ...
        pass = md5(pass);
        ...
        User.newAndSave(name, loginname, pass, email, avatar_url, false, function (err) {
          ...
          // 发送激活邮件
          mail.sendActiveMail(email, md5(email + config.session_secret), name);
          res.render('sign/signup', {
            success: '欢迎加入 ' + config.name + '！我们已给您的注册邮箱发送了一封邮件，请点击里面的链接来激活您的帐号。'
          });
        })
      })
    }   
```


5. mongoose 的使用
---
* 5.1 使用User.newAndSave， 
* 5.2 异步 callback pyramid
  一个应用通常会遇到这样的情景， 一个页面需要的数据包括， 文章列表， 评论列表，用户数据，广告数据， other stuff...   问题是每个都是异步的， 怎么办。 user数据获取过后的callback调用文章列表获取， 文章列表获取的callback调用评论列表的获取... 这样就太蛋疼了。  nodeclub使用了eventproxy模块优雅的解决这样的问题：
```javascript
    render = function(){}
    var proxy = EventProxy.create('tags', 'topics', 'hot_topics', 'stars', 'tops', 'no_reply_topics', 'pages', render);
    proxy.fail(next);
    Tag.getAllTags(proxy.done('tags'));
    Topic.getTopicsByQuery(query, options, proxy.done('topics'));
    User.getUsersByQuery({ is_star: true }, { limit: 5 }, proxy.done('stars'));
```
   看完代码不言而喻。。。
   当然异步处理的方法有很多: 
    - 1.基于事件的：eventProxy
    - 2.基于promise的：Async.js Q.js, when.js
    - 3.基于编译的：continuation, wind
    - 4.基于语言语法的：yield， livescript
   文章最后会讲一下我我的异步选择方案


6. 消息
---
* 6.1 原先以为有动态的消息推送， 有队列处理， 错了， 木有
* 6.2 在sublime text里边全局搜索sendReply2Message会发现是在controller/reply.js里边调用的， 也就是说，消息是直接触发的。 
* 6.3 好吧， 这部分大概大家都能秒懂。。

7. 开发
---
###7.1 测试
* 7.1.1 一个项目必定离不开测试， nodeclub基于mocha BDD测试框架， 一切的前提假设至少能看懂jasmine或者mocha或者任何一个BDD风格的测试代码。 
* 7.1.2  打开即看到app.js
```javascript
  var app = require('../app');
  describe('app.js', function () {
    //--before， 执行it的前面会执行
    before(function (done) {
      //--done, 异步方法
      app.listen(3001, done);
    });
    after(function () {
      app.close();
    });
    it('should / status 200', function (done) {
      //--使用 app.request()就可以模拟请求了？ 这个api哪里来的， 求解释？
      app.request().get('/').end(function (res) {
        res.should.status(200);
        done();
      });
    });
  });
  //--按理说应该是可以正常运行了但是我一直出现这个错误:
  //--connect ADDRNOTAVAIL 知道的求解释
  //--我尝试用supertest直接测试， 但是也是一直timeout， mocha
  //--里边加大timeout时间， 结果就是一直没反应。 

  //--分析原因， express版本问题， nodeclub中express的版本还是2.x, 所以才会有
  //--app.request(), app.close()这些api
  //--第二个原因， 到supertest官网， 发现人家都已经转战到superagent项目了， 于是我写了下面这个测试脚本， 可以通过了
  var express = require('express');
  var should = require('should');
  var path = require('path');
  var superagent = require('superagent');
  var app = express()
  app.get('/user', function(req, res, next) {
      res.send(200, {
          name: 'tobi'
      })
  })
  describe('myapp.js', function() {
      this.timeout(5000)
      before(function(done) {
          app.listen(21, done);
      })
      after(function() {
          // app.close()
      })
      it('should /status 200', function(done) {
          agent = superagent.agent()
          agent.get('http://localhost:21/user').end(function(err, res) {
            console.log(err, res)
            res.should.have.status(200);
            res.text.should.include('tobi');
            return done();
          });
      })
  })
```

###7.2 运行
* nodejs是单线程应用， 如果我们用node命令来运行我们的应用， 当出现一个小错误， 它就挂了。 然后没有然后了。  避免这种问题的方法有如下工具：
  - 1.forever
  - 2.nodemon
  - 3.supervisor
  nodeclub 使用forever来运行项目， 使用这类工具的好处就是， 当有代码改动过后， 会自动的重启应用。 不必每次自己去运行node *.js



8. 说说自己的经验
---
待续...
###8.1 消息订阅设计
###8.2 express + socket
###8.3 异步
###8.4 Action
