// const ApiRootUrl = 'http://localhost:8360/api/';
// const ApiRootUrl = 'http://192.168.0.108:8360/api/';
// const ApiRootUrl = "https://www.guxiaoling.com:8466/api/";
const ApiRootUrl = "http://localhost:3003/api/";

//test
//test2
module.exports = {
  AuthLoginByWeixin: ApiRootUrl + "user/token", //微信登录 1
  IndexData: ApiRootUrl + "home/appInfo", //首页数据接口 1
  CatalogList: ApiRootUrl + "common/categoryList", //分类目录全部分类数据接口 1
  // CatalogCurrent: ApiRootUrl + "catalog/current", //分类目录当前分类数据接口
  GetCurrentList: ApiRootUrl + "goods/list", // 1
  // 购物车
  CartAdd: ApiRootUrl + "cart/add", // 添加商品到购物车 1
  CartList: ApiRootUrl + "cart/list", //获取购物车的数据 1
  CartUpdate: ApiRootUrl + "cart/update", // 更新购物车的商品 这个更新商品的数量 也不是在原有的基础上加减商品数量 1
  CartDelete: ApiRootUrl + "cart/delete", // 删除购物车的商品 1
  // CartChecked: ApiRootUrl + "cart/checked", // 选择或取消选择商品
  CartGoodsCount: ApiRootUrl + "cart/goodsCartCount", // 获取购物车商品件数 1
  CartCheckout: ApiRootUrl + "order/checkout", // 下单前获取确认信息
  // 商品
  // GoodsCount: ApiRootUrl + "goods/count", //统计商品总数
  GoodsDetail: ApiRootUrl + "goods/detail", //获得商品的详情 1
  // GoodsList: ApiRootUrl + "goods/list", //获得商品列表
  // GoodsShare: ApiRootUrl + "goods/goodsShare", //获得商品的详情
  // SaveUserId: ApiRootUrl + "goods/saveUserId",
  // 收货地址
  GetAddresses: ApiRootUrl + "address/list", //获取收获地址列表 1
  AddressDetail: ApiRootUrl + "address/addressDetail", //收货地址详情 1
  DeleteAddress: ApiRootUrl + "address/delAdsress", //删除收货地址 1
  AddAddress: ApiRootUrl + "address/addAddress", //添加收货地址 1
  UpdataAddress: ApiRootUrl + "address/updataAdress", //修改收货地址 1
  // RegionList: ApiRootUrl + "region/list", //获取区域列表
  // PayPrepayId: ApiRootUrl + "pay/preWeixinPay", //获取微信统一下单prepay_id
  OrderSubmit: ApiRootUrl + "order/submit", // 提交订单 1
  OrderUpdataState: ApiRootUrl + "order/updataState", // 改变订单状态接口 1
  OrderList: ApiRootUrl + "order/list", //订单列表
  OrderDetail: ApiRootUrl + "order/detail", //订单详情 1
  OrderDelete: ApiRootUrl + "order/delete", //订单删除 1
  // OrderCancel: ApiRootUrl + "order/cancel", //取消订单
  OrderConfirm: ApiRootUrl + "order/confirm", //确认订单1
  OrderRefund: ApiRootUrl + "order/refund", //退货
  // OrderCount: ApiRootUrl + "order/count", // 获取订单数
  OrderCountInfo: ApiRootUrl + "order/orderCount", // 我的页面获取订单数状态
  // OrderExpressInfo: ApiRootUrl + "order/express", //物流信息
  // OrderGoods: ApiRootUrl + "order/orderGoods", // 获取checkout页面的商品列表
  // 足迹
  FootprintList: ApiRootUrl + "foot/list", //足迹列表
  FootprintDelete: ApiRootUrl + "foot/del", //删除足迹
  FootprintAdd: ApiRootUrl + "foot/add", //添加足迹
  // 搜索
  // SearchIndex: ApiRootUrl + "search/index", //搜索页面数据
  SearchHelper: ApiRootUrl + "search/helper", //搜索帮助
  SearchClearHistory: ApiRootUrl + "search/clearHistory", //搜索帮助
  // ShowSettings: ApiRootUrl + "settings/showSettings",
  SaveSettings: ApiRootUrl + "settings/save",
  SettingsDetail: ApiRootUrl + "settings/userDetail",
  GetBase64: ApiRootUrl + "qrcode/getBase64", //获取商品详情二维码
};
