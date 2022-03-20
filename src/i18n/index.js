/**
 * add by changjtb
 * 国际化翻译单词按类型归类，顶级类别如下：
 * 车辆:vehicle
 * 司机:driver
 * 组织:org
 * 乘客:passenger
 * 时间:time
 * 能源:energe
 * 资源:resource
 * 告警:faults
 * 安全:security
 * 地图:map
 * 数据挖掘:datadig
 * 充电桩:chargePile
 * 线路:route
 * 站点:station
 * 查询条件:filter
 * 用户提示:tips
 * 用户操作:operational
 * 表格:table
 * 树:tree
 * 页面元素:ui
 * 页面操作:action
 * ...其他分类待增加
 */
import Vue from 'vue'
import VueI18n from 'vue-i18n'
// import Cookies from 'js-cookie'
import elementEnLocale from 'element-ui/lib/locale/lang/en' // element-ui lang
import elementZhLocale from 'element-ui/lib/locale/lang/zh-CN'// element-ui lang
import elementFrLocale from 'element-ui/lib/locale/lang/fr'// element-ui lang
// import enLocale from './en-us'
import zhLocale from './zh-cn'
// import frLocale from './fr'

Vue.use(VueI18n)

const messages = {
  'en-us': {
    // ...enLocale,
    ...elementEnLocale
  },
  'zh-cn': {
    ...zhLocale,
    ...elementZhLocale
  },
  'fr': {
    // ...frLocale,
    ...elementFrLocale
  }
}
let lang = 'zh-cn'
// if (Cookies.get('language') && Cookies.get('language') !== 'undefined') {
//   lang = Cookies.get('language')
// }
const i18n = new VueI18n({
  locale: lang, // set locale
  messages // set locale messages
})

export default i18n
