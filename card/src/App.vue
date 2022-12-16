
<template>
  <div>
      <div class="card">
          <Toolbar class="mb-4">
              <template #start>
                  
              </template>

              <template #end>
                  <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import" class="mr-2 inline-block" />
                  
              </template>
          </Toolbar>

          <DataTable ref="dt" :value="products" v-model:selection="selectedProducts" dataKey="id" 
              :paginator="true" :rows="10" :filters="filters"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" :rowsPerPageOptions="[5,10,25]"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products" responsiveLayout="scroll">
              <template #header>
                  <div class="table-header flex flex-column md:flex-row md:justiify-content-between">
          <h5 class="mb-2 md:m-0 p-as-md-center">Manage Products</h5>
          <span class="p-input-icon-left">
                          <i class="pi pi-search" />
                          <InputText v-model="filters['global'].value" placeholder="Search..." />
                      </span>
        </div>
              </template>

              <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
              <Column field="code" header="Code" :sortable="true" style="min-width:12rem"></Column>
              <Column field="name" header="Name" :sortable="true" style="min-width:16rem"></Column>
              <Column header="Image">
                   <template #body="slotProps">
                      <img src="https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png" :alt="slotProps.data.image" class="product-image" />
                  </template>
              </Column>
              <Column field="price" header="Price" :sortable="true" style="min-width:8rem">
                  <template #body="slotProps">
                      {{formatCurrency(slotProps.data.price)}}
                  </template>
              </Column>
              <Column field="category" header="Category" :sortable="true" style="min-width:10rem"></Column>
              <Column field="rating" header="Reviews" :sortable="true" style="min-width:12rem">
                  <template #body="slotProps">
                     <Rating :modelValue="slotProps.data.rating" :readonly="true" :cancel="false" />
                  </template>
              </Column>
              <Column field="inventoryStatus" header="Status" :sortable="true" style="min-width:12rem">
                  <template #body="slotProps">
                      <span :class="'product-badge status-' + (slotProps.data.inventoryStatus ? slotProps.data.inventoryStatus.toLowerCase() : '')">{{slotProps.data.inventoryStatus}}</span>
                  </template>
              </Column>
              <Column :exportable="false" style="min-width:8rem">
                  <template #body="slotProps">
                      <Button icon="pi pi-eye" class="p-button-rounded p-button-warning mr-2" @click="editProduct(slotProps.data)" />
                      
                  </template>
              </Column>
          </DataTable>
      </div>

      <Dialog v-model:visible="productDialog" :style="{width: '450px'}" header="Product Details" :modal="true" class="p-fluid">
          <img src="https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png" :alt="product.image" class="product-image" v-if="product.image" />
          <div class="field">
              <label for="name">Name</label>
              <InputText id="name" v-model.trim="product.name" required="true" autofocus :class="{'p-invalid': submitted && !product.name}" />
              <small class="p-error" v-if="submitted && !product.name">Name is required.</small>
          </div>
          <div class="field">
              <label for="description">Description</label>
              <Textarea id="description" v-model="product.description" required="true" rows="3" cols="20" />
          </div>

          <div class="field">
      <label for="inventoryStatus" class="mb-3">Inventory Status</label>
      <Dropdown id="inventoryStatus" v-model="product.inventoryStatus" :options="statuses" optionLabel="label" placeholder="Select a Status">
        <template #value="slotProps">
          <div v-if="slotProps.value && slotProps.value.value">
            <span :class="'product-badge status-' +slotProps.value.value">{{slotProps.value.label}}</span>
          </div>
          <div v-else-if="slotProps.value && !slotProps.value.value">
            <span :class="'product-badge status-' +slotProps.value.toLowerCase()">{{slotProps.value}}</span>
          </div>
          <span v-else>
            {{slotProps.placeholder}}
          </span>
        </template>
      </Dropdown>
    </div>

          <div class="field">
              <label class="mb-3">Category</label>
              <div class="formgrid grid">
                  <div class="field-radiobutton col-6">
                      <RadioButton id="category1" name="category" value="Accessories" v-model="product.category" />
                      <label for="category1">Accessories</label>
                  </div>
                  <div class="field-radiobutton col-6">
                      <RadioButton id="category2" name="category" value="Clothing" v-model="product.category" />
                      <label for="category2">Clothing</label>
                  </div>
                  <div class="field-radiobutton col-6">
                      <RadioButton id="category3" name="category" value="Electronics" v-model="product.category" />
                      <label for="category3">Electronics</label>
                  </div>
                  <div class="field-radiobutton col-6">
                      <RadioButton id="category4" name="category" value="Fitness" v-model="product.category" />
                      <label for="category4">Fitness</label>
                  </div>
              </div>
          </div>

          <div class="formgrid grid">
              <div class="field col">
                  <label for="price">Price</label>
                  <InputNumber id="price" v-model="product.price" mode="currency" currency="USD" locale="en-US" />
              </div>
              <div class="field col">
                  <label for="quantity">Quantity</label>
                  <InputNumber id="quantity" v-model="product.quantity" integeronly />
              </div>
          </div>
          <template #footer>
              <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
              <Button label="Export" icon="pi pi-upload" class="p-button-help" @click="exportCSV($event)"  />
          </template>
      </Dialog>

      <Dialog v-model:visible="deleteProductDialog" :style="{width: '450px'}" header="Confirm" :modal="true">
          <div class="confirmation-content">
              <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
              <span v-if="product">Are you sure you want to delete <b>{{product.name}}</b>?</span>
          </div>
          <template #footer>
              <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductDialog = false"/>
              <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteProduct" />
          </template>
      </Dialog>

      <Dialog v-model:visible="deleteProductsDialog" :style="{width: '450px'}" header="Confirm" :modal="true">
          <div class="confirmation-content">
              <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
              <span v-if="product">Are you sure you want to delete the selected products?</span>
          </div>
          <template #footer>
              <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductsDialog = false"/>
              <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSelectedProducts" />
          </template>
      </Dialog>
</div>
</template>

<script>
import { FilterMatchMode } from 'primevue/api';
import ProductService from './service/ProductService';

export default {
  data() {
      return {
          products: null,
          productDialog: false,
          deleteProductDialog: false,
          deleteProductsDialog: false,
          product: {},
          selectedProducts: null,
          filters: {},
          submitted: false,
          statuses: [
      {label: 'INSTOCK', value: 'instock'},
      {label: 'LOWSTOCK', value: 'lowstock'},
      {label: 'OUTOFSTOCK', value: 'outofstock'}
          ]
      }
  },
  productService: null,
  created() {
      this.productService = new ProductService();
      this.initFilters();
  },
  mounted() {
      this.productService.getProducts().then(data => this.products = data);
  },
  methods: {
      formatCurrency(value) {
          if(value)
      return value.toLocaleString('en-US', {style: 'currency', currency: 'USD'});
    return;
      },
      openNew() {
          this.product = {};
          this.submitted = false;
          this.productDialog = true;
      },
      hideDialog() {
          this.productDialog = false;
          this.submitted = false;
      },
      saveProduct() {
          this.submitted = true;

    if (this.product.name.trim()) {
              if (this.product.id) {
                  this.product.inventoryStatus = this.product.inventoryStatus.value ? this.product.inventoryStatus.value: this.product.inventoryStatus;
                  this.products[this.findIndexById(this.product.id)] = this.product;
                  this.$toast.add({severity:'success', summary: 'Successful', detail: 'Product Updated', life: 3000});
              }
              else {
                  this.product.id = this.createId();
                  this.product.code = this.createId();
                  this.product.image = 'product-placeholder.svg';
                  this.product.inventoryStatus = this.product.inventoryStatus ? this.product.inventoryStatus.value : 'INSTOCK';
                  this.products.push(this.product);
                  this.$toast.add({severity:'success', summary: 'Successful', detail: 'Product Created', life: 3000});
              }

              this.productDialog = false;
              this.product = {};
          }
      },
      editProduct(product) {
          this.product = {...product};
          this.productDialog = true;
      },
      confirmDeleteProduct(product) {
          this.product = product;
          this.deleteProductDialog = true;
      },
      deleteProduct() {
          this.products = this.products.filter(val => val.id !== this.product.id);
          this.deleteProductDialog = false;
          this.product = {};
          this.$toast.add({severity:'success', summary: 'Successful', detail: 'Product Deleted', life: 3000});
      },
      findIndexById(id) {
          let index = -1;
          for (let i = 0; i < this.products.length; i++) {
              if (this.products[i].id === id) {
                  index = i;
                  break;
              }
          }

          return index;
      },
      createId() {
          let id = '';
          var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          for ( var i = 0; i < 5; i++ ) {
              id += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return id;
      },
      exportCSV() {
          this.$refs.dt.exportCSV();
      },
      confirmDeleteSelected() {
          this.deleteProductsDialog = true;
      },
      deleteSelectedProducts() {
          this.products = this.products.filter(val => !this.selectedProducts.includes(val));
          this.deleteProductsDialog = false;
          this.selectedProducts = null;
          this.$toast.add({severity:'success', summary: 'Successful', detail: 'Products Deleted', life: 3000});
      },
      initFilters() {
          this.filters = {
              'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
          }
      }
  }
}
</script>

<style lang="scss" scoped>
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media screen and (max-width: 960px) {
      align-items: start;
}
}

.product-image {
  width: 50px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

.p-dialog .product-image {
  width: 50px;
  margin: 0 auto 2rem auto;
  display: block;
}

.confirmation-content {
  display: flex;
  align-items: center;
  justify-content: center;
}
@media screen and (max-width: 960px) {
::v-deep(.p-toolbar) {
  flex-wrap: wrap;
      
  .p-button {
          margin-bottom: 0.25rem;
      }
}
}
</style>
