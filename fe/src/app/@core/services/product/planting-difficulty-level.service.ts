import { GetPlantDifficultyLevelResponse, PlantingDifficultyLevel } from './../../models/product/planting-difficulty-level.model';
import { Injectable } from '@angular/core';
import { BaseURLService } from '../base-url.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs-compat';
import { of, BehaviorSubject, Subject } from 'rxjs';
import { Catalog, GetCatalogResponse } from '../../models/product/catalog.model';

@Injectable({
  providedIn: 'root'
})
export class PlantingDifficultyLevelService {
  constructor(
    private baseUrlService: BaseURLService,
    private httpClient: HttpClient
  ) { }

  findAll(): Observable<GetPlantDifficultyLevelResponse> {
    const url: string = `${this.baseUrlService.baseURL}/planting-difficulty-levels`
    return this.httpClient.get<GetPlantDifficultyLevelResponse>(url)
  }

  findById(catalogId: number): Observable<Catalog> {
    const url: string = `${this.baseUrlService.baseURL}/planting-difficulty-levels/findById/${catalogId}`
    return this.httpClient.get<Catalog>(url)
  }
}
