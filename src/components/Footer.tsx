import { version } from '../../package.json';

export function Footer() {
  return (
    <footer className="bg-zinc-950 py-3 px-4 text-center">
      <a
        href="https://github.com/JoshPaulie/ilo-peli/blob/main/CHANGELOG.md"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono tracking-widest"
      >
        v{version}
      </a>
    </footer>
  );
}
