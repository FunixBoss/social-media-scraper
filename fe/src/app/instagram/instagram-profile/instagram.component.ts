import { Component, OnInit } from '@angular/core';
import { InstagramService } from '../instagram.service';

@Component({
  selector: 'app-instagram',
  templateUrl: './instagram.component.html',
  styleUrls: ['./instagram.component.scss']
})
export class InstagramComponent implements OnInit {
  profileData: any; // Assuming this will hold the fetched profile data

  constructor(private instagramService: InstagramService) { }

  ngOnInit(): void {
    this.fetchProfileData('_javadeveloper'); // Replace 'your-channel-name' with the actual channel name
  }

  fetchProfileData(channel: string) {
    this.instagramService.fetchDataChannels(channel)
      .subscribe((data: any) => {
        console.log(data);

        // this.profileData = data.data; // Assuming the relevant data is stored under 'data' key
      });
  }
}
