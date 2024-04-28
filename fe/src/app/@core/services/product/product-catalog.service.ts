import { Injectable } from '@angular/core';
import { BaseURLService } from '../base-url.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs-compat';
import { of, BehaviorSubject, Subject } from 'rxjs';
import { Catalog, GetCatalogResponse } from '../../models/product/catalog.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  // change between add & edit form
  private stateSubject: BehaviorSubject<string> = new BehaviorSubject<string>('add');
  private rowDataSubject: BehaviorSubject<Catalog> = new BehaviorSubject<Catalog>(null);

  public state$: Observable<string> = this.stateSubject.asObservable();
  public rowData$: Observable<any> = this.rowDataSubject.asObservable();

  updateHandleAndRowData(state: string, rowData?: any) {
    this.stateSubject.next(state);
    if (rowData != undefined) {
      this.rowDataSubject.next(rowData as Catalog);
    }
  }

  // for changing when create, edit, delete => reload
  private catalogChangeSubject = new Subject<void>();
  get catalogChange$(): Observable<void> {
    return this.catalogChangeSubject.asObservable();
  }
  notifyCatalogChange(): void {
    this.catalogChangeSubject.next();
  }

  constructor(
    private baseUrlService: BaseURLService,
    private httpClient: HttpClient
  ) { }

  findAll(): Observable<Catalog[]> {
    const url: string = `${this.baseUrlService.baseURL}/catalogs/findAll`
    return this.httpClient.get<Catalog[]>(url)
  }

  findById(catalogId: number): Observable<Catalog> {
    const url: string = `${this.baseUrlService.baseURL}/catalogs/findById/${catalogId}`
    return this.httpClient.get<Catalog>(url)
  }

  insert(catalog: Catalog, uploadFile: File): Observable<boolean> {
    let formData: FormData = new FormData();
    formData.append('catalog', JSON.stringify(catalog));
    formData.append('imageFile', uploadFile);


    const url: string = `${this.baseUrlService.baseURL}/catalogs/create`
    return this.httpClient.post<boolean>(url, formData);
  }

  update(catalog: Catalog, uploadFile?: File): Observable<boolean> {
    catalog.parentCatalog = {
      catalogId: catalog.parentCatalog.catalogId,
      catalogName: catalog.parentCatalog.catalogName,
      image: catalog.parentCatalog.image
    }
    let formData: FormData = new FormData();
    formData.append('catalog', JSON.stringify(catalog));
    if (uploadFile != null) {
      formData.append('imageFile', uploadFile);
    }

    const url: string = `${this.baseUrlService.baseURL}/catalogs/update`
    return this.httpClient.put<boolean>(url, formData);
  }

  delete(catalogId: number): Observable<boolean> {
    const url: string = `${this.baseUrlService.baseURL}/catalogs/delete/${catalogId}`
    return this.httpClient.delete<boolean>(url);
  }

  deleteCatalogs(catalogs: Catalog[]): Observable<boolean> {
    const url: string = `${this.baseUrlService.baseURL}/catalogs/delete-catalogs`
    return this.httpClient.post<boolean>(url, catalogs);
  }

  flattenCatalogs(catalogs, parent = null) {
    const flattened = [];

    catalogs.forEach(catalog => {
      const flatCatalog = {
        catalogId: catalog.catalogId,
        catalogName: catalog.catalogName,
        description: catalog.description,
        image: {
          imageId: catalog.image.imageId,
          imageUrl: catalog.image.imageUrl
        },
        hasParent: catalog.hasParent,
        parentCatalog: parent
      };

      flattened.push(flatCatalog);

      if (catalog.childCatalogs.length > 0) {
        const childFlattened = this.flattenCatalogs(catalog.childCatalogs, catalog.catalogId);
        flattened.push(...childFlattened);
      }
    });

    return flattened;
  }
}
