import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import './experience.css';

export interface CommandPaletteProject {
  slug: string;
  title: string;
  description?: string;
  category?: string;
  tags?: readonly string[];
  keywords?: readonly string[];
  href?: string;
}

export interface CommandPaletteNavigationItem {
  id?: string;
  label: string;
  href: string;
  description?: string;
  keywords?: readonly string[];
}

export type CommandPaletteResult =
  | {
      kind: 'navigation';
      id: string;
      label: string;
      description?: string;
      href: string;
      source: CommandPaletteNavigationItem;
    }
  | {
      kind: 'project';
      id: string;
      label: string;
      description?: string;
      href: string;
      source: CommandPaletteProject;
    };

export interface CommandPaletteLabels {
  trigger: string;
  shortcut: string;
  dialog: string;
  input: string;
  placeholder: string;
  close: string;
  navigation: string;
  projects: string;
  empty: string;
}

export interface CommandPaletteProps {
  projects: readonly CommandPaletteProject[];
  navigationItems: readonly CommandPaletteNavigationItem[];
  onNavigate?: (href: string, result: CommandPaletteResult) => void;
  onSelect?: (result: CommandPaletteResult) => void;
  projectHref?: (project: CommandPaletteProject) => string;
  labels?: Partial<CommandPaletteLabels>;
  maxResults?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
  className?: string;
}

interface IndexedResult {
  result: CommandPaletteResult;
  normalizedLabel: string;
  normalizedSearchText: string;
  originalIndex: number;
}

const DEFAULT_LABELS: CommandPaletteLabels = {
  trigger: 'Hızlı arama',
  shortcut: '⌘ K',
  dialog: 'Site içinde hızlı arama',
  input: 'Proje veya sayfa ara',
  placeholder: 'Proje veya sayfa ara…',
  close: 'Aramayı kapat',
  navigation: 'Sayfalar',
  projects: 'Projeler',
  empty: 'Eşleşen bir sonuç bulunamadı.',
};

const defaultProjectHref = (project: CommandPaletteProject) =>
  project.href ?? `/projects/${encodeURIComponent(project.slug)}`;

function normalizeSearchValue(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/æ/g, 'ae')
    .replace(/œ/g, 'oe')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function safeHref(value: string): string {
  const href = value.trim();
  if (!href) return '#';
  const forbiddenCharacters = ['<', '>', '"', "'", '`', '\\'];
  const hasUnsafeCharacters = Array.from(href).some((character) => {
    const codePoint = character.codePointAt(0) ?? 0;
    return codePoint <= 32 || codePoint === 127 || forbiddenCharacters.includes(character);
  });
  if (hasUnsafeCharacters) return '#';
  if (href.startsWith('#')) return href;
  if (href.startsWith('/') && !href.startsWith('//')) {
    try {
      const decoded = decodeURIComponent(href);
      return decoded.split(/[/?#]/).some((segment) => segment === '..') ? '#' : href;
    } catch {
      return '#';
    }
  }

  try {
    const origin = typeof window === 'undefined' ? 'https://ackaraca.me' : window.location.origin;
    const parsed = new URL(href, origin);
    if (parsed.protocol === 'https:' && !parsed.username && !parsed.password) return href;
    return ['mailto:', 'tel:'].includes(parsed.protocol) ? href : '#';
  } catch {
    return '#';
  }
}

function resultScore(item: IndexedResult, query: string, tokens: readonly string[]): number {
  if (!query) return 0;

  let score = 0;
  if (item.normalizedLabel === query) score += 120;
  if (item.normalizedLabel.startsWith(query)) score += 70;
  if (item.normalizedLabel.includes(query)) score += 42;
  if (item.normalizedSearchText.includes(query)) score += 18;
  if (tokens.every((token) => item.normalizedSearchText.includes(token))) score += 24;
  tokens.forEach((token) => {
    if (item.normalizedLabel.startsWith(token)) score += 9;
    else if (item.normalizedLabel.includes(token)) score += 5;
    else if (item.normalizedSearchText.includes(token)) score += 2;
  });
  return score;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute('hidden') && element.getAttribute('aria-hidden') !== 'true');
}

export function CommandPalette({
  projects,
  navigationItems,
  onNavigate,
  onSelect,
  projectHref = defaultProjectHref,
  labels: labelOverrides,
  maxResults = 12,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  showTrigger = true,
  className = '',
}: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const isOpen = controlledOpen ?? internalOpen;
  const labels = useMemo(() => ({ ...DEFAULT_LABELS, ...labelOverrides }), [labelOverrides]);
  const instanceId = useId().replace(/:/g, '');
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const resultsRef = useRef<CommandPaletteResult[]>([]);
  const activeIndexRef = useRef(activeIndex);

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (controlledOpen === undefined) setInternalOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [controlledOpen, onOpenChange],
  );

  const close = useCallback(() => {
    setQuery('');
    setActiveIndex(0);
    setOpen(false);
  }, [setOpen]);

  const index = useMemo<IndexedResult[]>(() => {
    const navigationResults: IndexedResult[] = navigationItems.map((item, originalIndex) => {
      const result: CommandPaletteResult = {
        kind: 'navigation',
        id: `navigation-${item.id ?? originalIndex}`,
        label: item.label,
        ...(item.description ? { description: item.description } : {}),
        href: safeHref(item.href),
        source: item,
      };
      const searchText = [item.label, item.description, ...(item.keywords ?? [])].filter(Boolean).join(' ');
      return {
        result,
        normalizedLabel: normalizeSearchValue(item.label),
        normalizedSearchText: normalizeSearchValue(searchText),
        originalIndex,
      };
    });

    const projectResults: IndexedResult[] = projects.map((project, originalIndex) => {
      const result: CommandPaletteResult = {
        kind: 'project',
        id: `project-${project.slug}`,
        label: project.title,
        ...(project.description ? { description: project.description } : {}),
        href: safeHref(projectHref(project)),
        source: project,
      };
      const searchText = [
        project.title,
        project.description,
        project.category,
        ...(project.tags ?? []),
        ...(project.keywords ?? []),
      ]
        .filter(Boolean)
        .join(' ');
      return {
        result,
        normalizedLabel: normalizeSearchValue(project.title),
        normalizedSearchText: normalizeSearchValue(searchText),
        originalIndex: navigationResults.length + originalIndex,
      };
    });

    return [...navigationResults, ...projectResults];
  }, [navigationItems, projectHref, projects]);

  const results = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query);
    const tokens = normalizedQuery ? normalizedQuery.split(' ') : [];
    const limit = Math.max(1, Math.round(maxResults));

    return index
      .map((item) => ({ item, score: resultScore(item, normalizedQuery, tokens) }))
      .filter(({ score }) => !normalizedQuery || score > 0)
      .sort((left, right) => right.score - left.score || left.item.originalIndex - right.item.originalIndex)
      .slice(0, limit)
      .map(({ item }) => item.result);
  }, [index, maxResults, query]);

  const resolvedActiveIndex = results.length === 0 ? -1 : clampIndex(activeIndex, results.length);

  useEffect(() => {
    resultsRef.current = results;
    activeIndexRef.current = resolvedActiveIndex;
  }, [resolvedActiveIndex, results]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, [setOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    inputRef.current?.focus();
    inputRef.current?.select();

    const handleFocusIn = (event: FocusEvent) => {
      const dialog = dialogRef.current;
      if (!dialog || dialog.contains(event.target as Node)) return;
      inputRef.current?.focus();
    };

    const handleDialogKeyboard = (event: KeyboardEvent) => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        if (event.metaKey || event.ctrlKey || event.altKey) return;
        event.preventDefault();
        const length = resultsRef.current.length;
        if (length === 0) return;
        setActiveIndex((current) => {
          const base = current < 0 ? (event.key === 'ArrowDown' ? -1 : 0) : current;
          return event.key === 'ArrowDown' ? (base + 1) % length : (base - 1 + length) % length;
        });
        return;
      }

      if (event.key === 'Enter' && !event.isComposing) {
        const selectedIndex = activeIndexRef.current;
        if (selectedIndex < 0 || selectedIndex >= resultsRef.current.length) return;
        event.preventDefault();
        dialog.querySelector<HTMLElement>(`[data-result-index="${selectedIndex}"]`)?.click();
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = getFocusableElements(dialog);
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('keydown', handleDialogKeyboard);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('keydown', handleDialogKeyboard);
      const previousFocus = previousFocusRef.current;
      if (previousFocus?.isConnected) previousFocus.focus();
      previousFocusRef.current = null;
    };
  }, [close, isOpen]);

  const handleResultClick = (event: ReactMouseEvent<HTMLAnchorElement>, result: CommandPaletteResult) => {
    const modifiedNavigation = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
    if (modifiedNavigation && result.href !== '#') {
      onSelect?.(result);
      close();
      return;
    }
    if (result.href === '#' || onNavigate) event.preventDefault();
    onSelect?.(result);
    close();
    if (result.href !== '#') onNavigate?.(result.href, result);
  };

  const navigationResults = results.filter((result) => result.kind === 'navigation');
  const projectResults = results.filter((result) => result.kind === 'project');
  const activeResultId =
    resolvedActiveIndex >= 0 && results[resolvedActiveIndex]
      ? `experience-command-palette-${instanceId}-result-${resolvedActiveIndex}`
      : undefined;

  const renderResult = (result: CommandPaletteResult) => {
    const resultIndex = results.indexOf(result);
    return (
      <a
        aria-selected={resultIndex === resolvedActiveIndex}
        className={[
          'experience-command-palette-option',
          `experience-command-palette-option--${result.kind}`,
          resultIndex === resolvedActiveIndex ? 'experience-command-palette-option--active' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        data-result-index={resultIndex}
        href={result.href}
        id={`experience-command-palette-${instanceId}-result-${resultIndex}`}
        key={`${result.kind}-${result.id}`}
        onClick={(event) => handleResultClick(event, result)}
        onFocus={() => setActiveIndex(resultIndex)}
        onMouseMove={() => setActiveIndex(resultIndex)}
        role="option"
      >
        <span className="experience-command-palette-option-icon" aria-hidden="true">
          {result.kind === 'project' ? '↗' : '→'}
        </span>
        <span className="experience-command-palette-option-copy">
          <span className="experience-command-palette-option-label">{result.label}</span>
          {result.description ? (
            <span className="experience-command-palette-option-description">{result.description}</span>
          ) : null}
        </span>
        <span className="experience-command-palette-option-kind" aria-hidden="true">
          {result.kind === 'project' ? labels.projects : labels.navigation}
        </span>
      </a>
    );
  };

  const palette = isOpen ? (
    <div
      className="experience-command-palette-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        aria-label={labels.dialog}
        aria-modal="true"
        className="experience-command-palette-dialog"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="experience-command-palette-search-row">
          <span className="experience-command-palette-search-icon" aria-hidden="true">⌕</span>
          <label
            className="experience-command-palette-sr-only"
            htmlFor={`experience-command-palette-${instanceId}-input`}
          >
            {labels.input}
          </label>
          <input
            aria-activedescendant={activeResultId}
            aria-autocomplete="list"
            aria-controls={`experience-command-palette-${instanceId}-results`}
            aria-expanded="true"
            className="experience-command-palette-input"
            id={`experience-command-palette-${instanceId}-input`}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            placeholder={labels.placeholder}
            ref={inputRef}
            role="combobox"
            spellCheck="false"
            type="search"
            value={query}
          />
          <button
            aria-label={labels.close}
            className="experience-command-palette-close"
            onClick={close}
            type="button"
          >
            <span aria-hidden="true">Esc</span>
          </button>
        </div>

        {results.length > 0 ? (
          <div
            aria-label={labels.dialog}
            className="experience-command-palette-results"
            id={`experience-command-palette-${instanceId}-results`}
            role="listbox"
          >
            {navigationResults.length > 0 ? (
              <section
                aria-labelledby={`experience-command-palette-${instanceId}-navigation-heading`}
                className="experience-command-palette-group"
                role="group"
              >
                <h2
                  className="experience-command-palette-group-title"
                  id={`experience-command-palette-${instanceId}-navigation-heading`}
                >
                  {labels.navigation}
                </h2>
                {navigationResults.map(renderResult)}
              </section>
            ) : null}
            {projectResults.length > 0 ? (
              <section
                aria-labelledby={`experience-command-palette-${instanceId}-projects-heading`}
                className="experience-command-palette-group"
                role="group"
              >
                <h2
                  className="experience-command-palette-group-title"
                  id={`experience-command-palette-${instanceId}-projects-heading`}
                >
                  {labels.projects}
                </h2>
                {projectResults.map(renderResult)}
              </section>
            ) : null}
          </div>
        ) : (
          <p className="experience-command-palette-empty" role="status">
            {labels.empty}
          </p>
        )}

        <footer className="experience-command-palette-footer" aria-hidden="true">
          <span>↑↓</span>
          <span>Enter ↵</span>
          <span>Esc</span>
        </footer>
      </div>
    </div>
  ) : null;

  return (
    <div className={['experience-command-palette', className].filter(Boolean).join(' ')}>
      {showTrigger ? (
        <button
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          className="experience-command-palette-trigger"
          onClick={() => setOpen(true)}
          type="button"
        >
          <span className="experience-command-palette-trigger-label">{labels.trigger}</span>
          <kbd className="experience-command-palette-trigger-shortcut" aria-hidden="true">
            {labels.shortcut}
          </kbd>
        </button>
      ) : null}
      {palette && typeof document !== 'undefined' ? createPortal(palette, document.body) : null}
    </div>
  );
}

function clampIndex(index: number, length: number): number {
  if (length <= 0) return -1;
  if (index < 0) return 0;
  if (index >= length) return length - 1;
  return index;
}

export default CommandPalette;
