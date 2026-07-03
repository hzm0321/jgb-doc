---
sidebar_position: 6
title: 5. 常见问题 (FAQ)
sidebar_label: 5. 常见问题
---

# 5. 常见问题 (FAQ)

欢迎来到基估宝常见问题与解答中心。在这里你可以快速找到关于数据估值、设备支持及分组逻辑的详细解答。

---

<details className="faq-accordion" open>
  <summary>为什么盘中“估值”和晚间公布的“最终净值”有偏差？</summary>
  <div className="faq-content">
    <p>盘中实时估值是基于基金最新公布的<b>前十大重仓股</b>盘中走势推导计算的理论估值，仅供盘中投资决策与趋势跟踪参考。最终实际偏差产生的原因通常包括：</p>
    <ul>
      <li><b>隐形持仓影响</b>：基金财报仅定期披露前十大重仓股（约占仓位 40%~60%），其余非重仓股波动无法实时推算。</li>
      <li><b>日内调仓变化</b>：基金经理可能在交易日内进行了调仓换股或增减仓位。</li>
      <li><b>大额申赎与费率</b>：当计入申赎款项流动及日计提管理费用后，最终净值会有微调。</li>
    </ul>
    <p>💡 <i>提示：晚间基金公司官方公布净值后，系统会自动标注 <b>今日净值已更新</b> 徽章。</i></p>
  </div>
</details>

<details className="faq-accordion">
  <summary>为什么没有原生的 iOS / Android 独立 APP 端？</summary>
  <div className="faq-content">
    <p>为了保障极速访问与数据跨平台一致性，目前暂未开展原生 APP 的开发，但本项目已全面支持并优化了 <b>PWA（渐进式 Web 应用）</b> 与移动端响应式布局。</p>
    <p>你可以非常方便地将基估宝轻应用一键添加到手机桌面，体验完全媲美原生 APP：</p>
    <ul>
      <li>🍏 <b>iOS (Safari)</b>：在 Safari 中打开网页 → 点击底部正中间的 <b>分享按钮 [↑]</b> → 选择 <b>“添加到主屏幕”</b>。</li>
      <li>🤖 <b>Android (Chrome / Edge)</b>：在浏览器右上角菜单中 → 选择 <b>“添加到主屏幕”</b> 或 <b>“安装应用”</b>。</li>
    </ul>
  </div>
</details>

<details className="faq-accordion">
  <summary>如何理解“全部”、“自选”、“自定义分组”及“汇总持仓”的逻辑关系？</summary>
  <div className="faq-content">
    <p>在最新版本中，系统全面支持了<b>分组持仓独立管理</b>，核心逻辑如下：</p>
    <ul>
      <li><b>全部与自选分组</b>：两者共用同一套底层持仓数据；且“全部分组”可以进行<b>独立持仓设置</b>。</li>
      <li><b>自定义分组</b>：所有新建的自定义分组（如“激进组合”、“稳健实盘”）均为独立的持仓数据互不干扰。</li>
      <li><b>关联持仓计算</b>：如果未在“全部分组”中设置某只基金的持仓，但该基金在多个自定义分组中存在持仓，系统会在“全部”中以<b>关联持仓</b>形式自动汇总并加权统计各自定义分组的数据。</li>
      <li><b>汇总分组</b>：以分组的维度全局统计各个独立持仓的数据和盈亏，关联持仓不会被重复计算在内。</li>
    </ul>
  </div>
</details>

<details className="faq-accordion">
  <summary>我的持仓数据和财务信息存储在哪里？会泄露吗？</summary>
  <div className="faq-content">
    <p>基估宝坚持<b>“本地优先 (Local-First)”</b>的隐私设计原则：</p>
    <ul>
      <li>默认情况下，所有添加的基金、持仓份额和成本均严格存储在你本机的浏览器 <code>localStorage</code> 中，不会上传至任何第三方服务器。</li>
      <li>当你启用云端多设备同步功能时，数据端到端加密存储于安全可靠的 Supabase 数据库中，仅凭你的个人账号验证访问，绝对保障个人财务隐私。</li>
    </ul>
  </div>
</details>

---

:::caution
注：本工具仅供学习与参考，不构成投资建议。
:::

