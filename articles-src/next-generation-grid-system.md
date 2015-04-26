@title: 下一代网格系统
@date: 2014-11-30

## 什么是网格系统
相信网格系统我就不用多介绍， 网格系统极大的简化我们日常的ui开发。 通常来说，我们所熟悉的前端UI框架都会包括一个基本的网格系统，如`bootstrap`, `foundation`, `semantic-ui`. 当使用这些框架的时候，会发现大量的用到网格。 

## 为什么需要新的网格系统
网格系统在不断的演进， 重最初的`960 grid system` 到这两年的`responsive grid system`。但是随着现在碎片化的终端以及ui的复杂化，原先使用`float`的网格系统在布局上会遇到越来越多的挑战。当我们需要螺丝刀的时候却还在用锤子在工作， 当然不会有什么效率可言。现在的UI布局总结而言

1. **越来越复杂**
2. **动态化和自适应**
3. **响应式**

这个时候浏览器为了解决这类问题，提供了很多方法：`flexbox`, `media query`, `em,rem,vw,vh`. 这里我们将讨论的时如何使用`flexbox`来实现新一代的网格系统。这里不会介绍flexbox的用法，而是更多地介绍基于flexbox实现的网格
 
**下面我会通过案例介绍网格系统用法， 最后提供源码**

## 等分的网格 

![图片描述][1]

**代码:**

```html 
<div class="mui-flex">
  <div class="cell">1</div>
  <div class="cell">2</div>
  <div class="cell">3</div>
  <div class="cell">4</div>
</div>
```
**解释:**

原先的`grid>cell`是基于百分比和float的， 百分比不可能达到绝对的准确。 但是flexbox则不同，是浏览器分配的等比例宽度， 这里每一个cell的flex为1, 所以会等比例分配. 

## 纵向的等比例分配

![图片描述][2]

**代码:**
```html 
<div class="mui-flex vertical" style="height: 200px;">
    <div class="cell">1</div>
    <div class="cell">2</div>
    <div class="cell">3</div>
    <div class="cell">4</div>
</div>
```

**解释：**
原先的网格系统，如果为了实现纵向的话， 必须要对高度也设置12格的百分比，这样带来的时源文件变很大。 但是对于flexbox来说，只需要设置： `flex-direction: column`就行。 对于横线能做的事情，纵向都能做，我只能说，这才是我们需要的网格。 

## 未知的固定尺寸 + 动态的宽度

![图片描述][3] 

相信上图的这种布局需求是很常见的，但是如果200px这个是不确定的呢？在很多场景下， 我们需要一个文字 + 动态宽度的设计， 这个时候文字的长度不确定，如果要实现这样的需要，可能之有上js了。 

**代码**

```html 
<div class="mui-flex">
  <div class="cell fixed" style="width: 200px;">200px</div>
  <div class="cell">flex</div>
  <div class="cell">flex</div>
  <div class="cell">flex</div>
</div>

<div class="mui-flex">
  <div class="cell fixed" style="width: 100px;">100px</div>
  <div class="cell">flex</div>
  <div class="cell fixed" style="width: 100px">100px</div>
</div>
```

**解释**
这里的fixed表示`flex: none`, 这样flexbox就会动态的计算flex的cell的宽度。 

这里我们还可以看纵向的这样的需求：

![图片描述][4] 

**代码**
```html 
<div class="mui-flex vertical" style="height: 300px;">
    <div class="cell fixed" style="height: 50px">50px header</div>
    <div class="cell">flex content</div>
    <div class="cell fixed" style="height: 50px">50px footer</div>
</div>
```


## 垂直水平居中的div

![图片描述][5]  

这种需求绝对的时主流， 以前的方式通过`table-cell`, 通过`top: 50%...` 通过`line-height`， 都是很别扭的hack方法。 但是现在可以通过flexbox完美支持

**代码**
```html
<div class="mui-flex align-center justify-center" style="height: 200px; border: solid 1px gray;">
    <div class="cell fixed" style="width: 50px;">50px</div>
    <div class="cell fixed" style="width: 50px;">50px</div>
    <div class="cell fixed" style="width: 50px;">50px</div>
</div>
```

**解释**
`align-center` 会让所有的cell垂直居中， `justify-center`会让所有的cell水平居中。


## col-* 的也可以完美保留 

以前我们会使用`col-1, col-4, col-6`等这样的用法， 表示一个cell占用12网格的多少个网格。
现在的用法也类似：

```html 
<div class="mui-flex">
    <div class="cell cell-6">50%</div>
    <div class="cell">flex</div>
    <div class="cell">flex</div>
</div>
```
输出结果为：

![图片描述][6] 

## 动态的等高的div 

![图片描述][7]
 按照旧的方式来实现的话， 我相信不上js是没有办法解决的。 看看现在的方式能有多简单。 

```html 
<div class="mui-flex align-stretch" style="border: solid 1px gray;">
    <div class="cell">flex</div>
    <div class="cell">flex</div>
    <div class="cell"><pre>
        x
        x
        x
        x
        x
        x
    </pre></div>
</div>
```
 只需要加上`align-stretch` 类就可以实现等高的需求， 这里值得注意的时， 如果自己在cell上设置了高度， 会覆盖flexbox分配的stretch高度。 

## flexbox 独有的align

**align items top**
![图片描述][8]
**align items bottom**
![图片描述][9]
**align items center** 
![图片描述][10]

```html
<div class="mui-flex  align-start" style="height: 200px; border: solid 1px gray;">
    <div class="cell cell-6">50%</div>
    <div class="cell">flex</div>
    <div class="cell">flex</div>
</div>

<div class="mui-flex  align-end" style="height: 200px; border: solid 1px gray;">
    <div class="cell cell-6">50%</div>
    <div class="cell">flex</div>
    <div class="cell">flex</div>
</div>

<div class="mui-flex align-center" style="height: 200px; border: solid 1px gray;">
    <div class="cell cell-6">50%</div>
    <div class="cell">flex</div>
    <div class="cell">flex</div>
</div>
```

**align-self**
cell可以自己控制自身的align
![图片描述][11]
```html 
<div class="mui-flex align-center" style="height: 200px; border: solid 1px gray;">
    <div class="cell align-start">align top</div>
    <div class="cell">flex</div>
    <div class="cell">flex</div>
</div>
```
其他的cell上， 也可以使用`align-end`, `align-center`, `align-stretch`。 

## 不等比例的适应

![][16] 

解决方案只需要这样：
```html 
<div class="mui-flex display">
  <div class="cell" style="flex: 150;">flex150</div>
  <div class="cell" style="flex: 105;">flex105</div>
  <div class="cell" style="flex: 120;">flex120</div>
</div>
```

效果：

![][15]
## 不能在cell上面加上padding， 否则宽度难控制
![][14]

## 源码
http://gitlab.alibaba-inc.com/mui/flex/tree/master

  [1]: http://gtms04.alicdn.com/tps/i4/TB1U5KDGVXXXXXvXXXXibE53FXX-708-64.png
  [2]: http://gtms04.alicdn.com/tps/i4/TB1kVuBGVXXXXcJXXXXwpp1NFXX-715-205.png
  [3]: http://gtms01.alicdn.com/tps/i1/TB1UkuxGVXXXXbBXpXXit4KKFXX-710-125.png
  [4]: http://gtms02.alicdn.com/tps/i2/TB1wYGkGVXXXXXfaXXXx1OQJpXX-705-305.png
  [5]: http://gtms03.alicdn.com/tps/i3/TB1WhuBGVXXXXbUXXXXm4VtUVXX-733-218.png
  [6]: http://gtms03.alicdn.com/tps/i3/TB1bMymGVXXXXbLXVXXBPQ53FXX-708-66.png
  [7]: http://gtms01.alicdn.com/tps/i1/TB1205uGVXXXXa0XFXXU6s0SVXX-730-408.png
  [8]: http://gtms02.alicdn.com/tps/i2/TB1wyKvGVXXXXXlXFXXsphsUVXX-733-209.png
  [9]: http://gtms03.alicdn.com/tps/i3/TB1qVirGVXXXXXiXVXXSdGdTFXX-728-215.png
  [10]: http://gtms04.alicdn.com/tps/i4/TB1NmuoGVXXXXbvXVXXiRO0SpXX-726-215.png
  [11]: http://gtms01.alicdn.com/tps/i1/TB1Kt1vGVXXXXX0XFXXm4VtUVXX-733-218.png
  [12]: http://gtms04.alicdn.com/tps/i4/TB1kVuBGVXXXXcJXXXXwpp1NFXX-715-205.png
  [13]: http://gtms04.alicdn.com/tps/i4/TB1PRCnGVXXXXchXVXXTR.JVVXX-735-224.png
  [14]: http://gtms03.alicdn.com/tps/i3/TB1_CioGVXXXXaoXVXXn4JkWXXX-735-528.png
  [15]: http://gtms03.alicdn.com/tps/i3/TB1ffmEGVXXXXb2XXXX7HJW5FXX-741-67.png
  [16]: http://gtms04.alicdn.com/tps/i4/TB16nWvGVXXXXXOXVXXJHdbFXXX-772-168.png