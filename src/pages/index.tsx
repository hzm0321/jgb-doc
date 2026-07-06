import React, {ReactNode, useEffect, useRef, useState, useCallback} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import BrowserOnly from '@docusaurus/BrowserOnly';
import useBaseUrl from '@docusaurus/useBaseUrl';

import styles from './index.module.css';

/* React Bits 组件导入 */
import SpotlightCard from '../components/ReactBits/SpotlightCard';
import ShinyText from '../components/ReactBits/ShinyText';
import StarBorder from '../components/ReactBits/StarBorder';
import Particles from '../components/ReactBits/Particles';
import TiltCard from '../components/ReactBits/TiltCard';
import AnimatedCounter from '../components/ReactBits/AnimatedCounter';

/* 滚动显示组件 (Reveal Animation) */
function Reveal({ children, delay = 0, className = '' }: { children: ReactNode, delay?: number, className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.revealActive);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={clsx(styles.reveal, className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* SVG 图标 — 统一使用 Lucide 风格 24x24 viewBox (ui-ux-pro-max: consistent icon set) */
function TrendingUpIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

function SmartphoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function TerminalIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

function BotIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}

function StethoscopeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4v5a8 8 0 0 0 16 0V4" />
      <circle cx="12" cy="18" r="3" />
      <path d="M12 15v-1" />
    </svg>
  );
}

function CloudSyncIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M12 12v9" />
      <path d="m8 17 4 4 4-4" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const cliFeatureItems = [
  {
    icon: <TerminalIcon />,
    iconClass: styles.featureIconCyan,
    title: '⚡️ 极速只读行情',
    description: '专为高频行情监控与持仓对账设计，毫秒级响应，零副作用，生产环境安全无忧。',
    spotlightColor: 'rgba(34, 211, 238, 0.25)',
  },
  {
    icon: <BotIcon />,
    iconClass: styles.featureIconBlue,
    title: '🤖 AI Agent 原生支持',
    description: '独创响应信封与标准 JSON/JSONL/Text 格式输出，无缝集成 OpenClaw 与自动化管道。',
    spotlightColor: 'rgba(96, 165, 250, 0.25)',
  },
  {
    icon: <StethoscopeIcon />,
    iconClass: styles.featureIconGreen,
    title: '🩺 智能自检与诊断',
    description: '内置 describe 命令树元数据自述与 doctor 全栈环境自检，一键定位网络与数据源连通性。',
    spotlightColor: 'rgba(52, 211, 153, 0.25)',
  },
  {
    icon: <CloudSyncIcon />,
    iconClass: styles.featureIconPurple,
    title: '🔐 跨端云数据同步',
    description: '通过 Token 联动 Supabase 账号，与 PC/Web 端实时共享自选关注池、分组资产与交易流水。',
    spotlightColor: 'rgba(167, 139, 250, 0.25)',
  },
];

/* 特性数据 — 结合 React Bits 光斑主题色彩 */
const featureItems = [
  {
    icon: <TrendingUpIcon />,
    iconClass: styles.featureIconCyan,
    title: '实时估值',
    description: '通过基金编号实时获取单位净值、估值净值及涨跌幅，数据每秒刷新，把握每一个市场脉搏。',
    spotlightColor: 'rgba(34, 211, 238, 0.22)',
  },
  {
    icon: <LayersIcon />,
    iconClass: styles.featureIconBlue,
    title: '重仓追踪',
    description: '自动获取基金前 10 大重仓股票，实时追踪盘中涨跌，清晰展示持仓结构与行业分布。',
    spotlightColor: 'rgba(96, 165, 250, 0.22)',
  },
  {
    icon: <DatabaseIcon />,
    iconClass: styles.featureIconGreen,
    title: '持仓管理',
    description: '记录持有份额和成本价，自动计算持仓收益与累计收益，支持买入/卖出交易记录。',
    spotlightColor: 'rgba(52, 211, 153, 0.22)',
  },
  {
    icon: <CloudIcon />,
    iconClass: styles.featureIconPurple,
    title: '云端同步',
    description: '通过 Supabase 云端备份，支持多设备间数据同步与冲突处理，随时随地管理你的基金。',
    spotlightColor: 'rgba(167, 139, 250, 0.22)',
  },
  {
    icon: <SmartphoneIcon />,
    iconClass: styles.featureIconPink,
    title: '响应式设计',
    description: '完美适配 PC 与移动端，针对小屏优化文字展示、间距及交互体验，随地查看行情。',
    spotlightColor: 'rgba(244, 114, 182, 0.22)',
  },
  {
    icon: <ShieldIcon />,
    iconClass: styles.featureIconYellow,
    title: 'Serverless 全栈架构',
    description: '结合 Next.js 与 Supabase 云原生技术，提供实时数据同步、可靠的数据库存储和更安全的云端体验。',
    spotlightColor: 'rgba(251, 191, 36, 0.22)',
  },
];

/* 技术栈数据 */
const techItems = [
  'Next.js', 'React', 'Supabase', 'Glassmorphism',
  'PostgreSQL', 'Serverless', 'Responsive',
];

/* 统计数据 */
const stats = [
  { value: '15+', label: '核心特性' },
  { value: '实时', label: '数据同步' },
  { value: 'Serverless', label: '云端架构' },
];

function HeroSection() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroBgGlow}>
        <div className={clsx(styles.heroGlowOrb, styles.heroGlowCyan)} />
        <div className={clsx(styles.heroGlowOrb, styles.heroGlowBlue)} />
        {/* React Bits 互动粒子背景 */}
        <BrowserOnly>
          {() => <Particles particleCount={65} connectionDistance={120} />}
        </BrowserOnly>
      </div>
      <div className={styles.heroContent}>
        <Heading as="h1" className={styles.heroTitle}>
          <ShinyText speed={4}>{siteConfig.title}</ShinyText>
        </Heading>
        <p className={styles.heroSubtitle}>
          <ShinyText speed={5}>{siteConfig.tagline}</ShinyText> —— 一站式基金估值、重仓追踪、持仓管理工具，让你的投资决策更从容。
        </p>
        <div className={styles.heroButtons}>
          <StarBorder
            to="https://fund.cc.cd/home/"
            color="#22d3ee"
            speed="4s"
            className={styles.starBtnWrapper}>
            <ExternalLinkIcon /> 在线体验
          </StarBorder>
          <Link
            className={styles.heroBtnSecondary}
            to="/docs/help">
            查看文档
          </Link>
        </div>
        <div className={styles.statsRow}>
          {stats.map((s, i) => (
            <div key={i} className={styles.statItem}>
              <AnimatedCounter value={s.value} label={s.label} delay={i * 150} />
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

function ScreenshotSection() {
  return (
    <section className={styles.screenshotSection}>
      <div className="container">
        <Reveal delay={200}>
          {/* React Bits 3D 悬浮透视倾斜卡片 */}
          <TiltCard maxTilt={5} glareOpacity={0.15} className={styles.tiltShowcase}>
            <div className={styles.screenshotShowcase}>
              <div className={styles.screenshotPC}>
                <img
                  src={useBaseUrl('/img/demo/pc-demo-01.png')}
                  alt="基估宝 PC 端主界面"
                  loading="lazy"
                />
                <img
                  src={useBaseUrl('/img/demo/pc-demo-02.png')}
                  alt="基估宝 PC 端详情界面"
                  className={styles.pcImageOverlay}
                  loading="lazy"
                />
              </div>
              <div className={styles.screenshotMobile}>
                <img
                  src={useBaseUrl('/img/demo/mobile-demo-01.png')}
                  alt="基估宝 移动端主界面"
                  loading="lazy"
                />
              </div>
            </div>
          </TiltCard>
        </Reveal>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className={styles.featuresSection}>
      <div className="container">
        <Reveal>
          <Heading as="h2" className={styles.featuresSectionTitle}>
            <ShinyText speed={4}>核心特性</ShinyText>
          </Heading>
          <p className={styles.featuresSectionDesc}>
            从实时行情到持仓管理，基估宝提供完整的基金投资追踪体验
          </p>
        </Reveal>
        <div className={styles.featuresGrid}>
          {featureItems.map((item, idx) => (
            <Reveal key={idx} delay={idx * 100}>
              {/* React Bits 光影跟随卡片 */}
              <SpotlightCard
                className={styles.featureCardCustom}
                spotlightColor={item.spotlightColor}
                spotlightSize={350}>
                <div className={clsx(styles.featureIcon, item.iconClass)}>
                  {item.icon}
                </div>
                <Heading as="h3" className={styles.featureTitle}>
                  {item.title}
                </Heading>
                <p className={styles.featureDesc}>{item.description}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CliInstallPill() {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText('npm install -g @jgb/cli').then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }).catch(() => {
      try {
        const input = document.createElement('input');
        input.value = 'npm install -g @jgb/cli';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('复制失败:', err);
      }
    });
  }, []);

  return (
    <div
      className={clsx(styles.cliInstallPill, copied && styles.cliInstallPillCopied)}
      onClick={handleCopy}
      role="button"
      tabIndex={0}
      title="点击复制指令"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCopy();
        }
      }}>
      <code>$ npm install -g @jgb/cli</code>
      <button
        type="button"
        className={clsx(styles.copyIconBtn, copied && styles.copyIconBtnCopied)}
        onClick={(e) => {
          e.stopPropagation();
          handleCopy();
        }}
        title={copied ? '已复制！' : '复制指令'}
        aria-label={copied ? '已复制指令' : '复制指令'}>
        <span className={clsx(styles.iconWrapper, copied ? styles.iconHidden : styles.iconVisible)}>
          <CopyIcon />
        </span>
        <span className={clsx(styles.iconWrapper, copied ? styles.iconVisible : styles.iconHidden)}>
          <CheckIcon />
        </span>
      </button>
      {copied && (
        <span className={styles.copiedTooltip}>
          ✨ 已复制指令
        </span>
      )}
    </div>
  );
}

function CliSection() {
  return (
    <section className={styles.cliSection}>
      <div className="container">
        <Reveal>
          <Heading as="h2" className={styles.featuresSectionTitle}>
            <ShinyText speed={4}>基估宝命令行接口 (jgb-cli)</ShinyText>
          </Heading>
          <p className={styles.featuresSectionDesc}>
            无需打开浏览器，在终端、Shell 脚本或 AI Agent 中毫秒级触达全网行情与个人持仓
          </p>
        </Reveal>

        <div className={styles.cliShowcaseRow}>
          <Reveal delay={150}>
            <TiltCard maxTilt={6} glareOpacity={0.2} className={styles.cliTerminalTilt}>
              <div className={styles.cliTerminal}>
                <div className={styles.cliTerminalHeader}>
                  <div className={styles.cliTrafficLights}>
                    <span className={clsx(styles.cliLight, styles.cliLightRed)} />
                    <span className={clsx(styles.cliLight, styles.cliLightYellow)} />
                    <span className={clsx(styles.cliLight, styles.cliLightGreen)} />
                  </div>
                  <div className={styles.cliTerminalTitle}>zsh — jgb portfolio list — 80×24</div>
                </div>
                <div className={styles.cliTerminalBody}>
                  <div>
                    <span className={styles.cliPrompt}>~</span>
                    <span className={styles.cliCommand}>jgb portfolio list --format table</span>
                  </div>
                  <div className={styles.cliOutput}>
                    <div>账户持仓概览 (当前估算总值: ¥158,450.00 | 浮动盈亏: <span className={styles.cliOutputHighlight}>+¥12,450.00 [+8.53%]</span>)</div>
                    <div>代码     基金名称               成本净值   最新估值   持仓市值      浮动盈亏 (率)</div>
                    <div>─────────────────────────────────────────────────────────────────────────────</div>
                    <div>005827   易方达蓝筹精选混合     1.1500     1.2400     ¥12,400.00    <span className={styles.cliOutputHighlight}>+¥900.00 (+7.83%)</span></div>
                    <div>012345   半导体先锋股票 A       1.5000     1.8560     ¥92,800.00    <span className={styles.cliOutputHighlight}>+¥17,800.00 (+23.73%)</span></div>
                  </div>
                  <div>
                    <span className={styles.cliPrompt}>~</span>
                    <span className={styles.cliCommand}>jgb price 005827 --type gsz</span>
                  </div>
                  <div className={styles.cliOutput}>1.2400</div>
                  <div>
                    <span className={styles.cliPrompt}>~</span>
                    <span className={styles.cliCommand}>jgb market --filter a-share</span>
                    <span className={styles.cliCursor} />
                  </div>
                </div>
              </div>
            </TiltCard>
          </Reveal>

          <div className={styles.cliFeaturesGrid}>
            {cliFeatureItems.map((item, idx) => (
              <Reveal key={idx} delay={200 + idx * 80}>
                <SpotlightCard
                  className={styles.featureCardCustom}
                  spotlightColor={item.spotlightColor}
                  spotlightSize={300}>
                  <div className={clsx(styles.featureIcon, item.iconClass)}>
                    {item.icon}
                  </div>
                  <Heading as="h3" className={styles.featureTitle}>
                    {item.title}
                  </Heading>
                  <p className={styles.featureDesc}>{item.description}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={400}>
          <div className={styles.cliActionRow}>
            <StarBorder
              to="/docs/cli/intro"
              color="#22d3ee"
              speed="3.5s"
              className={styles.starBtnWrapper}>
              📖 浏览 CLI 手册
            </StarBorder>
            <CliInstallPill />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function TechStackSection() {
  return (
    <section className={styles.techSection}>
      <div className="container">
        <Reveal>
          <Heading as="h2" className={styles.featuresSectionTitle}>
            <ShinyText speed={5}>技术栈</ShinyText>
          </Heading>
          <p className={styles.featuresSectionDesc}>
            现代、可靠的 Serverless 全栈技术选型
          </p>
        </Reveal>
        <div className={styles.techGrid}>
          {techItems.map((name, idx) => (
            <Reveal key={idx} delay={idx * 50}>
              <span className={styles.techBadge}>
                {name}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="首页"
      description={siteConfig.tagline}>
      <HeroSection />
      <main>
        <ScreenshotSection />
        <FeaturesSection />
        <CliSection />
        <TechStackSection />
      </main>
    </Layout>
  );
}
