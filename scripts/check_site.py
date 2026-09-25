#!/usr/bin/env python3
"""Dependency-free quality gate for the RED SEA READY static site."""

from __future__ import annotations

import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
IGNORED_SCHEMES = {"data", "http", "https", "mailto", "tel"}


class PageParser(HTMLParser):
    def __init__(self, page: Path) -> None:
        super().__init__(convert_charrefs=True)
        self.page = page
        self.errors: list[str] = []
        self.references: list[tuple[str, str, int]] = []
        self.ids: dict[str, int] = {}
        self.html_count = 0
        self.lang = ""
        self.h1_count = 0
        self.doctype_seen = False

    def error(self, message: str, line: int | None = None) -> None:
        self.errors.append(f"{self.page.relative_to(ROOT)}:{line or self.getpos()[0]}: {message}")

    def handle_decl(self, decl: str) -> None:
        if decl.strip().lower() == "doctype html":
            self.doctype_seen = True

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        line = self.getpos()[0]

        if tag == "html":
            self.html_count += 1
            self.lang = (values.get("lang") or "").strip()
        if tag == "h1":
            self.h1_count += 1
        if tag == "img":
            alt = values.get("alt")
            if alt is None or not alt.strip():
                self.error("billedet mangler en beskrivende alt-tekst", line)

        element_id = (values.get("id") or "").strip()
        if element_id:
            if element_id in self.ids:
                self.error(f"dubleret id '{element_id}' (først på linje {self.ids[element_id]})", line)
            else:
                self.ids[element_id] = line

        for attribute in ("href", "src"):
            value = (values.get(attribute) or "").strip()
            if value:
                self.references.append((attribute, value, line))


def parse_page(page: Path) -> PageParser:
    parser = PageParser(page)
    try:
        parser.feed(page.read_text(encoding="utf-8"))
        parser.close()
    except (UnicodeDecodeError, ValueError) as exc:
        parser.error(f"kan ikke parses som UTF-8 HTML: {exc}", 1)
    if not parser.doctype_seen:
        parser.error("mangler <!doctype html>", 1)
    if parser.html_count != 1:
        parser.error(f"forventede ét html-element, fandt {parser.html_count}", 1)
    if not parser.lang:
        parser.error("html-elementet mangler lang-attribut", 1)
    if parser.h1_count != 1:
        parser.error(f"forventede præcis én h1, fandt {parser.h1_count}", 1)
    return parser


def local_target(page: Path, reference: str) -> tuple[Path | None, str]:
    parsed = urlsplit(reference)
    if parsed.scheme.lower() in IGNORED_SCHEMES or parsed.netloc:
        return None, ""
    raw_path = unquote(parsed.path)
    if not raw_path:
        return page, unquote(parsed.fragment)
    target = (page.parent / raw_path).resolve()
    try:
        target.relative_to(ROOT)
    except ValueError:
        return Path("/__outside_site__"), unquote(parsed.fragment)
    if raw_path.endswith("/"):
        target /= "index.html"
    return target, unquote(parsed.fragment)


def main() -> int:
    pages = sorted(ROOT.glob("*.html"))
    errors: list[str] = []
    if not pages:
        errors.append("ingen HTML-filer fundet i projektroden")

    parsed_pages = {page.resolve(): parse_page(page) for page in pages}
    for parser in list(parsed_pages.values()):
        errors.extend(parser.errors)
        for attribute, reference, line in parser.references:
            target, fragment = local_target(parser.page, reference)
            if target is None:
                continue
            if target == Path("/__outside_site__"):
                errors.append(
                    f"{parser.page.relative_to(ROOT)}:{line}: {attribute} forlader projektmappen: {reference}"
                )
                continue
            if not target.exists():
                errors.append(
                    f"{parser.page.relative_to(ROOT)}:{line}: lokal {attribute}-reference findes ikke: {reference}"
                )
                continue
            if fragment and target.suffix.lower() == ".html":
                target_parser = parsed_pages.get(target.resolve())
                if target_parser is None:
                    target_parser = parse_page(target)
                    parsed_pages[target.resolve()] = target_parser
                    errors.extend(target_parser.errors)
                if fragment not in target_parser.ids:
                    errors.append(
                        f"{parser.page.relative_to(ROOT)}:{line}: fragment '#{fragment}' findes ikke i "
                        f"{target.relative_to(ROOT)}"
                    )

    if errors:
        print("Site quality check failed:\n")
        for error in errors:
            print(f"- {error}")
        return 1

    print(
        f"Site quality check passed: {len(pages)} HTML-filer, gyldige lokale referencer, "
        "lang, én h1 pr. side og alt-tekster."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
