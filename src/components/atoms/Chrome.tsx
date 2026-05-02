// DSR — Chrome: HeaderBar (with optional back) + bottom TabBar
import type { ReactNode } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/LangProvider';
import { Eyebrow } from './Typography';
import { Ico, Icons } from './Icon';
import type { TabId } from '../../types';

interface HeaderBarProps {
  title?: ReactNode;
  onBack?: () => void;
  right?: ReactNode;
}

export function HeaderBar({ title, onBack, right }: HeaderBarProps) {
  const T = useTheme();
  return (
    <div
      style={{
        position: 'absolute',
        top: 54,
        left: 0,
        right: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        height: 40,
      }}
    >
      {onBack ? (
        <button
          onClick={onBack}
          className="dsr-press"
          style={{
            width: 36,
            height: 36,
            borderRadius: 0,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Ico size={20} color={T.text}>
            {Icons.back}
          </Ico>
        </button>
      ) : (
        <div style={{ width: 36 }} />
      )}
      {title && <Eyebrow style={{ fontSize: 11, letterSpacing: 3 }}>{title}</Eyebrow>}
      <div style={{ width: 36, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
    </div>
  );
}

interface TabBarProps {
  tab: TabId;
  setTab: (id: TabId) => void;
}

export function TabBar({ tab, setTab }: TabBarProps) {
  const T = useTheme();
  const { t } = useI18n();
  const tabs: { id: TabId; label: string; icon: ReactNode }[] = [
    { id: 'home', label: t('home'), icon: Icons.home },
    { id: 'services', label: t('services'), icon: Icons.scissors },
    { id: 'book', label: t('book'), icon: Icons.calendar },
    { id: 'rewards', label: t('rewards'), icon: Icons.diamond },
    { id: 'shop', label: t('boutique'), icon: Icons.bag },
  ];
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(10,9,8,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: `1px solid ${T.line}`,
        paddingBottom: 28,
        paddingTop: 10,
        display: 'flex',
        justifyContent: 'space-around',
        zIndex: 50,
      }}
    >
      {tabs.map((tb) => {
        const active = tab === tb.id;
        return (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className="dsr-press"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              padding: '4px 12px',
              color: active ? T.gold : T.textFaint,
            }}
          >
            <Ico size={20} color={active ? T.gold : T.textFaint} stroke={active ? 1.6 : 1.4}>
              {tb.icon}
            </Ico>
            <span
              style={{
                fontFamily: T.sans,
                fontSize: 9,
                fontWeight: 500,
                letterSpacing: 1.6,
                textTransform: 'uppercase',
              }}
            >
              {tb.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
