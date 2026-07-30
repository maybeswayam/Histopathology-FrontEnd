import { Github, Linkedin } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="relative z-20 border-t border-subtle bg-panel/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          Built by <span className="font-medium text-foreground">Swayam Adhana</span>
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/maybeswayam"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <a
            href="https://www.linkedin.com/in/swayam-adhana-01b2b2293/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <Linkedin className="h-4 w-4" />
            <span className="hidden sm:inline">LinkedIn</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
