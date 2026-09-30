# Safe Causal Inference consortium website

This repository holds the website of the Safe Causal Inference consortium. It's a single-page site built with [Hugo](https://gohugo.io/). Visitors scroll through five sections:

1. **About**: who we are and what we do, with links to our NWO project page and the Causal Inference for AI meetings, and the logos of the partner institutions.
2. **People**: the supervisors, PhD candidates and other consortium members, each with a photo.
3. **Projects**: one block per PhD project. Each block has the PhD candidate's photo and name down the left side, then the project title ("Project 1.1: …") and a short description, then the supervisors side by side on the right.
4. **Publications**: papers from the consortium, grouped by year, with links to the paper, PDF and code.
5. **Causal book club**: a horizontal carousel of book club sessions, past on the left and planned on the right. Each card lists the date, time and place, the paper or chapter we're reading (with an optional link), who leads the session, and what to prepare.

The site uses its own small layout and stylesheet, so it needs no external theme or submodules.

## Editing content

Most updates only touch the files in `data/`. You don't need to edit any HTML.

| What you want to change                 | File                    |
|-----------------------------------------|-------------------------|
| Introduction, what we do, why           | `content/_index.md`     |
| Site title, tagline, contact email      | `hugo.toml` (`[params]`) |
| Supervisors, PhDs, other members        | `data/people.yaml`      |
| PhD projects                            | `data/projects.yaml`    |
| Partner institutions and their logos    | `data/partners.yaml`, `assets/images/partners/` |
| Publications                            | `data/publications.yaml` |
| Book club description and sessions      | `data/bookclub.yaml`    |
| Logo                                    | `assets/images/logo.*`  |
| Photos of people                        | `assets/images/people/` |
| Colors                                  | top of `assets/css/main.css` |

### Adding a book club session

Add an entry under `sessions` in `data/bookclub.yaml`. Sessions use the time and room from the `defaults` block at the top of that file (currently 10:00–11:00 in 28 Informatica 6.W950 Fawcett), so usually a date is enough:

```yaml
  - date: "2026-10-14"
    reading:                             # optional
      title: "Causality, chapter 1"
      authors: "J. Pearl"                # optional
      link: "https://example.org/ch1"    # optional
    presenter: "Name of presenter"
    format: "Presentation"               # or "Discussion", ...
    prepare: "Read sections 1.1–1.3."    # Markdown allowed
```

To change the time or room for one session only:

```yaml
  - date: "2026-10-14T14:00"             # different start time
    end: "15:30"                         # different end time
    location: "Online"                   # different room
    ...
```

- **Times:** times use the `timeZone` in `hugo.toml` (Europe/Amsterdam). A session with a custom start time and no `end` is assumed to last two hours.
- **Sessions without a reading:** for a kick-off or a talk, add `title: "..."` and leave out `reading`. If a session has both a `title` and a `reading`, the reading gets its own "Reading" row on the card.

How the carousel behaves:

- Sessions are sorted by date, so the order in the file doesn't matter.
- The page opens centered on the **current session**: the first one that hasn't ended yet. It stays current *during* the session, so people can still find the link or room. When it ends, the carousel moves on to the next one by itself.
- The visitor's browser decides which session is current, from their own clock. There's no need to rebuild the site when a session passes.
- While the mouse is over one of the session cards, the scroll wheel moves through sessions left and right instead of scrolling the page. Scrolling down goes to later sessions, and scrolling up goes to earlier ones. Past the first or last session, the page scrolls normally again.
- Visitors can also use the arrow buttons, the "Current session" button, the arrow keys, or swipe on touch screens.

### Logo

Save the logo as `assets/images/logo.svg`, or as `logo.png`, `logo.jpg` or `logo.webp`. Only the file name matters. The logo appears next to the site title in the top bar and is also used as the browser-tab icon. On narrow phones the logo sits on its own row above the menu. SVG looks sharpest. The site shrinks other formats automatically. If there's no logo file, the top bar shows only the title.

### Colors

The palette is white, light blue and black. It's defined as variables at the top of `assets/css/main.css`: `--heading` for headings, `--accent` for links, `--bg-alt` for the tinted sections, and `--nav-bg` / `--nav-fg` for the top bar. Change a value there and it updates everywhere.

### Adding a person

Add an entry to the right group in `data/people.yaml`: `supervisors`, `phds` or `other_members`. Only `name` is required. The comments at the top of the file list the other fields.

To add a photo:

1. Put the picture in `assets/images/people/`, for example `assets/images/people/jane-doe.jpg`.
2. Set `photo: "jane-doe.jpg"` on that person in `data/people.yaml`.

Photos can be any size or shape. When the site is built, each one is cropped to a square and shown as a circle of the same size. The crop keeps the top of the picture, where the face usually is, so head-and-shoulders photos work best. People without a photo get a circle with their initials. If a `photo` file name doesn't match a file, the build prints a warning.

### Adding a project

Add an entry to `data/projects.yaml`:

```yaml
- number: "1.1"
  title: "Conditional Exchangeability"   # shown as "Project 1.1: Conditional Exchangeability"
  phd: "Matej Havelka"
  supervisors: ["Jesse Krijthe", "Supervisor A"]
  description: "One or two sentences about the project."
```

Projects appear in the order they're listed in the file. The supervisor area is a fixed grid of three columns and two rows, so every project block is the same size and fits up to six supervisors. Refer to people by their `name` exactly as it appears in `data/people.yaml`: their photos and links come from there. A name that isn't in `people.yaml` is shown with initials, so an initials circle where you expected a photo usually means the name is misspelled.

### Partner logos

The partner institutions in the About section are listed in `data/partners.yaml`. Each entry has a `name`, a `url` and a `logo` file name. Put the logo files in `assets/images/partners/`. SVG is best. A partner whose logo file is missing is shown as its name in a dashed box until the file is added.

### Adding a publication

See the comments at the top of `data/publications.yaml` for the available fields. Only `title` and `year` are required.

## Running locally

Install [Hugo extended](https://gohugo.io/installation/) (v0.146 or newer), then run:

```sh
hugo server
```

Open http://localhost:1313. The page reloads automatically when you edit a file. To produce a production build in `public/`, run:

```sh
hugo --gc --minify
```

## Deployment

`.github/workflows/hugo.yml` builds the site and deploys it to GitHub Pages on every push to `main`, and on manual trigger. To turn it on, go to the repository's **Settings → Pages** and set **Source** to **GitHub Actions**.

## Project structure

```
hugo.toml                 site configuration and navigation menu
content/_index.md         introduction text (About section)
data/                     people, projects, partners, publications and book club sessions
layouts/baseof.html       page skeleton (head, nav, footer)
layouts/home.html         the single page: hero + all sections
layouts/_partials/        one template per section
assets/css/main.css       styling and color palette
assets/images/            logo (logo.svg / logo.png)
assets/images/people/     photos of people (referenced from data/people.yaml)
assets/images/partners/   partner institution logos (referenced from data/partners.yaml)
layouts/_shortcodes/      {{< partners >}} logo row used in content/_index.md
assets/js/bookclub.js     book club carousel (wheel scrolling, current session)
```
