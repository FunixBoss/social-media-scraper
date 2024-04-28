import { Input, OnInit } from '@angular/core';
import { Component, ElementRef, Renderer2 } from '@angular/core';

@Component({
    selector: 'ngx-images-carousel',
    template: `
    <div id="carouselExample" class="carousel slide" data-ride="carousel" #carousel>
        <ol class="carousel-indicators">
            <li li *ngFor="let url of urls; let i = index" [class.active]="i === activeSlideIndex"
                [attr.data-target]="'#carouselExample'" [attr.data-slide-to]="i"></li>
        </ol>
        <div class="carousel-inner">
            <div class="carousel-item" *ngFor="let url of urls; let i = index"
                [class.active]="i === activeSlideIndex">
                <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
                    <img [src]="url" class="d-block w-100" alt="Slide Image" style="max-height: 290px; object-fit: contain">
                </div>
            </div>
        </div>
        <a class="carousel-control-prev" (click)="prevSlide(carousel)" role="button" data-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="sr-only">Previous</span>
        </a>
        <a class="carousel-control-next" (click)="nextSlide(carousel)" role="button" data-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="sr-only">Next</span>
        </a>
    </div>
    `,
})
export class ImagesCarouselComponent implements OnInit {
    @Input() urls: string[] = []
    @Input() imgHeight: number = null
    activeSlideIndex = 0;

    constructor(private elementRef: ElementRef, private renderer: Renderer2) { }

    ngOnInit(): void {
        if (this.imgHeight != null) {
            setTimeout(() => {
                this.setMaximumHeight(this.imgHeight);
            });
        }
    }

    show(urls: string[]): void {
        this.urls = urls
    }

    setMaximumHeight(imgHeight: number) {
        const imageElement: HTMLImageElement = this.elementRef.nativeElement.querySelector('img');

        this.renderer.setStyle(imageElement, 'height', imgHeight + 'px');
        this.renderer.setStyle(imageElement, 'width', 'auto');
    }


    prevSlide(carousel: any): void {
        this.activeSlideIndex = (this.activeSlideIndex - 1 + this.urls.length) % this.urls.length;
    }

    nextSlide(carousel: any): void {
        this.activeSlideIndex = (this.activeSlideIndex + 1) % this.urls.length;
    }

}
