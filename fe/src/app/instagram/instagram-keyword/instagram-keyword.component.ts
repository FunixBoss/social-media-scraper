import { Component, OnInit } from '@angular/core';
import { InstagramService } from '../instagram.service';
// import { NzModalModule } from 'ng-zorro-antd/modal';
// import { NzButtonModule } from 'ng-zorro-antd/button';
@Component({
  selector: 'app-instagram-keyword',
  templateUrl: './instagram-keyword.component.html',
  styleUrls: ['./instagram-keyword.component.scss']
})
export class InstagramKeywordComponent implements OnInit {

  selectedKeyword: Keyword = null;

  keywordName: string = '';
  keywordPriority: string = '';
  keywords: Keyword[] = [];

  constructor(private instagramService: InstagramService) { }

  ngOnInit(): void {
    this.findAllKeyword();
  }

  createKeyword() {

    this.instagramService.createKeyword(this.keywordName, this.keywordPriority)
      .subscribe(
        (data) => {
          console.log(data);
        },
        (error) => {
          console.log("loi r");

          console.error(error);
        }
      );
  }

  findAllKeyword() {
    this.instagramService.fethDataKeyword().subscribe(
      (data: any) => {
        console.log(data);
        this.keywords = data.data; // Assign the fetched data to the keywords property
      },
      (error) => {
        console.error(error);
      }
    );
  }


  selectKeyword(keyword): void {
    this.fetchKeywordData(keyword);
    this.selectedKeyword = keyword;
  }

  fetchKeywordData(keyword): void {
    this.instagramService.fetchAllDataKeyword(keyword).subscribe(
      (data: any) => {
        console.log(data);
        this.selectedKeyword = data.data; // Assign the fetched data to the keywords property
      },
      (error) => {
        console.error(error);
      }
    );
  }


  deleteKeyword(keyword) {
    if (confirm('Are you sure you want to delete this keyword?')) {
      this.instagramService.fetchDeleteKeyword(keyword).subscribe(
        () => {
          console.log('ok');
        },
        (error) => {
          console.error('Error deleting keyword', error);
        }
      );
    }
  }
}
