import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChannelComponent } from './channel.component';
import { ChannelReelsListComponent } from './channel-reels/channel-reels.component';
import { ChannelListComponent } from './channel-list/channel-list.component';
import { ChannelPostsListComponent } from './channel-posts/channel-posts.component';
import { ChannelFriendshipsComponent } from './channel-friendships/channel-friendships.component';

const routes: Routes = [{
  path: '',
  component: ChannelComponent,
  children: [
    {
      path: 'list',
      component: ChannelListComponent,
    },
    // {
    //   path: 'add',
    //   component: ChannelAddComponent,
    // },
    {
      path: 'posts/:username',
      component: ChannelPostsListComponent,
    },
    {
      path: 'reels/:username',
      component: ChannelReelsListComponent,
    },
    {
      path: 'friendships/:username',
      component: ChannelFriendshipsComponent,
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
  ChannelFriendshipsComponent
];
