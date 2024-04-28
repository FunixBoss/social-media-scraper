import { CATALOG_IMAGE_DIRECTORY } from '../../../../@core/utils/image-storing-directory';
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastState, UtilsService } from "../../../../@core/services/utils.service";
import { CustomValidator } from "../../../../@core/validators/custom-validator";
import { CatalogService } from "../../../../@core/services/product/product-catalog.service";
import { Catalog } from "../../../../@core/models/product/catalog.model";
import { forkJoin } from "rxjs";

@Component({
  selector: "ngx-product-catalog-edit",
  templateUrl: "./product-catalog-edit.component.html",
  styleUrls: ["./product-catalog-edit.component.scss"],
})
export class ProductCatalogEditComponent implements OnInit {

  editCatalogFormGroup: FormGroup;
  uploadedFile: File = null
  isSelectedFile: boolean = false;
  catalogs = []
  isShowParent: boolean = false;

  constructor(
    private catalogService: CatalogService,
    private formBuilder: FormBuilder,
    private utilsService: UtilsService,
  ) {
    this.editCatalogFormGroup = this.formBuilder.group({
      id: [],
      name: ['', [CustomValidator.notBlank, Validators.maxLength(100)]],
      description: ['', [CustomValidator.notBlank, Validators.maxLength(500)]],
      parent: [null],
      image: [, [Validators.required]]
    })
  }

  ngOnInit() {
    console.log("init");

    this.catalogService.rowData$.subscribe((catalogId) => {
      if (catalogId) {
        this.editCatalogFormGroup.get('id').setValue(catalogId);
        const catalogs$ = this.catalogService.findAll();
        const catalog$ = this.catalogService.findById(+catalogId);

        forkJoin([catalogs$, catalog$]).subscribe(
          ([catalogsData, catalogData]) => {
            if (this.catalogs.length == 0) {
              this.catalogs = catalogsData.filter(cata => !cata.hasParent)
            }

            if (catalogData.parentCatalog != null) {
              const parentCata = this.catalogs.find(cata => cata.catalogId == catalogData.parentCatalog.catalogId)
              this.editCatalogFormGroup.get('parent').setValue(parentCata)

              this.isShowParent = true
            } else {
              this.editCatalogFormGroup.get('parent').setValue(null)
              this.isShowParent = (catalogData.childCatalogs.length == 0)
            }

            this.editCatalogFormGroup.get('name').setValue(catalogData.catalogName)
            this.editCatalogFormGroup.get('description').setValue(catalogData.description)
            this.editCatalogFormGroup.get('image').setValue(CATALOG_IMAGE_DIRECTORY + catalogData.image.imageUrl)
            console.log(this.editCatalogFormGroup.get('image').value);
            
          }
        )
      }
    });
  }

  fillFormValues() { }

  selectFile(event: any) {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement.files && inputElement.files.length > 0) {
      this.isSelectedFile = true

      this.uploadedFile = inputElement.files[0];
      this.editCatalogFormGroup.get('image').setValue('uploaded')
      const reader = new FileReader();
      reader.onload = (event: any) => {
        this.uploadedFile['dataUrl'] = event.target.result;
      };
      reader.readAsDataURL(this.uploadedFile);
    }
  }

  editCatalog() {
    if (this.editCatalogFormGroup.invalid) {
      this.editCatalogFormGroup.markAllAsTouched();
      this.utilsService.updateToastState(new ToastState('Edit Catalog Failed!', 'danger'))
      return;
    }

    let catalog: Catalog = new Catalog()
    catalog.catalogId = this.editCatalogFormGroup.get('id').value
    catalog.catalogName = this.editCatalogFormGroup.get('name').value
    catalog.description = this.editCatalogFormGroup.get('description').value
    catalog.parentCatalog = this.editCatalogFormGroup.get('parent').value
    console.log(catalog);

    this.catalogService.update(catalog, this.uploadedFile).subscribe(
      data => {
        if (data) {
          this.utilsService.updateToastState(new ToastState('Edit Catalog Successfully!', "success"))
          this.catalogService.updateHandleAndRowData('add');
          this.catalogService.notifyCatalogChange();
        }
      },
      error => {
        console.log(error)
        this.utilsService.updateToastState(new ToastState('Edit Catalog Failed!', "danger"))
      }
    )
  }

}
