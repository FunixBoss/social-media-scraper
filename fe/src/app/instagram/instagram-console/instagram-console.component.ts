import { Component, OnInit } from '@angular/core';
import { InstagramService } from '../instagram.service';

@Component({
  selector: 'app-instagram-console',
  templateUrl: './instagram-console.component.html',
  styleUrls: ['./instagram-console.component.scss']
})
export class InstagramConsoleComponent implements OnInit {
  instagramIcon: string = 'instagram'; // Default icon name

  constructor(private instagramService: InstagramService) { }

  ngOnInit(): void {
    this.fetchData();
  }


  fetchData() {
    const username = 'lapausavienna'; 
    this.instagramService.fetchDataProfile(username)
      .subscribe(
        (data) => {
          console.log(data); 
        },
        (error) => {
          console.error(error); 
        }
      );
  }
}
