import React from 'react';
import type {MDXComponentsObject} from '@theme/MDXComponents';
// Import the original MDXComponents to extend them
import MDXComponents from '@theme-original/MDXComponents';
import Comment from '@site/src/components/Comment';

const MDXComponentsExtended: MDXComponentsObject = {
  ...MDXComponents,
  // 在文章中通过 <comment/> 插入评论区
  comment: Comment,
};

export default MDXComponentsExtended;
