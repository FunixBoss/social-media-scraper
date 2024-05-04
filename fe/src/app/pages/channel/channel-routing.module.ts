import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChannelComponent } from './channel.component';
import { ChannelReelsListComponent } from './channel-reels/channel-reels.component';
import { ChannelListComponent } from './channel-list/channel-list.component';
import { ChannelPostsListComponent } from './channel-posts/channel-posts.component';
import { ChannelScrapeComponent } from './channel-scrape/channel-scrape.component';
import { ChannelDownloadListComponent } from './channel-download/channel-download.component';

const routes: Routes = [{
  path: '',
  component: ChannelComponent,
  children: [
    {
      path: 'list',
      component: ChannelListComponent,
    },
    {
      path: 'scrape',
      component: ChannelScrapeComponent,
    },
    {
      path: 'posts/:username',
      component: ChannelPostsListComponent,
    },
    {
      path: 'reels/:username',
      component: ChannelReelsListComponent,
    },
    {
      path: 'downloads/:username',
      component: ChannelDownloadListComponent,
    }, 
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChannelsRoutingModule { }

export const routedComponents = [
  ChannelComponent,
  ChannelListComponent,
  ChannelPostsListComponent,
  ChannelReelsListComponent,
  ChannelScrapeComponent,
  ChannelDownloadListComponent
];
