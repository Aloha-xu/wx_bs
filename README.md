### 项目截图

<img width="1400" src="https://images.gitee.com/uploads/images/2020/1118/090359_21c0304e_1794996.jpeg"/>

### 功能列表

- 首页：搜索、Banner、公告、分类 Icons、分类商品列表
- 详情页：加入购物车、立即购买、选择规格
- 搜索页：排序
- 分类页：分页加载商品
- 我的页面：订单（待付款，待发货，待收货），足迹，收货地址

### 最近更新

- 3.26 更新详情  
  U 将网络图标改成本地图标  
  U 更新支付方式的 UI  
  F 修复轮播图的 bug  
  F 修复没有商品时的错误显示问题  
  F 修复 share.js 的一个 bug  
  A 增加发货时的订阅消息

- 12.14 新增生成分享图的功能  
  <img width="1000" src="https://images.gitee.com/uploads/images/2020/1118/090429_8fc928b0_1794996.jpeg"/>

#### 完整的购物流程，商品加入购物车 --> 收货地址的选择 --> 下单支付 --> 确认收货

### 项目结构

```
├─config
│  └─api　
├─images
│  └─icon
│  └─nav
├─lib
│  └─wxParse　　　
├─pages
│  ├─app-auth
│  ├─cart
│  ├─category
│  ├─goods
│  ├─index
│  ├─order-check
│  ├─payResult
│  ├─search
│  └─ucenter
│      ├─address
│      ├─address-detail
│      ├─express-info
│      ├─footprint
│      ├─goods-list
│      ├─index
│      ├─order-details
│      ├─order-list
│      └─settings
├─services
└─utils
```

### 本地开发

请在https://mp.weixin.qq.com/ 注册你的小程序，得到 appid 和 secret，微信开发者工具中设置 appid。  
在 hiolabs-server 的 config.js 中设置好 appid 和 secret。

- 项目地址  
  微信小程序：https://github.com/iamdarcy/hioshop-miniprogram  
  后台管理：https://github.com/iamdarcy/hioshop-admin  
  服务端： https://github.com/iamdarcy/hioshop-server

他有一层商品信息的逻辑 有点不对路数
需要修改
