import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="app-header">
      <a class="brand" routerLink="/">worklog</a>
      <nav aria-label="Main">
        <a routerLink="/projects" routerLinkActive="active">Projects</a>
        <a routerLink="/entries" routerLinkActive="active">Entries</a>
        <a routerLink="/summary" routerLinkActive="active">Summary</a>
      </nav>
    </header>
    <main class="app-main">
      <router-outlet />
    </main>
  `,
  styleUrl: './app.scss',
})
export class App {}
