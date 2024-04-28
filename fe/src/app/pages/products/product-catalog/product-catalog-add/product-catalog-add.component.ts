import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastState, UtilsService } from "../../../../@core/services/utils.service";
import { CustomValidator } from "../../../../@core/validators/custom-validator";
import { Catalog } from "../../../../@core/models/product/catalog.model";
import { CatalogService } from "../../../../@core/services/product/product-catalog.service";

@Component({
  selector: "ngx-product-catalog-add",
  templateUrl: "./product-catalog-add.component.html",
  styleUrls: ["./product-catalog-add.component.scss"],
})
export class ProductCatalogAddComponent {

  addCatalogFormGroup: FormGroup;
  uploadedFile: File
  catalogs: Catalog[] = []

  constructor(
    private catalogService: CatalogService,
    private formBuilder: FormBuilder,
    private utilsService: UtilsService,
  ) {
    this.addCatalogFormGroup = this.formBuilder.group({
      name: ['', [CustomValidator.notBlank, Validators.maxLength(100)]],
      description: ['', [CustomValidator.notBlank, Validators.maxLength(500)]],
      parent: [null],
      image: [, [Validators.required]]
    })
    this.catalogService.findAll().subscribe(data => {
      this.catalogs = data.filter(cata => !cata.hasParent)
    })
  }

  selectFile(event: any) {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement.files && inputElement.files.length > 0) {
      this.uploadedFile = inputElement.files[0];
      this.addCatalogFormGroup.get('image').setValue('uploaded')
      const reader = new FileReader();
      reader.onload = (event: any) => {
        this.uploadedFile['dataUrl'] = event.target.result;
      };
      reader.readAsDataURL(this.uploadedFile);
    }
  }

  createCatalog() {

    if (this.addCatalogFormGroup.invalid) {
      this.addCatalogFormGroup.markAllAsTouched();
      this.utilsService.updateToastState(new ToastState('Add Catalog Failed!', "danger"))
      return;
    }

    let catalog: Catalog = new Catalog()
    catalog.catalogName = this.addCatalogFormGroup.get('name').value
    catalog.description = this.addCatalogFormGroup.get('description').value
    catalog.parentCatalog = this.addCatalogFormGroup.get('parent').value
    if(catalog.parentCatalog != null) {
      catalog.parentCatalog = {
        catalogId: catalog.parentCatalog.catalogId,
        catalogName: catalog.parentCatalog.catalogName,
        image: catalog.parentCatalog.image
      }
    }
    console.log(catalog);
    
    this.catalogService.insert(catalog, this.uploadedFile).subscribe(
      data => {
        if (data) {
          this.reset()
          this.catalogService.notifyCatalogChange();
          this.utilsService.updateToastState(new ToastState('Add Catalog Successfully!', "success"))
        }
      }
    )
  }

  reset() {
    this.addCatalogFormGroup.reset();
    this.uploadedFile = null;
  }
}
