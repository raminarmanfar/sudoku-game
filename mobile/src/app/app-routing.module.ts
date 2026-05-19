import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: 'game',
    loadChildren: () => import('./pages/game/game.module').then((m) => m.GamePageModule),
  },
  {
    path: 'leaderboard',
    loadChildren: () => import('./pages/leaderboard/leaderboard.module').then((m) => m.LeaderboardPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
