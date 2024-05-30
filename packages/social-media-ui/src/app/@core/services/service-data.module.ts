import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

const SERVICES = [];

@NgModule({
  imports: [
    CommonModule,
  ],
  providers: [
    ...SERVICES,
  ],
})
export class ServiceDataModule {
  static forRoot(): ModuleWithProviders<ServiceDataModule> {
    return {
      ngModule: ServiceDataModule,
      providers: [
        ...SERVICES,
      ],
    };
  }
}
