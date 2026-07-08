import React, {useEffect, useState} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {useColorMode} from '@docusaurus/theme-common';
import Giscus from '@giscus/react';

/**
 * 评论组件 —— 基于 Giscus (GitHub Discussions) 实现的文章评论功能
 *
 * 使用前请前往 https://giscus.app 配置你的仓库，获取 repoId 和 categoryId，
 * 并替换下方对应字段。前提条件：
 * 1. 仓库为 public
 * 2. 仓库已开启 GitHub Discussions 功能
 * 3. 已安装 Giscus GitHub App (https://github.com/apps/giscus)
 */
function CommentInner(): React.ReactNode {
  const {colorMode} = useColorMode();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 避免 SSR/首次渲染闪烁
  if (!mounted) {
    return null;
  }

  return (
    <div style={{marginTop: '3rem'}}>
      <Giscus
        repo="hzm0321/jgb-doc"
        repoId="R_kgDOTLifvA"
        category="Announcements"
        categoryId="DIC_kwDOTLifvM4DAw81"
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme={colorMode === 'dark' ? 'dark_dimmed' : 'light'}
        lang="zh-CN"
        loading="lazy"
      />
    </div>
  );
}

export default function Comment(): React.ReactNode {
  return (
    <BrowserOnly>
      {() => <CommentInner />}
    </BrowserOnly>
  );
}
