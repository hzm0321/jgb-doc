import React, {useEffect} from 'react';
import Layout from '@theme-original/Layout';
import type LayoutType from '@theme/Layout';
import type {WrapperProps} from '@docusaurus/types';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {useLocation} from '@docusaurus/router';
import {useColorMode} from '@docusaurus/theme-common';

type Props = WrapperProps<typeof LayoutType>;

function ThemeParamSync(): null {
  const location = useLocation();
  const {setColorMode} = useColorMode();

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const theme = params.get('theme') || params.get('colorMode');
      if (theme === 'dark' || theme === 'light') {
        setColorMode(theme);
      }
    } catch (e) {
      // ignore
    }
  }, [location.search, setColorMode]);

  return null;
}

export default function LayoutWrapper(props: Props): React.ReactNode {
  return (
    <Layout {...props}>
      {props.children}
      <BrowserOnly>{() => <ThemeParamSync />}</BrowserOnly>
    </Layout>
  );
}
